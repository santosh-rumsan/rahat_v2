import type { ForecastSource, CreateForecastSourceInput, UpdateForecastSourceInput } from '../types/forecast.js'
import type { ForecastSourceService } from './service.js'
import { openDb } from '../db.js'

const STORE_NAME = 'forecast_sources'

export const idbForecastSourceService: ForecastSourceService = {
  async list() {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).getAll()
      req.onsuccess = () => resolve(req.result as ForecastSource[])
      req.onerror = () => reject(req.error)
    })
  },

  async get(id) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(id)
      req.onsuccess = () => resolve((req.result as ForecastSource | undefined) ?? undefined)
      req.onerror = () => reject(req.error)
    })
  },

  async create(data: CreateForecastSourceInput) {
    // If an id is provided, skip silently if it already exists
    if (data.id) {
      const existing = await idbForecastSourceService.get(data.id)
      if (existing) return existing
    }
    const db = await openDb()
    const source: ForecastSource = {
      id: data.id ?? `fcs_${Date.now()}`,
      name: data.name,
      sourceType: data.sourceType,
      url: data.url,
      method: data.method ?? 'POST',
      headers: data.headers ?? {},
      body: data.body ?? {},
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).add(source)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    return source
  },

  async update(id, data: UpdateForecastSourceInput) {
    const db = await openDb()
    const existing = await idbForecastSourceService.get(id)
    if (!existing) throw new Error(`ForecastSource ${id} not found`)
    const updated: ForecastSource = { ...existing, ...data, id, updatedAt: new Date().toISOString() }
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

  async fetchData(id) {
    const source = await idbForecastSourceService.get(id)
    if (!source) throw new Error(`ForecastSource ${id} not found`)
    const init: RequestInit = {
      method: source.method,
      headers: source.headers as Record<string, string>,
    }
    if (source.method !== 'GET' && Object.keys(source.body).length > 0) {
      init.body = JSON.stringify(source.body)
      ;(init.headers as Record<string, string>)['Content-Type'] = 'application/json'
    }
    const res = await fetch(source.url, init)
    if (!res.ok) throw new Error(`Fetch error ${res.status}: ${await res.text()}`)
    return res.json()
  },
}
