import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createTaskService, getSDKApiUrl } from '@rahataid/sdk'
import type { CreateTaskInput, UpdateTaskInput } from '@rahataid/sdk'

function service() {
  return createTaskService(getSDKApiUrl())
}

export const taskKeys = {
  all: (projectId: string) => ['tasks', projectId] as const,
  detail: (id: string) => ['tasks', 'detail', id] as const,
}

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: taskKeys.all(projectId),
    queryFn: () => service().list(projectId),
    enabled: !!projectId,
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => service().get(id),
    enabled: !!id,
  })
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTaskInput) => service().create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all(projectId) }),
  })
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      service().update(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: taskKeys.all(projectId) })
      qc.invalidateQueries({ queryKey: taskKeys.detail(id) })
    },
  })
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => service().delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all(projectId) }),
  })
}
