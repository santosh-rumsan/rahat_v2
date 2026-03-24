export type { TokenService } from './service.js'
export { idbTokenService } from './idb.js'
export { createApiTokenService } from './api.js'

import { idbTokenService } from './idb.js'
import { createApiTokenService } from './api.js'

import type { TokenService } from './service.js'

export function createTokenService(apiUrl: string): TokenService {
  if (apiUrl === 'indexdb') return idbTokenService
  return createApiTokenService(apiUrl)
}
