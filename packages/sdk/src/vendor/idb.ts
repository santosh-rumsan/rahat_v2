import type { Vendor, CreateVendorInput, UpdateVendorInput } from '../types/vendor.js'
import type { VendorService } from './service.js'
import { openDb } from '../db.js'

const STORE_NAME = 'vendors'

export const idbVendorService: VendorService = {
  async list() {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result as Vendor[])
      req.onerror = () => reject(req.error)
    })
  },

  async get(id) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const req = store.get(id)
      req.onsuccess = () => resolve((req.result as Vendor | undefined) ?? undefined)
      req.onerror = () => reject(req.error)
    })
  },

  async create(data: CreateVendorInput) {
    const db = await openDb()
    const vendor: Vendor = { id: `vnd_${crypto.randomUUID()}`, ...data }
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      store.add(vendor)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
    return vendor
  },

  async update(id, data: UpdateVendorInput) {
    const db = await openDb()
    const existing = await idbVendorService.get(id)
    if (!existing) throw new Error(`Vendor ${id} not found`)
    const updated: Vendor = { ...existing, ...data, id }
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
