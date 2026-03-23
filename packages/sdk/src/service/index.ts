export type { ServiceService } from './service.js'
export { idbServiceService } from './idb.js'
export { createApiServiceService } from './api.js'

import { idbServiceService } from './idb.js'
import { createApiServiceService } from './api.js'
import { getSDKIsDev } from '../config.js'
import type { ServiceService } from './service.js'

export function createServiceService(apiUrl: string): ServiceService {
  if (apiUrl === 'indexdb' && getSDKIsDev()) return idbServiceService
  return createApiServiceService(apiUrl)
}
