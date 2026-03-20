const DB_NAME = 'rahat-db'
const DB_VERSION = 1

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      const beneficiaryStore = db.createObjectStore('beneficiaries', { keyPath: 'id' })
      beneficiaryStore.createIndex('by_project', 'projectId', { unique: false })

      db.createObjectStore('projects', { keyPath: 'id' })
      db.createObjectStore('vendors', { keyPath: 'id' })
      db.createObjectStore('users', { keyPath: 'id' })
      db.createObjectStore('funds', { keyPath: 'id' })

      const allocStore = db.createObjectStore('fund_allocations', { keyPath: 'id' })
      allocStore.createIndex('by_project', 'projectId', { unique: false })

      db.createObjectStore('allocation_logs', { keyPath: 'id' })

      const taskStore = db.createObjectStore('tasks', { keyPath: 'id' })
      taskStore.createIndex('by_project', 'projectId', { unique: false })

      const benefitStore = db.createObjectStore('benefits', { keyPath: 'id' })
      benefitStore.createIndex('by_project', 'projectId', { unique: false })

      const tokenStore = db.createObjectStore('tokens', { keyPath: 'id' })
      tokenStore.createIndex('by_project', 'projectId', { unique: false })

      const groupStore = db.createObjectStore('beneficiary_groups', { keyPath: 'id' })
      groupStore.createIndex('by_project', 'projectId', { unique: false })

      const campaignStore = db.createObjectStore('campaigns', { keyPath: 'id' })
      campaignStore.createIndex('by_project', 'projectId', { unique: false })

      const logStore = db.createObjectStore('transmission_logs', { keyPath: 'id' })
      logStore.createIndex('by_campaign', 'campaignId', { unique: false })

      const moduleLogStore = db.createObjectStore('project_module_logs', { keyPath: 'id' })
      moduleLogStore.createIndex('by_project', 'projectId', { unique: false })
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
