import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  TransmissionLog,
  CreateTransmissionLogInput,
} from '../types/campaign.js'
import type { CampaignService, TransmissionLogService } from './service.js'
import { openDb } from '../db.js'

const CAMPAIGN_STORE = 'campaigns'
const LOG_STORE = 'transmission_logs'

interface IDBCampaign extends Campaign {
  projectId: string
}

interface IDBTransmissionLog extends TransmissionLog {}

function tx(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest | void
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    const req = fn(store)
    transaction.oncomplete = () => resolve(req ? req.result : undefined)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

export const idbCampaignService: CampaignService = {
  async list(projectId) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CAMPAIGN_STORE, 'readonly')
      const store = transaction.objectStore(CAMPAIGN_STORE)
      const index = store.index('by_project')
      const req = index.getAll(projectId)
      req.onsuccess = () => {
        const results = (req.result as IDBCampaign[]).map(({ projectId: _pid, ...c }) => c)
        resolve(results)
      }
      req.onerror = () => reject(req.error)
    })
  },

  async get(projectId, id) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CAMPAIGN_STORE, 'readonly')
      const store = transaction.objectStore(CAMPAIGN_STORE)
      const req = store.get(id)
      req.onsuccess = () => {
        const record = req.result as IDBCampaign | undefined
        if (!record || record.projectId !== projectId) return resolve(undefined)
        const { projectId: _pid, ...c } = record
        resolve(c)
      }
      req.onerror = () => reject(req.error)
    })
  },

  async create(projectId, data: CreateCampaignInput) {
    const db = await openDb()
    const campaign: IDBCampaign = {
      id: `cmp${Date.now()}`,
      status: 'Draft',
      beneficiaryIds: [],
      beneficiaryGroupIds: [],
      createdAt: new Date().toISOString(),
      ...data,
      projectId,
    }
    await tx(db, CAMPAIGN_STORE, 'readwrite', (store) => store.add(campaign))
    const { projectId: _pid, ...result } = campaign
    return result
  },

  async update(projectId, id, data: UpdateCampaignInput) {
    const db = await openDb()
    const existing = await idbCampaignService.get(projectId, id)
    if (!existing) throw new Error(`Campaign ${id} not found`)
    const updated: IDBCampaign = { ...existing, ...data, id, projectId }
    await tx(db, CAMPAIGN_STORE, 'readwrite', (store) => store.put(updated))
    const { projectId: _pid, ...result } = updated
    return result
  },

  async delete(projectId, id) {
    const db = await openDb()
    const existing = await idbCampaignService.get(projectId, id)
    if (!existing) return
    await tx(db, CAMPAIGN_STORE, 'readwrite', (store) => store.delete(id))
  },
}

export const idbTransmissionLogService: TransmissionLogService = {
  async list(campaignId) {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(LOG_STORE, 'readonly')
      const store = transaction.objectStore(LOG_STORE)
      const index = store.index('by_campaign')
      const req = index.getAll(campaignId)
      req.onsuccess = () => resolve(req.result as IDBTransmissionLog[])
      req.onerror = () => reject(req.error)
    })
  },

  async create(data: CreateTransmissionLogInput) {
    const db = await openDb()
    const log: TransmissionLog = {
      id: `log${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...data,
    }
    await tx(db, LOG_STORE, 'readwrite', (store) => store.add(log))
    return log
  },

  async update(id, data) {
    const db = await openDb()
    const existing = await new Promise<TransmissionLog | undefined>((resolve, reject) => {
      const transaction = db.transaction(LOG_STORE, 'readonly')
      const req = transaction.objectStore(LOG_STORE).get(id)
      req.onsuccess = () => resolve(req.result as TransmissionLog | undefined)
      req.onerror = () => reject(req.error)
    })
    if (!existing) throw new Error(`TransmissionLog ${id} not found`)
    const updated: TransmissionLog = { ...existing, ...data }
    await tx(db, LOG_STORE, 'readwrite', (store) => store.put(updated))
    return updated
  },

  async clearByCampaign(campaignId) {
    const db = await openDb()
    const logs = await idbTransmissionLogService.list(campaignId)
    const transaction = db.transaction(LOG_STORE, 'readwrite')
    const store = transaction.objectStore(LOG_STORE)
    for (const log of logs) {
      store.delete(log.id)
    }
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  },
}
