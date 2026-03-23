import type { Service, CreateServiceInput, UpdateServiceInput } from '../types/service.js'
import type { ServiceService } from './service.js'
import { openDb } from '../db.js'

const STORE_NAME = 'services'

export const idbServiceService: ServiceService = {
  async list() {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).getAll()
      req.onsuccess = () => resolve(req.result as Service[])
      req.onerror = () => reject(req.error)
    })
  },

  async get(id) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(id)
      req.onsuccess = () => resolve((req.result as Service | undefined) ?? undefined)
      req.onerror = () => reject(req.error)
    })
  },

  async create(data: CreateServiceInput) {
    if (data.id) {
      const existing = await idbServiceService.get(data.id)
      if (existing) return existing
    }

    // If enabling this service, disable others of the same type
    if (data.isEnabled !== false) {
      const all = await idbServiceService.list()
      const db = await openDb()
      for (const s of all) {
        if (s.serviceType === data.serviceType && s.isEnabled) {
          const updated: Service = { ...s, isEnabled: false, updatedAt: new Date().toISOString() }
          await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite')
            tx.objectStore(STORE_NAME).put(updated)
            tx.oncomplete = () => resolve()
            tx.onerror = () => reject(tx.error)
            tx.onabort = () => reject(tx.error)
          })
        }
      }
    }

    const db = await openDb()
    const service: Service = {
      id: data.id ?? `svc_${Date.now()}`,
      name: data.name,
      serviceType: data.serviceType,
      url: data.url,
      method: data.method ?? 'POST',
      headers: data.headers ?? {},
      body: data.body ?? {},
      isEnabled: data.isEnabled ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).add(service)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    return service
  },

  async update(id, data: UpdateServiceInput) {
    const existing = await idbServiceService.get(id)
    if (!existing) throw new Error(`Service ${id} not found`)

    // If enabling this service, disable others of the same type first
    const targetType = data.serviceType ?? existing.serviceType
    if (data.isEnabled === true) {
      const all = await idbServiceService.list()
      const db = await openDb()
      for (const s of all) {
        if (s.id !== id && s.serviceType === targetType && s.isEnabled) {
          const updated: Service = { ...s, isEnabled: false, updatedAt: new Date().toISOString() }
          await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite')
            tx.objectStore(STORE_NAME).put(updated)
            tx.oncomplete = () => resolve()
            tx.onerror = () => reject(tx.error)
            tx.onabort = () => reject(tx.error)
          })
        }
      }
    }

    const db = await openDb()
    const updated: Service = { ...existing, ...data, id, updatedAt: new Date().toISOString() }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(updated)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    return updated
  },

  async delete(id) {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  },
}
