import type { ForecastSource, CreateForecastSourceInput, UpdateForecastSourceInput } from '../types/forecast.js'
import type { ForecastSourceService } from './service.js'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

export function createApiForecastSourceService(baseUrl: string): ForecastSourceService {
  const base = `${baseUrl}/forecast-sources`

  return {
    list() {
      return apiFetch<ForecastSource[]>(base)
    },

    async get(id) {
      return apiFetch<ForecastSource>(`${base}/${id}`)
    },

    create(data: CreateForecastSourceInput) {
      return apiFetch<ForecastSource>(base, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update(id, data: UpdateForecastSourceInput) {
      return apiFetch<ForecastSource>(`${base}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    async delete(id) {
      await apiFetch<void>(`${base}/${id}`, { method: 'DELETE' })
    },

    fetchData(id) {
      return apiFetch<unknown>(`${base}/${id}/fetch`, { method: 'POST' })
    },
  }
}
