import type { ForecastSource, CreateForecastSourceInput, UpdateForecastSourceInput } from '../types/forecast.js'

export interface ForecastSourceService {
  list(): Promise<ForecastSource[]>
  get(id: string): Promise<ForecastSource | undefined>
  create(data: CreateForecastSourceInput): Promise<ForecastSource>
  update(id: string, data: UpdateForecastSourceInput): Promise<ForecastSource>
  delete(id: string): Promise<void>
  fetchData(id: string): Promise<unknown>
}
