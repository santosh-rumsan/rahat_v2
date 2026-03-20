export type CommunicationType = 'sms' | 'whatsapp' | 'voice'
export type CampaignStatus = 'Draft' | 'Scheduled' | 'Sending' | 'Completed' | 'Failed'
export type TransmissionStatus = 'Pending' | 'Sent' | 'Delivered' | 'Failed'

export interface SmsDetails {
  message: string
  senderId?: string
}

export interface WhatsappDetails {
  message: string
  templateId?: string
}

export interface VoiceDetails {
  script?: string
  audioUrl?: string
  language?: string
}

export type CampaignDetails = SmsDetails | WhatsappDetails | VoiceDetails

export interface Campaign {
  id: string
  name: string
  description: string
  communicationType: CommunicationType
  status: CampaignStatus
  details: CampaignDetails
  beneficiaryIds: string[]
  beneficiaryGroupIds: string[]
  createdAt: string
  scheduledAt?: string
  sentAt?: string
}

export interface CreateCampaignInput {
  name: string
  description: string
  communicationType: CommunicationType
  status?: CampaignStatus
  details: CampaignDetails
  beneficiaryIds?: string[]
  beneficiaryGroupIds?: string[]
  scheduledAt?: string
}

export interface UpdateCampaignInput {
  name?: string
  description?: string
  status?: CampaignStatus
  details?: CampaignDetails
  beneficiaryIds?: string[]
  beneficiaryGroupIds?: string[]
  scheduledAt?: string
  sentAt?: string
}

export interface TransmissionLog {
  id: string
  campaignId: string
  beneficiaryId: string
  beneficiaryName?: string
  status: TransmissionStatus
  errorMessage?: string
  timestamp: string
}

export interface CreateTransmissionLogInput {
  campaignId: string
  beneficiaryId: string
  beneficiaryName?: string
  status: TransmissionStatus
  errorMessage?: string
}
