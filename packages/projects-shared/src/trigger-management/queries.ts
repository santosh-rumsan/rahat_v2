import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createTriggerStatementService,
  createTriggerService,
  createTriggerExecutionService,
  getSDKApiUrl,
} from '@rahataid/sdk'
import type {
  CreateTriggerStatementInput,
  UpdateTriggerStatementInput,
  CreateTriggerInput,
  UpdateTriggerInput,
  CreateTriggerExecutionInput,
} from '@rahataid/sdk'

function statementService() {
  return createTriggerStatementService(getSDKApiUrl())
}

function triggerService() {
  return createTriggerService(getSDKApiUrl())
}

function executionService() {
  return createTriggerExecutionService(getSDKApiUrl())
}

export const triggerKeys = {
  statements: (projectId: string) => ['trigger-statements', projectId] as const,
  statement: (id: string) => ['trigger-statements', 'detail', id] as const,
  triggers: (statementId: string) => ['triggers', statementId] as const,
  trigger: (id: string) => ['triggers', 'detail', id] as const,
  executions: (statementId: string) => ['trigger-executions', statementId] as const,
}

// Trigger Statements

export function useTriggerStatements(projectId: string) {
  return useQuery({
    queryKey: triggerKeys.statements(projectId),
    queryFn: () => statementService().list(projectId),
    enabled: !!projectId,
  })
}

export function useTriggerStatement(id: string) {
  return useQuery({
    queryKey: triggerKeys.statement(id),
    queryFn: () => statementService().get(id),
    enabled: !!id,
  })
}

export function useCreateTriggerStatement(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTriggerStatementInput) => statementService().create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: triggerKeys.statements(projectId) }),
  })
}

export function useUpdateTriggerStatement(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTriggerStatementInput }) =>
      statementService().update(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: triggerKeys.statements(projectId) })
      qc.invalidateQueries({ queryKey: triggerKeys.statement(id) })
    },
  })
}

export function useDeleteTriggerStatement(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => statementService().delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: triggerKeys.statements(projectId) }),
  })
}

// Triggers

export function useTriggers(statementId: string) {
  return useQuery({
    queryKey: triggerKeys.triggers(statementId),
    queryFn: () => triggerService().list(statementId),
    enabled: !!statementId,
  })
}

export const triggerProjectKeys = {
  byProject: (projectId: string) => ['triggers', 'project', projectId] as const,
}

export function useTriggersByProject(projectId: string) {
  return useQuery({
    queryKey: triggerProjectKeys.byProject(projectId),
    queryFn: () => triggerService().listByProject(projectId),
    enabled: !!projectId,
  })
}

export function useTrigger(id: string) {
  return useQuery({
    queryKey: triggerKeys.trigger(id),
    queryFn: () => triggerService().get(id),
    enabled: !!id,
  })
}

export function useCreateTrigger(statementId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTriggerInput) => triggerService().create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: triggerKeys.triggers(statementId) }),
  })
}

export function useUpdateTrigger(statementId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTriggerInput }) =>
      triggerService().update(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: triggerKeys.triggers(statementId) })
      qc.invalidateQueries({ queryKey: triggerKeys.trigger(id) })
    },
  })
}

export function useDeleteTrigger(statementId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => triggerService().delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: triggerKeys.triggers(statementId) }),
  })
}

// Trigger Executions

export function useTriggerExecutions(statementId: string) {
  return useQuery({
    queryKey: triggerKeys.executions(statementId),
    queryFn: () => executionService().list(statementId),
    enabled: !!statementId,
  })
}

export function useCreateTriggerExecution(statementId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTriggerExecutionInput) => executionService().create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: triggerKeys.executions(statementId) }),
  })
}
