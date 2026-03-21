import { MessageCircle } from 'lucide-react'
import { registerCommType } from '@rahataid/projects-shared/communication'
import type { CommFrontendPlugin } from '@rahataid/projects-shared/communication'
import { WhatsappDetails } from './whatsapp-details.js'

export const commsWhatsappPlugin: CommFrontendPlugin = {
  type: 'whatsapp',
  label: 'WhatsApp',
  description: 'Send WhatsApp messages to beneficiaries',
  group: 'comms',
  IconComponent: MessageCircle,
  DetailsComponent: WhatsappDetails,
  canAdvance: (data) => typeof data.message === 'string' && data.message.trim().length > 0,
}

registerCommType(commsWhatsappPlugin)
