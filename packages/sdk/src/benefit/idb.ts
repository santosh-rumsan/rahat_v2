import type { Benefit, CreateBenefitInput, UpdateBenefitInput } from '../types/benefit.js'
import type { BenefitService } from './service.js'
import { openDb } from '../db.js'

const STORE_NAME = 'benefits'

interface IDBBenefit extends Benefit {
  projectId: string
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

export const idbBenefitService: BenefitService = {
  async list(projectId) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const req = store.index('by_project').getAll(projectId)
      req.onsuccess = () => {
        const results = (req.result as IDBBenefit[]).map(({ projectId: _pid, ...b }) => b)
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
        const record = req.result as IDBBenefit | undefined
        if (!record || record.projectId !== projectId) return resolve(undefined)
        const { projectId: _pid, ...b } = record
        resolve(b)
      }
      req.onerror = () => reject(req.error)
    })
  },

  async create(projectId, data: CreateBenefitInput) {
    const db = await openDb()
    const benefit: IDBBenefit = {
      id: `benefit_${Date.now()}`,
      ...data,
      projectId,
    }
    await tx(db, 'readwrite', (store) => store.add(benefit))
    const { projectId: _pid, ...result } = benefit
    return result
  },

  async update(projectId, id, data: UpdateBenefitInput) {
    const db = await openDb()
    const existing = await idbBenefitService.get(projectId, id)
    if (!existing) throw new Error(`Benefit ${id} not found`)
    const updated: IDBBenefit = { ...existing, ...data, id, projectId }
    await tx(db, 'readwrite', (store) => store.put(updated))
    const { projectId: _pid, ...result } = updated
    return result
  },

  async delete(projectId, id) {
    const db = await openDb()
    const existing = await idbBenefitService.get(projectId, id)
    if (!existing) return
    await tx(db, 'readwrite', (store) => store.delete(id))
  },
}
