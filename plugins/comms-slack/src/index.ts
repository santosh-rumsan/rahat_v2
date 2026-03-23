import { Hash } from 'lucide-react'
import { registerCommType } from '@rahataid/projects-shared/communication'
import type { CommFrontendPlugin } from '@rahataid/projects-shared/communication'
import { CAMPAIGN_SEND_EVENT } from '@rahataid/projects-shared/communication'
import type { CampaignSendEventDetail } from '@rahataid/projects-shared/communication'
import { idbServiceService, idbTransmissionLogService, getIsProd } from '@rahataid/sdk'
import type { SlackDetails } from '@rahataid/sdk'
import { SlackDetails as SlackDetailsComponent } from './slack-details.js'

export const commsSlackPlugin: CommFrontendPlugin = {
  type: 'slack',
  label: 'Slack',
  description: 'Send Slack messages to beneficiaries',
  group: 'comms',
  IconComponent: Hash,
  DetailsComponent: SlackDetailsComponent,
  canAdvance: (data) => typeof data.message === 'string' && data.message.trim().length > 0,
}

registerCommType(commsSlackPlugin)

// Listen for campaign send events and call the Slack webhook
if (typeof window !== 'undefined') window.addEventListener(CAMPAIGN_SEND_EVENT, async (e: Event) => {
  if (getIsProd()) return

  const { campaign, beneficiaryIds, transmissionLogs } = (e as CustomEvent<CampaignSendEventDetail>).detail

  if (campaign.communicationType !== 'slack') return

  const services = await idbServiceService.list()
  const service = services.find((s) => s.serviceType === 'SLACK' && s.isEnabled)
  if (!service) return

  const details = campaign.details as SlackDetails

  await Promise.all(
    beneficiaryIds.map(async (beneficiaryId, i) => {
      const log = transmissionLogs[i]
      try {
        await fetch(service.url, {
          method: service.method,
          headers: { 'Content-Type': 'application/json', ...service.headers },
          body: JSON.stringify({
            ...service.body,
            text: details.message,
            channel: details.channel || undefined,
            beneficiaryId,
          }),
        })
        if (log) await idbTransmissionLogService.update(log.id, { status: 'Sent' })
      } catch (err) {
        if (log) {
          await idbTransmissionLogService.update(log.id, {
            status: 'Failed',
            errorMessage: err instanceof Error ? err.message : 'Unknown error',
          })
        }
      }
    }),
  )
})
