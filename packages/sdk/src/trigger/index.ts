export type { TriggerStatementService, TriggerService, TriggerExecutionService } from './service.js'
export { idbTriggerStatementService, idbTriggerService, idbTriggerExecutionService } from './idb.js'
export {
  createApiTriggerStatementService,
  createApiTriggerService,
  createApiTriggerExecutionService,
} from './api.js'

import { idbTriggerStatementService, idbTriggerService, idbTriggerExecutionService } from './idb.js'
import {
  createApiTriggerStatementService,
  createApiTriggerService,
  createApiTriggerExecutionService,
} from './api.js'

import type { TriggerStatementService, TriggerService, TriggerExecutionService } from './service.js'

export function createTriggerStatementService(apiUrl: string): TriggerStatementService {
  if (apiUrl === 'indexdb') return idbTriggerStatementService
  return createApiTriggerStatementService(apiUrl)
}

export function createTriggerService(apiUrl: string): TriggerService {
  if (apiUrl === 'indexdb') return idbTriggerService
  return createApiTriggerService(apiUrl)
}

export function createTriggerExecutionService(apiUrl: string): TriggerExecutionService {
  if (apiUrl === 'indexdb') return idbTriggerExecutionService
  return createApiTriggerExecutionService(apiUrl)
}
