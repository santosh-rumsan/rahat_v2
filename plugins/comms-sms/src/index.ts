import { MessageSquare } from 'lucide-react'
import { registerCommType } from '@rahataid/projects-shared/communication'
import type { CommFrontendPlugin } from '@rahataid/projects-shared/communication'
import { CAMPAIGN_SEND_EVENT } from '@rahataid/projects-shared/communication'
import type { CampaignSendEventDetail } from '@rahataid/projects-shared/communication'
import { idbServiceService, idbTransmissionLogService, getIsProd } from '@rahataid/sdk'
import type { SmsDetails } from '@rahataid/sdk'
import { SmsDetails as SmsDetailsComponent } from './sms-details.js'

export const commsSmsPlugin: CommFrontendPlugin = {
  type: 'sms',
  label: 'SMS',
  description: 'Send text messages to beneficiaries',
  group: 'comms',
  IconComponent: MessageSquare,
  DetailsComponent: SmsDetailsComponent,
  canAdvance: (data) => typeof data.message === 'string' && data.message.trim().length > 0,
}

registerCommType(commsSmsPlugin)

// Listen for campaign send events and call the SMS webhook
if (typeof window !== 'undefined') window.addEventListener(CAMPAIGN_SEND_EVENT, async (e: Event) => {
  if (getIsProd()) return

  const { campaign, beneficiaryIds, transmissionLogs } = (e as CustomEvent<CampaignSendEventDetail>).detail

  if (campaign.communicationType !== 'sms') return

  const services = await idbServiceService.list()
  const service = services.find((s) => s.serviceType === 'SMS' && s.isEnabled)
  if (!service) return

  const details = campaign.details as SmsDetails

  await Promise.all(
    beneficiaryIds.map(async (beneficiaryId, i) => {
      const log = transmissionLogs[i]
      try {
        await fetch(service.url, {
          method: service.method,
          headers: { 'Content-Type': 'application/json', ...service.headers },
          body: JSON.stringify({
            ...service.body,
            message: details.message,
            senderId: details.senderId,
            to: beneficiaryId,
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
