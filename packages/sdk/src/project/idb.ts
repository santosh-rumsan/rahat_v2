import type { Project, CreateProjectInput, UpdateProjectInput } from '../types/project.js'
import type { ProjectService } from './service.js'
import { openDb } from '../db.js'

const STORE_NAME = 'projects'

export const idbProjectService: ProjectService = {
  async list() {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result as Project[])
      req.onerror = () => reject(req.error)
    })
  },

  async get(id) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const req = store.get(id)
      req.onsuccess = () => resolve((req.result as Project | undefined) ?? undefined)
      req.onerror = () => reject(req.error)
    })
  },

  async create(data: CreateProjectInput) {
    const db = await openDb()
    const project: Project = {
      id: `proj_${Date.now()}`,
      status: 'Planning',
      beneficiaries: 0,
      budget: '$0',
      ...data,
    }
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      store.add(project)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
    return project
  },

  async update(id, data: UpdateProjectInput) {
    const db = await openDb()
    const existing = await idbProjectService.get(id)
    if (!existing) throw new Error(`Project ${id} not found`)
    const updated: Project = { ...existing, ...data, id }
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
