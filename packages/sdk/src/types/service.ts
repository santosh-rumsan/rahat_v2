export const SERVICE_TYPES = ['SMS', 'WHATSAPP', 'SLACK', 'SIP', 'TOKEN'] as const
export type ServiceType = (typeof SERVICE_TYPES)[number]

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  SMS: 'SMS',
  WHATSAPP: 'WhatsApp',
  SLACK: 'Slack',
  SIP: 'SIP',
  TOKEN: 'Token',
}

export interface Service {
  id: string
  name: string
  serviceType: ServiceType
  url: string
  method: string
  headers: Record<string, string>
  body: Record<string, unknown>
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateServiceInput {
  id?: string
  name: string
  serviceType: ServiceType
  url: string
  method?: string
  headers?: Record<string, string>
  body?: Record<string, unknown>
  isEnabled?: boolean
}

export type UpdateServiceInput = Partial<CreateServiceInput>
