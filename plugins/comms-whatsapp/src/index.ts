import { MessageCircle } from 'lucide-react'
import { registerCommType } from '@rahataid/projects-shared/communication'
import type { CommFrontendPlugin } from '@rahataid/projects-shared/communication'
import { CAMPAIGN_SEND_EVENT } from '@rahataid/projects-shared/communication'
import type { CampaignSendEventDetail } from '@rahataid/projects-shared/communication'
import { idbServiceService, idbTransmissionLogService, getIsProd } from '@rahataid/sdk'
import type { WhatsappDetails } from '@rahataid/sdk'
import { WhatsappDetails as WhatsappDetailsComponent } from './whatsapp-details.js'

export const commsWhatsappPlugin: CommFrontendPlugin = {
  type: 'whatsapp',
  label: 'WhatsApp',
  description: 'Send WhatsApp messages to beneficiaries',
  group: 'comms',
  IconComponent: MessageCircle,
  DetailsComponent: WhatsappDetailsComponent,
  canAdvance: (data) => typeof data.message === 'string' && data.message.trim().length > 0,
}

registerCommType(commsWhatsappPlugin)

// Listen for campaign send events and call the WhatsApp webhook
if (typeof window !== 'undefined') window.addEventListener(CAMPAIGN_SEND_EVENT, async (e: Event) => {
  if (getIsProd()) return

  const { campaign, beneficiaryIds, transmissionLogs } = (e as CustomEvent<CampaignSendEventDetail>).detail

  if (campaign.communicationType !== 'whatsapp') return

  const services = await idbServiceService.list()
  const service = services.find((s) => s.serviceType === 'WHATSAPP' && s.isEnabled)
  if (!service) return

  const details = campaign.details as WhatsappDetails

  await Promise.all(
    beneficiaryIds.map(async (beneficiaryId, i) => {
      const log = transmissionLogs[i]
      try {
        await fetch(service.url, {
          method: service.method,
          headers: { 'content-type': 'application/json', ...Object.fromEntries(Object.entries(service.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v])) },
          body: JSON.stringify({
            ...service.body,
            message: details.message,
            templateId: details.templateId,
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
