const DB_NAME = 'rahat-db'
const DB_VERSION = 3

function ensureObjectStore(db: IDBDatabase, name: string, options?: IDBObjectStoreParameters) {
  if (db.objectStoreNames.contains(name)) {
    return null
  }

  return db.createObjectStore(name, options)
}

function ensureIndex(
  store: IDBObjectStore,
  name: string,
  keyPath: string | string[],
  options?: IDBIndexParameters,
) {
  if (!store.indexNames.contains(name)) {
    store.createIndex(name, keyPath, options)
  }
}

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const request = event.target as IDBOpenDBRequest
      const db = request.result
      const tx = request.transaction

      if (!tx) {
        return
      }

      const beneficiaryStore =
        ensureObjectStore(db, 'beneficiaries', { keyPath: 'id' }) ?? tx.objectStore('beneficiaries')
      ensureIndex(beneficiaryStore, 'by_project', 'projectId', { unique: false })

      ensureObjectStore(db, 'projects', { keyPath: 'id' })
      ensureObjectStore(db, 'vendors', { keyPath: 'id' })
      ensureObjectStore(db, 'users', { keyPath: 'id' })
      ensureObjectStore(db, 'funds', { keyPath: 'id' })

      const allocStore =
        ensureObjectStore(db, 'fund_allocations', { keyPath: 'id' }) ?? tx.objectStore('fund_allocations')
      ensureIndex(allocStore, 'by_project', 'projectId', { unique: false })

      ensureObjectStore(db, 'allocation_logs', { keyPath: 'id' })

      const taskStore = ensureObjectStore(db, 'tasks', { keyPath: 'id' }) ?? tx.objectStore('tasks')
      ensureIndex(taskStore, 'by_project', 'projectId', { unique: false })

      const benefitStore =
        ensureObjectStore(db, 'benefits', { keyPath: 'id' }) ?? tx.objectStore('benefits')
      ensureIndex(benefitStore, 'by_project', 'projectId', { unique: false })

      const tokenStore = ensureObjectStore(db, 'tokens', { keyPath: 'id' }) ?? tx.objectStore('tokens')
      ensureIndex(tokenStore, 'by_project', 'projectId', { unique: false })

      const groupStore =
        ensureObjectStore(db, 'beneficiary_groups', { keyPath: 'id' }) ?? tx.objectStore('beneficiary_groups')
      ensureIndex(groupStore, 'by_project', 'projectId', { unique: false })

      const campaignStore =
        ensureObjectStore(db, 'campaigns', { keyPath: 'id' }) ?? tx.objectStore('campaigns')
      ensureIndex(campaignStore, 'by_project', 'projectId', { unique: false })

      const logStore =
        ensureObjectStore(db, 'transmission_logs', { keyPath: 'id' }) ?? tx.objectStore('transmission_logs')
      ensureIndex(logStore, 'by_campaign', 'campaignId', { unique: false })

      const moduleLogStore =
        ensureObjectStore(db, 'project_module_logs', { keyPath: 'id' }) ?? tx.objectStore('project_module_logs')
      ensureIndex(moduleLogStore, 'by_project', 'projectId', { unique: false })

      ensureObjectStore(db, 'forecast_sources', { keyPath: 'id' })
      ensureObjectStore(db, 'services', { keyPath: 'id' })
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
