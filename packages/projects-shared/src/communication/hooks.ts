import * as React from 'react'
import { idbCampaignService, idbTransmissionLogService } from '@rahataid/sdk'
import type { Campaign, CreateCampaignInput, UpdateCampaignInput, TransmissionLog, CreateTransmissionLogInput } from '@rahataid/sdk'

export function useProjectCampaigns(projectId: string) {
  const [campaigns, setCampaignsState] = React.useState<Campaign[]>([])

  React.useEffect(() => {
    idbCampaignService.list(projectId).then(setCampaignsState).catch(() => {})
  }, [projectId])

  async function createCampaign(data: CreateCampaignInput): Promise<Campaign> {
    const campaign = await idbCampaignService.create(projectId, data)
    setCampaignsState((prev) => [...prev, campaign])
    return campaign
  }

  async function updateCampaign(id: string, data: UpdateCampaignInput): Promise<Campaign> {
    const updated = await idbCampaignService.update(projectId, id, data)
    setCampaignsState((prev) => prev.map((c) => (c.id === id ? updated : c)))
    return updated
  }

  async function deleteCampaign(id: string): Promise<void> {
    await idbCampaignService.delete(projectId, id)
    setCampaignsState((prev) => prev.filter((c) => c.id !== id))
  }

  return { campaigns, createCampaign, updateCampaign, deleteCampaign }
}

export function useCampaign(projectId: string, campaignId: string) {
  const [campaign, setCampaign] = React.useState<Campaign | undefined>(undefined)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    idbCampaignService.get(projectId, campaignId)
      .then(setCampaign)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [projectId, campaignId])

  async function update(data: UpdateCampaignInput): Promise<Campaign | undefined> {
    const updated = await idbCampaignService.update(projectId, campaignId, data)
    setCampaign(updated)
    return updated
  }

  return { campaign, loading, update }
}

export function useCampaignTransmissionLogs(campaignId: string) {
  const [logs, setLogs] = React.useState<TransmissionLog[]>([])

  React.useEffect(() => {
    if (!campaignId) return
    idbTransmissionLogService.list(campaignId).then(setLogs).catch(() => {})
  }, [campaignId])

  async function addLog(data: CreateTransmissionLogInput): Promise<TransmissionLog> {
    const log = await idbTransmissionLogService.create(data)
    setLogs((prev) => [log, ...prev])
    return log
  }

  async function clearLogs(): Promise<void> {
    await idbTransmissionLogService.clearByCampaign(campaignId)
    setLogs([])
  }

  return { logs, addLog, clearLogs }
}
