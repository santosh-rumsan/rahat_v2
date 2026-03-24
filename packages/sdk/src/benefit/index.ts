export type { BenefitService } from './service.js'
export { idbBenefitService } from './idb.js'
export { createApiBenefitService } from './api.js'

import { idbBenefitService } from './idb.js'
import { createApiBenefitService } from './api.js'

import type { BenefitService } from './service.js'

export function createBenefitService(apiUrl: string): BenefitService {
  if (apiUrl === 'indexdb') return idbBenefitService
  return createApiBenefitService(apiUrl)
}
