export type { BeneficiaryService } from './service.js'
export { idbBeneficiaryService } from './idb.js'
export { createApiBeneficiaryService } from './api.js'

import { idbBeneficiaryService } from './idb.js'
import { createApiBeneficiaryService } from './api.js'
import { getSDKIsDev } from '../config.js'
import type { BeneficiaryService } from './service.js'

export function createBeneficiaryService(apiUrl: string): BeneficiaryService {
  if (apiUrl === 'indexdb' && getSDKIsDev()) return idbBeneficiaryService
  return createApiBeneficiaryService(apiUrl)
}
