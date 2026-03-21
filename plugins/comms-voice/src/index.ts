import { Phone } from 'lucide-react'
import { registerCommType } from '@rahataid/projects-shared/communication'
import type { CommFrontendPlugin } from '@rahataid/projects-shared/communication'
import { VoiceDetails } from './voice-details.js'

export const commsVoicePlugin: CommFrontendPlugin = {
  type: 'voice',
  label: 'Voice Call',
  description: 'Send automated voice calls to beneficiaries',
  group: 'comms',
  IconComponent: Phone,
  DetailsComponent: VoiceDetails,
  canAdvance: (data) =>
    (typeof data.script === 'string' && data.script.trim().length > 0) ||
    (typeof data.audioUrl === 'string' && data.audioUrl.trim().length > 0),
}

registerCommType(commsVoicePlugin)
