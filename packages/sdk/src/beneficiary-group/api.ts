import type { BeneficiaryGroup } from '../types/beneficiary.js'
import type { BeneficiaryGroupService, CreateBeneficiaryGroupInput, UpdateBeneficiaryGroupInput } from './service.js'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

export function createApiBeneficiaryGroupService(baseUrl: string): BeneficiaryGroupService {
  const base = `${baseUrl}/beneficiary-groups`

  return {
    list(projectId) {
      return apiFetch<BeneficiaryGroup[]>(`${base}?projectId=${projectId}`)
    },

    get(_projectId, id) {
      return apiFetch<BeneficiaryGroup>(`${base}/${id}`)
    },

    create(_projectId, data: CreateBeneficiaryGroupInput) {
      return apiFetch<BeneficiaryGroup>(base, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update(_projectId, id, data: UpdateBeneficiaryGroupInput) {
      return apiFetch<BeneficiaryGroup>(`${base}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    async delete(_projectId, id) {
      await apiFetch<void>(`${base}/${id}`, { method: 'DELETE' })
    },
  }
}
