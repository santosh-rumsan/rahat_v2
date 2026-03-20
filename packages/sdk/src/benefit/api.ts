import type { Benefit, CreateBenefitInput, UpdateBenefitInput } from '../types/benefit.js'
import type { BenefitService } from './service.js'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

export function createApiBenefitService(baseUrl: string): BenefitService {
  const base = `${baseUrl}/benefits`

  return {
    list(projectId) {
      return apiFetch<Benefit[]>(`${base}?projectId=${projectId}`)
    },

    get(_projectId, id) {
      return apiFetch<Benefit>(`${base}/${id}`)
    },

    create(_projectId, data: CreateBenefitInput) {
      return apiFetch<Benefit>(base, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update(_projectId, id, data: UpdateBenefitInput) {
      return apiFetch<Benefit>(`${base}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    async delete(_projectId, id) {
      await apiFetch<void>(`${base}/${id}`, { method: 'DELETE' })
    },
  }
}
