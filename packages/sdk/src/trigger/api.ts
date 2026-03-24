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
import type { TriggerStatementService, TriggerService, TriggerExecutionService } from './service.js'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

export function createApiTriggerStatementService(baseUrl: string): TriggerStatementService {
  const base = `${baseUrl}/trigger-statements`

  return {
    list(projectId) {
      return apiFetch<TriggerStatement[]>(`${base}?projectId=${projectId}`)
    },
    get(id) {
      return apiFetch<TriggerStatement>(`${base}/${id}`)
    },
    create(data: CreateTriggerStatementInput) {
      return apiFetch<TriggerStatement>(base, { method: 'POST', body: JSON.stringify(data) })
    },
    update(id, data: UpdateTriggerStatementInput) {
      return apiFetch<TriggerStatement>(`${base}/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    },
    async delete(id) {
      await apiFetch<void>(`${base}/${id}`, { method: 'DELETE' })
    },
  }
}

export function createApiTriggerService(baseUrl: string): TriggerService {
  const base = `${baseUrl}/triggers`

  return {
    list(statementId) {
      return apiFetch<Trigger[]>(`${base}?statementId=${statementId}`)
    },
    listByProject(projectId) {
      return apiFetch<Trigger[]>(`${base}?projectId=${projectId}`)
    },
    get(id) {
      return apiFetch<Trigger>(`${base}/${id}`)
    },
    create(data: CreateTriggerInput) {
      return apiFetch<Trigger>(base, { method: 'POST', body: JSON.stringify(data) })
    },
    update(id, data: UpdateTriggerInput) {
      return apiFetch<Trigger>(`${base}/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    },
    async delete(id) {
      await apiFetch<void>(`${base}/${id}`, { method: 'DELETE' })
    },
  }
}

export function createApiTriggerExecutionService(baseUrl: string): TriggerExecutionService {
  const base = `${baseUrl}/trigger-executions`

  return {
    list(statementId) {
      return apiFetch<TriggerExecution[]>(`${base}?statementId=${statementId}`)
    },
    create(data: CreateTriggerExecutionInput) {
      return apiFetch<TriggerExecution>(base, { method: 'POST', body: JSON.stringify(data) })
    },
  }
}
