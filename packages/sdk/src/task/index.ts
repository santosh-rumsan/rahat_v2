export type { TaskService } from './service.js'
export { idbTaskService } from './idb.js'
export { createApiTaskService } from './api.js'

import { idbTaskService } from './idb.js'
import { createApiTaskService } from './api.js'
import { getSDKIsDev } from '../config.js'
import type { TaskService } from './service.js'

export function createTaskService(apiUrl: string): TaskService {
  if (apiUrl === 'indexdb' && getSDKIsDev()) return idbTaskService
  return createApiTaskService(apiUrl)
}
