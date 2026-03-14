export type { VendorService } from './service.js'
export { idbVendorService } from './idb.js'
export { createApiVendorService } from './api.js'

import { idbVendorService } from './idb.js'
import { createApiVendorService } from './api.js'
import { getSDKIsDev } from '../config.js'
import type { VendorService } from './service.js'

export function createVendorService(apiUrl: string): VendorService {
  if (apiUrl === 'indexdb' && getSDKIsDev()) return idbVendorService
  return createApiVendorService(apiUrl)
}
