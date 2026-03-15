import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createProjectService, createFundService, getSDKApiUrl } from '@rahataid/sdk'
import type { CreateProjectInput, UpdateProjectInput, FundAllocation } from '@rahataid/sdk'

function service() {
  return createProjectService(getSDKApiUrl())
}

function fundService() {
  return createFundService(getSDKApiUrl())
}

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
}

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: () => service().list(),
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => service().get(id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProjectInput) => service().create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectInput }) =>
      service().update(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: projectKeys.all })
      qc.invalidateQueries({ queryKey: projectKeys.detail(id) })
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => service().delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  })
}

export function useProjectAllocations(projectId: string) {
  return useQuery<FundAllocation[]>({
    queryKey: ['fund-allocations', 'by-project', projectId],
    queryFn: async () => {
      const all = await fundService().listAllocations()
      return all.filter((a) => a.projectId === projectId)
    },
    enabled: !!projectId,
  })
}
