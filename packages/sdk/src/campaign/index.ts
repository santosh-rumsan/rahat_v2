export type { CampaignService, TransmissionLogService } from './service.js'
export { idbCampaignService, idbTransmissionLogService } from './idb.js'
export { createApiCampaignService, createApiTransmissionLogService } from './api.js'

import { idbCampaignService, idbTransmissionLogService } from './idb.js'
import { createApiCampaignService, createApiTransmissionLogService } from './api.js'
import { getSDKIsDev } from '../config.js'
import type { CampaignService, TransmissionLogService } from './service.js'

export function createCampaignService(apiUrl: string): CampaignService {
  if (apiUrl === 'indexdb' && getSDKIsDev()) return idbCampaignService
  return createApiCampaignService(apiUrl)
}

export function createTransmissionLogService(apiUrl: string): TransmissionLogService {
  if (apiUrl === 'indexdb' && getSDKIsDev()) return idbTransmissionLogService
  return createApiTransmissionLogService(apiUrl)
}
