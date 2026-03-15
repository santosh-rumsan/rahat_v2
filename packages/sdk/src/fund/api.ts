import type {
  Fund,
  CreateFundInput,
  UpdateFundInput,
  FundAllocation,
  CreateFundAllocationInput,
  AllocationLog,
} from '../types/fund.js'
import type { FundService } from './service.js'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

export function createApiFundService(baseUrl: string): FundService {
  const fundsBase = `${baseUrl}/funds`
  const allocBase = `${baseUrl}/fund-allocations`
  const logsBase = `${baseUrl}/allocation-logs`

  return {
    listFunds: () => apiFetch<Fund[]>(fundsBase),
    getFund: (id) => apiFetch<Fund>(`${fundsBase}/${id}`),
    createFund: (data: CreateFundInput) =>
      apiFetch<Fund>(fundsBase, { method: 'POST', body: JSON.stringify(data) }),
    updateFund: (id, data: UpdateFundInput) =>
      apiFetch<Fund>(`${fundsBase}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    async deleteFund(id) {
      await apiFetch<void>(`${fundsBase}/${id}`, { method: 'DELETE' })
    },

    listAllocations: () => apiFetch<FundAllocation[]>(allocBase),
    getAllocation: (id) => apiFetch<FundAllocation>(`${allocBase}/${id}`),
    createAllocation: (data: CreateFundAllocationInput) =>
      apiFetch<FundAllocation>(allocBase, { method: 'POST', body: JSON.stringify(data) }),
    async deleteAllocation(id) {
      await apiFetch<void>(`${allocBase}/${id}`, { method: 'DELETE' })
    },

    listLogs: () => apiFetch<AllocationLog[]>(logsBase),
  }
}
