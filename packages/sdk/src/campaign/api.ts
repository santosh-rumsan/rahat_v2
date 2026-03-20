import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  TransmissionLog,
  CreateTransmissionLogInput,
} from '../types/campaign.js'
import type { CampaignService, TransmissionLogService } from './service.js'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

export function createApiCampaignService(baseUrl: string): CampaignService {
  const base = `${baseUrl}/projects`

  return {
    list(projectId) {
      return apiFetch<Campaign[]>(`${base}/${projectId}/campaigns`)
    },

    get(projectId, id) {
      return apiFetch<Campaign>(`${base}/${projectId}/campaigns/${id}`)
    },

    create(projectId, data: CreateCampaignInput) {
      return apiFetch<Campaign>(`${base}/${projectId}/campaigns`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update(projectId, id, data: UpdateCampaignInput) {
      return apiFetch<Campaign>(`${base}/${projectId}/campaigns/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    async delete(projectId, id) {
      await apiFetch<void>(`${base}/${projectId}/campaigns/${id}`, { method: 'DELETE' })
    },
  }
}

export function createApiTransmissionLogService(baseUrl: string): TransmissionLogService {
  const base = `${baseUrl}/campaigns`

  return {
    list(campaignId) {
      return apiFetch<TransmissionLog[]>(`${base}/${campaignId}/transmission-logs`)
    },

    create(data: CreateTransmissionLogInput) {
      return apiFetch<TransmissionLog>(`${base}/${data.campaignId}/transmission-logs`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async clearByCampaign(campaignId) {
      await apiFetch<void>(`${base}/${campaignId}/transmission-logs`, { method: 'DELETE' })
    },
  }
}
