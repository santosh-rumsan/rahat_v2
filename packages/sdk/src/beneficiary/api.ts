import type { Beneficiary, CreateBeneficiaryInput, UpdateBeneficiaryInput } from '../types/beneficiary.js'
import type { BeneficiaryService } from './service.js'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

export function createApiBeneficiaryService(baseUrl: string): BeneficiaryService {
  const base = `${baseUrl}/projects`

  return {
    list(projectId) {
      return apiFetch<Beneficiary[]>(`${base}/${projectId}/beneficiaries`)
    },

    get(projectId, id) {
      return apiFetch<Beneficiary>(`${base}/${projectId}/beneficiaries/${id}`)
    },

    create(projectId, data: CreateBeneficiaryInput) {
      return apiFetch<Beneficiary>(`${base}/${projectId}/beneficiaries`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update(projectId, id, data: UpdateBeneficiaryInput) {
      return apiFetch<Beneficiary>(`${base}/${projectId}/beneficiaries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    async delete(projectId, id) {
      await apiFetch<void>(`${base}/${projectId}/beneficiaries/${id}`, { method: 'DELETE' })
    },
  }
}
