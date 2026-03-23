import { Phone } from 'lucide-react'
import { registerCommType } from '@rahataid/projects-shared/communication'
import type { CommFrontendPlugin } from '@rahataid/projects-shared/communication'
import { CAMPAIGN_SEND_EVENT } from '@rahataid/projects-shared/communication'
import type { CampaignSendEventDetail } from '@rahataid/projects-shared/communication'
import { idbServiceService, idbTransmissionLogService, getIsProd, resolveServiceBody, getSDKApiUrl } from '@rahataid/sdk'
import type { VoiceDetails } from '@rahataid/sdk'
import { VoiceDetails as VoiceDetailsComponent } from './voice-details.js'

export const commsVoicePlugin: CommFrontendPlugin = {
  type: 'voice',
  label: 'Voice Call',
  description: 'Send automated voice calls to beneficiaries',
  group: 'comms',
  IconComponent: Phone,
  DetailsComponent: VoiceDetailsComponent,
  canAdvance: (data) =>
    (typeof data.script === 'string' && data.script.trim().length > 0) ||
    (typeof data.audioUrl === 'string' && data.audioUrl.trim().length > 0),
}

registerCommType(commsVoicePlugin)

// Listen for campaign send events and call the SIP/Voice webhook
if (typeof window !== 'undefined') window.addEventListener(CAMPAIGN_SEND_EVENT, async (e: Event) => {
  if (getIsProd()) return

  const { campaign, beneficiaries, transmissionLogs } = (e as CustomEvent<CampaignSendEventDetail>).detail

  if (campaign.communicationType !== 'voice') return

  const services = await idbServiceService.list()
  const service = services.find((s) => s.serviceType === 'SIP' && s.isEnabled)
  if (!service) return

  const phoneNumbers = beneficiaries.map((b) => b.phone).filter((p): p is string => !!p)
  const details = campaign.details as VoiceDetails

  const resolvedBody = resolveServiceBody(service.body, {
    phone_number_array: phoneNumbers,
    script: details.script ?? '',
    audioUrl: details.audioUrl ?? '',
    language: details.language ?? '',
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
