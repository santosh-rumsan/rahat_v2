import { MessageSquare } from 'lucide-react'
import { registerCommType } from '@rahataid/projects-shared/communication'
import type { CommFrontendPlugin } from '@rahataid/projects-shared/communication'
import { SmsDetails } from './sms-details.js'

export const commsSmsPlugin: CommFrontendPlugin = {
  type: 'sms',
  label: 'SMS',
  description: 'Send text messages to beneficiaries',
  group: 'comms',
  IconComponent: MessageSquare,
  DetailsComponent: SmsDetails,
  canAdvance: (data) => typeof data.message === 'string' && data.message.trim().length > 0,
}

registerCommType(commsSmsPlugin)
