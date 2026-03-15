import type { User, CreateUserInput, UpdateUserInput } from '../types/user.js'
import type { UserService } from './service.js'
import { openDb } from '../db.js'

const STORE_NAME = 'users'

export const idbUserService: UserService = {
  async list() {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result as User[])
      req.onerror = () => reject(req.error)
    })
  },

  async get(id) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const req = store.get(id)
      req.onsuccess = () => resolve((req.result as User | undefined) ?? undefined)
      req.onerror = () => reject(req.error)
    })
  },

  async create(data: CreateUserInput) {
    const db = await openDb()
    const id = `usr_${Date.now()}`
    const user: User = {
      id,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ...data,
      avatar: data.avatar || `https://i.pravatar.cc/150?u=${id}`,
    }
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      store.add(user)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
    return user
  },

  async update(id, data: UpdateUserInput) {
    const db = await openDb()
    const existing = await idbUserService.get(id)
    if (!existing) throw new Error(`User ${id} not found`)
    const updated: User = { ...existing, ...data, id, avatar: data.avatar || existing.avatar || `https://i.pravatar.cc/150?u=${id}` }
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      store.put(updated)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
    return updated
  },

  async delete(id) {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      store.delete(id)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  },
}
