export type { CampaignService, TransmissionLogService } from './service.js'
export { idbCampaignService, idbTransmissionLogService } from './idb.js'
export { createApiCampaignService, createApiTransmissionLogService } from './api.js'

import { idbCampaignService, idbTransmissionLogService } from './idb.js'
import { createApiCampaignService, createApiTransmissionLogService } from './api.js'

import type { CampaignService, TransmissionLogService } from './service.js'

export function createCampaignService(apiUrl: string): CampaignService {
  if (apiUrl === 'indexdb') return idbCampaignService
  return createApiCampaignService(apiUrl)
}

export function createTransmissionLogService(apiUrl: string): TransmissionLogService {
  if (apiUrl === 'indexdb') return idbTransmissionLogService
  return createApiTransmissionLogService(apiUrl)
}
