import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  TransmissionLog,
  CreateTransmissionLogInput,
} from '../types/campaign.js'

export interface CampaignService {
  list(projectId: string): Promise<Campaign[]>
  get(projectId: string, id: string): Promise<Campaign | undefined>
  create(projectId: string, data: CreateCampaignInput): Promise<Campaign>
  update(projectId: string, id: string, data: UpdateCampaignInput): Promise<Campaign>
  delete(projectId: string, id: string): Promise<void>
}

export interface TransmissionLogService {
  list(campaignId: string): Promise<TransmissionLog[]>
  create(data: CreateTransmissionLogInput): Promise<TransmissionLog>
  update(id: string, data: Partial<Pick<TransmissionLog, 'status' | 'errorMessage'>>): Promise<TransmissionLog>
  clearByCampaign(campaignId: string): Promise<void>
}
