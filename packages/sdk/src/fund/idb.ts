import type {
  Fund,
  CreateFundInput,
  UpdateFundInput,
  FundAllocation,
  CreateFundAllocationInput,
  AllocationLog,
} from '../types/fund.js'
import type { FundService } from './service.js'
import { openDb } from '../db.js'

function nowIso() {
  return new Date().toISOString()
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

async function appendLog(db: IDBDatabase, log: AllocationLog): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('allocation_logs', 'readwrite')
    tx.objectStore('allocation_logs').add(log)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export const idbFundService: FundService = {
  // ── Funds ─────────────────────────────────────────────────────────────────

  async listFunds() {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('funds', 'readonly')
      const req = tx.objectStore('funds').getAll()
      req.onsuccess = () => resolve(req.result as Fund[])
      req.onerror = () => reject(req.error)
    })
  },

  async getFund(id) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('funds', 'readonly')
      const req = tx.objectStore('funds').get(id)
      req.onsuccess = () => resolve((req.result as Fund | undefined) ?? undefined)
      req.onerror = () => reject(req.error)
    })
  },

  async createFund(data: CreateFundInput) {
    const db = await openDb()
    const fund: Fund = { id: uid('fund'), ...data }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('funds', 'readwrite')
      tx.objectStore('funds').add(fund)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    await appendLog(db, {
      id: uid('log'),
      type: 'deposit',
      refId: fund.id,
      amount: fund.amount,
      currency: fund.currency,
      label: `${fund.name} — ${fund.source}`,
      createdAt: nowIso(),
    })
    return fund
  },

  async updateFund(id, data: UpdateFundInput) {
    const db = await openDb()
    const existing = await idbFundService.getFund(id)
    if (!existing) throw new Error(`Fund ${id} not found`)
    const updated: Fund = { ...existing, ...data, id }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('funds', 'readwrite')
      tx.objectStore('funds').put(updated)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    return updated
  },

  async deleteFund(id) {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('funds', 'readwrite')
      tx.objectStore('funds').delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  },

  // ── Allocations ────────────────────────────────────────────────────────────

  async listAllocations() {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('fund_allocations', 'readonly')
      const req = tx.objectStore('fund_allocations').getAll()
      req.onsuccess = () => resolve(req.result as FundAllocation[])
      req.onerror = () => reject(req.error)
    })
  },

  async getAllocation(id) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('fund_allocations', 'readonly')
      const req = tx.objectStore('fund_allocations').get(id)
      req.onsuccess = () => resolve((req.result as FundAllocation | undefined) ?? undefined)
      req.onerror = () => reject(req.error)
    })
  },

  async createAllocation(data: CreateFundAllocationInput) {
    const db = await openDb()
    const allocation: FundAllocation = {
      id: uid('alloc'),
      allocatedAt: nowIso(),
      ...data,
    }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('fund_allocations', 'readwrite')
      tx.objectStore('fund_allocations').add(allocation)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    await appendLog(db, {
      id: uid('log'),
      type: 'allocation',
      refId: allocation.id,
      projectId: allocation.projectId,
      amount: allocation.amount,
      currency: allocation.currency,
      label: `Allocation → project ${allocation.projectId}`,
      createdAt: nowIso(),
    })
    return allocation
  },

  async deleteAllocation(id) {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('fund_allocations', 'readwrite')
      tx.objectStore('fund_allocations').delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  },

  // ── Logs ──────────────────────────────────────────────────────────────────

  async listLogs() {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('allocation_logs', 'readonly')
      const req = tx.objectStore('allocation_logs').getAll()
      req.onsuccess = () => {
        const logs = req.result as AllocationLog[]
        resolve(logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
      }
      req.onerror = () => reject(req.error)
    })
  },
}
