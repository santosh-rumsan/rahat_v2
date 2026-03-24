export type { ForecastSourceService } from './service.js'
export { idbForecastSourceService } from './idb.js'
export { createApiForecastSourceService } from './api.js'

import { idbForecastSourceService } from './idb.js'
import { createApiForecastSourceService } from './api.js'

import type { ForecastSourceService } from './service.js'

export function createForecastSourceService(apiUrl: string): ForecastSourceService {
  if (apiUrl === 'indexdb') return idbForecastSourceService
  return createApiForecastSourceService(apiUrl)
}
