const DB_NAME = 'rahat-db'
const DB_VERSION = 4

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
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
