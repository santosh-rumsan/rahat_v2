import type { Token, CreateTokenInput, UpdateTokenInput } from '../types/benefit.js'
import type { TokenService } from './service.js'
import { openDb } from '../db.js'

const STORE_NAME = 'tokens'

interface IDBToken extends Token {
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

export const idbTokenService: TokenService = {
  async list(projectId) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const req = store.index('by_project').getAll(projectId)
      req.onsuccess = () => {
        const results = (req.result as IDBToken[]).map(({ projectId: _pid, ...t }) => t)
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
        const record = req.result as IDBToken | undefined
        if (!record || record.projectId !== projectId) return resolve(undefined)
        const { projectId: _pid, ...t } = record
        resolve(t)
      }
      req.onerror = () => reject(req.error)
    })
  },

  async create(projectId, data: CreateTokenInput) {
    const db = await openDb()
    const token: IDBToken = {
      id: `token_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ...data,
      projectId,
    }
    await tx(db, 'readwrite', (store) => store.add(token))
    const { projectId: _pid, ...result } = token
    return result
  },

  async update(projectId, id, data: UpdateTokenInput) {
    const db = await openDb()
    const existing = await idbTokenService.get(projectId, id)
    if (!existing) throw new Error(`Token ${id} not found`)
    const updated: IDBToken = { ...existing, ...data, id, projectId }
    await tx(db, 'readwrite', (store) => store.put(updated))
    const { projectId: _pid, ...result } = updated
    return result
  },

  async delete(projectId, id) {
    const db = await openDb()
    const existing = await idbTokenService.get(projectId, id)
    if (!existing) return
    await tx(db, 'readwrite', (store) => store.delete(id))
  },
}
