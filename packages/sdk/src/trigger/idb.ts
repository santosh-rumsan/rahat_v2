import type {
  Trigger,
  TriggerStatement,
  TriggerExecution,
  CreateTriggerInput,
  UpdateTriggerInput,
  CreateTriggerStatementInput,
  UpdateTriggerStatementInput,
  CreateTriggerExecutionInput,
} from '../types/trigger.js'
import type { TriggerStatementService, TriggerService, TriggerExecutionService } from './service.js'
import { openDb } from '../db.js'

export const idbTriggerStatementService: TriggerStatementService = {
  async list(projectId) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('trigger_statements', 'readonly')
      const store = tx.objectStore('trigger_statements')
      const req = store.index('by_project').getAll(projectId)
      req.onsuccess = () => resolve(req.result as TriggerStatement[])
      req.onerror = () => reject(req.error)
    })
  },

  async get(id) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('trigger_statements', 'readonly')
      const store = tx.objectStore('trigger_statements')
      const req = store.get(id)
      req.onsuccess = () => resolve((req.result as TriggerStatement | undefined) ?? undefined)
      req.onerror = () => reject(req.error)
    })
  },

  async create(data: CreateTriggerStatementInput) {
    const db = await openDb()
    const record: TriggerStatement = {
      id: `ts_${Date.now()}`,
      ...data,
      status: 'not_triggered',
      createdAt: new Date().toISOString(),
    }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('trigger_statements', 'readwrite')
      tx.objectStore('trigger_statements').add(record)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    return record
  },

  async update(id, data: UpdateTriggerStatementInput) {
    const db = await openDb()
    const existing = await idbTriggerStatementService.get(id)
    if (!existing) throw new Error(`TriggerStatement ${id} not found`)
    const updated: TriggerStatement = { ...existing, ...data, id }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('trigger_statements', 'readwrite')
      tx.objectStore('trigger_statements').put(updated)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    return updated
  },

  async delete(id) {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('trigger_statements', 'readwrite')
      tx.objectStore('trigger_statements').delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  },
}

export const idbTriggerService: TriggerService = {
  async list(statementId) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('triggers', 'readonly')
      const store = tx.objectStore('triggers')
      const req = store.index('by_statement').getAll(statementId)
      req.onsuccess = () => resolve(req.result as Trigger[])
      req.onerror = () => reject(req.error)
    })
  },

  async listByProject(projectId) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('triggers', 'readonly')
      const store = tx.objectStore('triggers')
      const req = store.index('by_project').getAll(projectId)
      req.onsuccess = () => resolve(req.result as Trigger[])
      req.onerror = () => reject(req.error)
    })
  },

  async get(id) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('triggers', 'readonly')
      const store = tx.objectStore('triggers')
      const req = store.get(id)
      req.onsuccess = () => resolve((req.result as Trigger | undefined) ?? undefined)
      req.onerror = () => reject(req.error)
    })
  },

  async create(data: CreateTriggerInput) {
    const db = await openDb()
    const record: Trigger = {
      id: `tr_${Date.now()}`,
      ...data,
      status: 'not_triggered',
      createdAt: new Date().toISOString(),
    }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('triggers', 'readwrite')
      tx.objectStore('triggers').add(record)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    return record
  },

  async update(id, data: UpdateTriggerInput) {
    const db = await openDb()
    const existing = await idbTriggerService.get(id)
    if (!existing) throw new Error(`Trigger ${id} not found`)
    const updated: Trigger = { ...existing, ...data, id }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('triggers', 'readwrite')
      tx.objectStore('triggers').put(updated)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    return updated
  },

  async delete(id) {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('triggers', 'readwrite')
      tx.objectStore('triggers').delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  },
}

export const idbTriggerExecutionService: TriggerExecutionService = {
  async list(statementId) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('trigger_executions', 'readonly')
      const store = tx.objectStore('trigger_executions')
      const req = store.index('by_statement').getAll(statementId)
      req.onsuccess = () => resolve(req.result as TriggerExecution[])
      req.onerror = () => reject(req.error)
    })
  },

  async create(data: CreateTriggerExecutionInput) {
    const db = await openDb()
    const record: TriggerExecution = { id: `te_${Date.now()}`, ...data }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('trigger_executions', 'readwrite')
      tx.objectStore('trigger_executions').add(record)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    return record
  },
}
