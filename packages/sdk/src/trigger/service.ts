import type {
  Trigger,
  TriggerStatement,
  TriggerExecution,
  CreateTriggerInput,
  UpdateTriggerInput,
  CreateTriggerStatementInput,
  UpdateTriggerStatementInput,
  CreateTriggerExecutionInput,
} from '../types/trigger.js'

export interface TriggerStatementService {
  list(projectId: string): Promise<TriggerStatement[]>
  get(id: string): Promise<TriggerStatement | undefined>
  create(data: CreateTriggerStatementInput): Promise<TriggerStatement>
  update(id: string, data: UpdateTriggerStatementInput): Promise<TriggerStatement>
  delete(id: string): Promise<void>
}

export interface TriggerService {
  list(statementId: string): Promise<Trigger[]>
  listByProject(projectId: string): Promise<Trigger[]>
  get(id: string): Promise<Trigger | undefined>
  create(data: CreateTriggerInput): Promise<Trigger>
  update(id: string, data: UpdateTriggerInput): Promise<Trigger>
  delete(id: string): Promise<void>
}

export interface TriggerExecutionService {
  list(statementId: string): Promise<TriggerExecution[]>
  create(data: CreateTriggerExecutionInput): Promise<TriggerExecution>
}
