export const FORECAST_SOURCE_TYPES = ['RIVER_WATCH', 'RAINFALL_WATCH', 'GLOFAS', 'HEAT_INDEX'] as const
export type ForecastSourceType = (typeof FORECAST_SOURCE_TYPES)[number]

export const FORECAST_SOURCE_TYPE_LABELS: Record<ForecastSourceType, string> = {
  RIVER_WATCH: 'River Watch',
  RAINFALL_WATCH: 'Rainfall Watch',
  GLOFAS: 'GLOFAS',
  HEAT_INDEX: 'Heat Index',
}

export interface ForecastSource {
  id: string
  name: string
  sourceType: ForecastSourceType
  url: string
  method: string
  headers: Record<string, string>
  body: Record<string, unknown>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateForecastSourceInput {
  id?: string
  name: string
  sourceType: ForecastSourceType
  url: string
  method?: string
  headers?: Record<string, string>
  body?: Record<string, unknown>
  isActive?: boolean
}

export type UpdateForecastSourceInput = Partial<CreateForecastSourceInput>
