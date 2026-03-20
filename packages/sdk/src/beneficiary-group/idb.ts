import type { BeneficiaryGroup } from '../types/beneficiary.js'
import type { BeneficiaryGroupService, CreateBeneficiaryGroupInput, UpdateBeneficiaryGroupInput } from './service.js'
import { openDb } from '../db.js'

const STORE_NAME = 'beneficiary_groups'

interface IDBBeneficiaryGroup extends BeneficiaryGroup {
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

export const idbBeneficiaryGroupService: BeneficiaryGroupService = {
  async list(projectId) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const req = store.index('by_project').getAll(projectId)
      req.onsuccess = () => {
        const results = (req.result as IDBBeneficiaryGroup[]).map(({ projectId: _pid, ...g }) => g)
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
        const record = req.result as IDBBeneficiaryGroup | undefined
        if (!record || record.projectId !== projectId) return resolve(undefined)
        const { projectId: _pid, ...g } = record
        resolve(g)
      }
      req.onerror = () => reject(req.error)
    })
  },

  async create(projectId, data: CreateBeneficiaryGroupInput) {
    const db = await openDb()
    const group: IDBBeneficiaryGroup = {
      id: `grp_${Date.now()}`,
      ...data,
      projectId,
    }
    await tx(db, 'readwrite', (store) => store.add(group))
    const { projectId: _pid, ...result } = group
    return result
  },

  async update(projectId, id, data: UpdateBeneficiaryGroupInput) {
    const db = await openDb()
    const existing = await idbBeneficiaryGroupService.get(projectId, id)
    if (!existing) throw new Error(`BeneficiaryGroup ${id} not found`)
    const updated: IDBBeneficiaryGroup = { ...existing, ...data, id, projectId }
    await tx(db, 'readwrite', (store) => store.put(updated))
    const { projectId: _pid, ...result } = updated
    return result
  },

  async delete(projectId, id) {
    const db = await openDb()
    const existing = await idbBeneficiaryGroupService.get(projectId, id)
    if (!existing) return
    await tx(db, 'readwrite', (store) => store.delete(id))
  },
}
