import { MessageSquare } from 'lucide-react'
import { registerCommType } from '@rahataid/projects-shared/communication'
import type { CommFrontendPlugin } from '@rahataid/projects-shared/communication'
import { CAMPAIGN_SEND_EVENT } from '@rahataid/projects-shared/communication'
import type { CampaignSendEventDetail } from '@rahataid/projects-shared/communication'
import { idbServiceService, idbTransmissionLogService, getIsProd, resolveServiceBody, getSDKApiUrl } from '@rahataid/sdk'
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

  const { campaign, beneficiaries, transmissionLogs } = (e as CustomEvent<CampaignSendEventDetail>).detail

  if (campaign.communicationType !== 'sms') return

  const services = await idbServiceService.list()
  const service = services.find((s) => s.serviceType === 'SMS' && s.isEnabled)
  if (!service) return

  const details = campaign.details as SmsDetails
  const phoneNumbers = beneficiaries.map((b) => b.phone).filter((p): p is string => !!p)

  const resolvedBody = resolveServiceBody(service.body, {
    phone_number_array: phoneNumbers,
    message: details.message,
    senderId: details.senderId ?? '',
  })

  const apiUrl = getSDKApiUrl()
  const useProxy = apiUrl !== 'indexdb'

  try {
    if (useProxy) {
      await fetch(`${apiUrl}/proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: service.url, method: service.method, headers: service.headers, body: resolvedBody }),
      })
    } else {
      await fetch(service.url, {
        method: service.method,
        headers: { 'content-type': 'application/json', ...Object.fromEntries(Object.entries(service.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v])) },
        body: JSON.stringify(resolvedBody),
      })
    }
    await Promise.all(
      transmissionLogs.map((log) => idbTransmissionLogService.update(log.id, { status: 'Sent' })),
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    await Promise.all(
      transmissionLogs.map((log) => idbTransmissionLogService.update(log.id, { status: 'Failed', errorMessage })),
    )
  }
})
