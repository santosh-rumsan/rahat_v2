export type { BeneficiaryGroupService, CreateBeneficiaryGroupInput, UpdateBeneficiaryGroupInput } from './service.js'
export { idbBeneficiaryGroupService } from './idb.js'
export { createApiBeneficiaryGroupService } from './api.js'

import { idbBeneficiaryGroupService } from './idb.js'
import { createApiBeneficiaryGroupService } from './api.js'

import type { BeneficiaryGroupService } from './service.js'

export function createBeneficiaryGroupService(apiUrl: string): BeneficiaryGroupService {
  if (apiUrl === 'indexdb') return idbBeneficiaryGroupService
  return createApiBeneficiaryGroupService(apiUrl)
}
