export type { ProjectService } from './service.js'
export { idbProjectService } from './idb.js'
export { createApiProjectService } from './api.js'

import { idbProjectService } from './idb.js'
import { createApiProjectService } from './api.js'
import { getSDKIsDev } from '../config.js'
import type { ProjectService } from './service.js'

export function createProjectService(apiUrl: string): ProjectService {
  if (apiUrl === 'indexdb' && getSDKIsDev()) return idbProjectService
  return createApiProjectService(apiUrl)
}
