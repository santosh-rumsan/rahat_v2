import type { Beneficiary, CreateBeneficiaryInput, UpdateBeneficiaryInput } from '../types/beneficiary.js'
import type { BeneficiaryService } from './service.js'

const DB_NAME = 'rahat-db'
const DB_VERSION = 1
const STORE_NAME = 'beneficiaries'

interface IDBBeneficiary extends Beneficiary {
  projectId: string
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('by_project', 'projectId', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function tx(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest | void
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode)
    const store = transaction.objectStore(STORE_NAME)
    const req = fn(store)
    transaction.oncomplete = () => resolve(req ? req.result : undefined)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

export const idbBeneficiaryService: BeneficiaryService = {
  async list(projectId) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('by_project')
      const req = index.getAll(projectId)
      req.onsuccess = () => {
        const results = (req.result as IDBBeneficiary[]).map(({ projectId: _pid, ...b }) => b)
        resolve(results)
      }
      req.onerror = () => reject(req.error)
    })
  },

  async get(projectId, id) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const req = store.get(id)
      req.onsuccess = () => {
        const record = req.result as IDBBeneficiary | undefined
        if (!record || record.projectId !== projectId) return resolve(undefined)
        const { projectId: _pid, ...b } = record
        resolve(b)
      }
      req.onerror = () => reject(req.error)
    })
  },

  async create(projectId, data) {
    const db = await openDb()
    const beneficiary: IDBBeneficiary = {
      id: `bfn${Date.now()}`,
      enrolledDate: data.enrolledDate ?? new Date().toISOString().split('T')[0]!,
      ...data,
      projectId,
    }
    await tx(db, 'readwrite', (store) => store.add(beneficiary))
    const { projectId: _pid, ...result } = beneficiary
    return result
  },

  async update(projectId, id, data) {
    const db = await openDb()
    const existing = await idbBeneficiaryService.get(projectId, id)
    if (!existing) throw new Error(`Beneficiary ${id} not found`)
    const updated: IDBBeneficiary = { ...existing, ...data, id, projectId }
    await tx(db, 'readwrite', (store) => store.put(updated))
    const { projectId: _pid, ...result } = updated
    return result
  },

  async delete(projectId, id) {
    const db = await openDb()
    const existing = await idbBeneficiaryService.get(projectId, id)
    if (!existing) return
    await tx(db, 'readwrite', (store) => store.delete(id))
  },
}
