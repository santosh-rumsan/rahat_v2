const DB_NAME = 'rahat-db'
const DB_VERSION = 13

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const oldVersion = event.oldVersion

      if (oldVersion < 1) {
        const store = db.createObjectStore('beneficiaries', { keyPath: 'id' })
        store.createIndex('by_project', 'projectId', { unique: false })
      }

      if (oldVersion < 2) {
        db.createObjectStore('projects', { keyPath: 'id' })
      }

      if (oldVersion < 3) {
        db.createObjectStore('vendors', { keyPath: 'id' })
      }

      if (oldVersion < 4) {
        db.createObjectStore('users', { keyPath: 'id' })
      }

      if (oldVersion < 5) {
        db.createObjectStore('funds', { keyPath: 'id' })
        const allocStore = db.createObjectStore('fund_allocations', { keyPath: 'id' })
        allocStore.createIndex('by_project', 'projectId', { unique: false })
        db.createObjectStore('allocation_logs', { keyPath: 'id' })
      }

      if (oldVersion < 6) {
        // Migrate: currency field replaced by token — clear existing fund data
        db.deleteObjectStore('funds')
        db.deleteObjectStore('fund_allocations')
        db.deleteObjectStore('allocation_logs')
        db.createObjectStore('funds', { keyPath: 'id' })
        const allocStore2 = db.createObjectStore('fund_allocations', { keyPath: 'id' })
        allocStore2.createIndex('by_project', 'projectId', { unique: false })
        db.createObjectStore('allocation_logs', { keyPath: 'id' })
      }

      if (oldVersion < 7) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' })
        taskStore.createIndex('by_project', 'projectId', { unique: false })
      }

      if (oldVersion < 8) {
        const benefitStore = db.createObjectStore('benefits', { keyPath: 'id' })
        benefitStore.createIndex('by_project', 'projectId', { unique: false })
      }

      if (oldVersion < 9) {
        const tokenStore = db.createObjectStore('tokens', { keyPath: 'id' })
        tokenStore.createIndex('by_project', 'projectId', { unique: false })
      }

      if (oldVersion < 10) {
        const groupStore = db.createObjectStore('beneficiary_groups', { keyPath: 'id' })
        groupStore.createIndex('by_project', 'projectId', { unique: false })
      }

      if (oldVersion < 13) {
        if (!db.objectStoreNames.contains('campaigns')) {
          const campaignStore = db.createObjectStore('campaigns', { keyPath: 'id' })
          campaignStore.createIndex('by_project', 'projectId', { unique: false })
        }
        if (!db.objectStoreNames.contains('transmission_logs')) {
          const logStore = db.createObjectStore('transmission_logs', { keyPath: 'id' })
          logStore.createIndex('by_campaign', 'campaignId', { unique: false })
        }
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
