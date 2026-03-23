import type { Service, CreateServiceInput, UpdateServiceInput } from '../types/service.js'
import type { ServiceService } from './service.js'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

export function createApiServiceService(baseUrl: string): ServiceService {
  const base = `${baseUrl}/services`

  return {
    list() {
      return apiFetch<Service[]>(base)
    },

    get(id) {
      return apiFetch<Service>(`${base}/${id}`)
    },

    create(data: CreateServiceInput) {
      return apiFetch<Service>(base, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update(id, data: UpdateServiceInput) {
      return apiFetch<Service>(`${base}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    async delete(id) {
      await apiFetch<void>(`${base}/${id}`, { method: 'DELETE' })
    },
  }
}
