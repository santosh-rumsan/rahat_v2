export type { FundService } from './service.js'
export { idbFundService } from './idb.js'
export { createApiFundService } from './api.js'

import { idbFundService } from './idb.js'
import { createApiFundService } from './api.js'
import { getSDKIsDev } from '../config.js'
import type { FundService } from './service.js'

export function createFundService(apiUrl: string): FundService {
  if (apiUrl === 'indexdb' && getSDKIsDev()) return idbFundService
  return createApiFundService(apiUrl)
}
