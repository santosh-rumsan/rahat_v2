export type {
  CommunicationType,
  CampaignStatus,
  TransmissionStatus,
  SmsDetails,
  WhatsappDetails,
  VoiceDetails,
  CampaignDetails,
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  TransmissionLog,
  CreateTransmissionLogInput,
} from '@rahataid/sdk'

export const COMMUNICATION_TYPES: { value: import('@rahataid/sdk').CommunicationType; label: string; description: string }[] = [
  { value: 'sms', label: 'SMS', description: 'Send text messages to beneficiaries' },
  { value: 'whatsapp', label: 'WhatsApp', description: 'Send WhatsApp messages to beneficiaries' },
  { value: 'voice', label: 'Voice Call', description: 'Send automated voice calls to beneficiaries' },
]

export const CAMPAIGN_STATUS_COLORS: Record<import('@rahataid/sdk').CampaignStatus, string> = {
  Draft: 'bg-slate-100 text-slate-600',
  Scheduled: 'bg-sky-100 text-sky-700',
  Sending: 'bg-violet-100 text-violet-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  Failed: 'bg-rose-100 text-rose-800',
}

export const TRANSMISSION_STATUS_COLORS: Record<import('@rahataid/sdk').TransmissionStatus, string> = {
  Pending: 'bg-slate-100 text-slate-600',
  Sent: 'bg-sky-100 text-sky-700',
  Delivered: 'bg-emerald-100 text-emerald-800',
  Failed: 'bg-rose-100 text-rose-800',
}

export const COMM_TYPE_ICONS: Record<import('@rahataid/sdk').CommunicationType, string> = {
  sms: '💬',
  whatsapp: '📱',
  voice: '📞',
}

export const COMM_TYPE_COLORS: Record<import('@rahataid/sdk').CommunicationType, string> = {
  sms: 'bg-blue-100 text-blue-700',
  whatsapp: 'bg-green-100 text-green-700',
  voice: 'bg-orange-100 text-orange-700',
}
