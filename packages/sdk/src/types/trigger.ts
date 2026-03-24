export type TriggerOperator = '>' | '>=' | '<' | '<=' | '='

export type TriggerItemType = 'automated' | 'manual'

export type TriggerStatus = 'triggered' | 'not_triggered'

export interface TriggerStatement {
  id: string
  projectId: string
  phase: string
  riverBasin?: string
  taskGroupId?: string
  mandatoryThreshold: number
  optionalThreshold: number
  status: TriggerStatus
  triggeredAt?: string
  createdAt: string
}

export interface Trigger {
  id: string
  statementId: string
  projectId: string
  title: string
  description?: string
  isOptional: boolean
  triggerType: TriggerItemType
  status: TriggerStatus
  triggeredAt?: string
  createdAt: string
  // Automated trigger fields
  sourceId?: string
  station?: string
  operator?: TriggerOperator
  value?: number
  config?: Record<string, unknown>
}

export interface TriggerExecution {
  id: string
  statementId: string
  projectId: string
  triggeredAt: string
  triggeredBy?: string
  note?: string
}

export type CreateTriggerStatementInput = Omit<TriggerStatement, 'id' | 'createdAt' | 'status' | 'triggeredAt'>
export type UpdateTriggerStatementInput = Partial<Omit<TriggerStatement, 'id' | 'projectId' | 'createdAt'>>

export type CreateTriggerInput = Omit<Trigger, 'id' | 'createdAt' | 'status' | 'triggeredAt'>
export type UpdateTriggerInput = Partial<Omit<Trigger, 'id' | 'statementId' | 'projectId' | 'createdAt'>>

export type CreateTriggerExecutionInput = Omit<TriggerExecution, 'id'>
