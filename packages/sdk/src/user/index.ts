export type { UserService } from './service.js'
export { idbUserService } from './idb.js'
export { createApiUserService } from './api.js'

import { idbUserService } from './idb.js'
import { createApiUserService } from './api.js'
import { getSDKIsDev } from '../config.js'
import type { UserService } from './service.js'

export function createUserService(apiUrl: string): UserService {
  if (apiUrl === 'indexdb' && getSDKIsDev()) return idbUserService
  return createApiUserService(apiUrl)
}
