import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createUserService, getSDKApiUrl } from '@rahataid/sdk'
import type { User, CreateUserInput, UpdateUserInput } from '@rahataid/sdk'

function service() {
  return createUserService(getSDKApiUrl())
}

export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: userKeys.all,
    queryFn: () => service().list(),
  })
}

export function useUser(id: string) {
  return useQuery<User | undefined>({
    queryKey: userKeys.detail(id),
    queryFn: () => service().get(id),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserInput) => service().create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      service().update(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: userKeys.all })
      qc.invalidateQueries({ queryKey: userKeys.detail(id) })
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => service().delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useImportUsers() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (records: CreateUserInput[]) => {
      const svc = service()
      const existing = await svc.list()
      const existingIds = new Set(existing.map((u) => u.id))
      const results: User[] = []
      for (const r of records) {
        if (r.id && existingIds.has(r.id)) continue
        results.push(await svc.create(r))
      }
      return results
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}
