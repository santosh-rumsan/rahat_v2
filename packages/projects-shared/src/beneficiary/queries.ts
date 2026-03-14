import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createBeneficiaryService, getSDKApiUrl } from '@rahataid/sdk'
import type { Beneficiary, CreateBeneficiaryInput, UpdateBeneficiaryInput } from '@rahataid/sdk'

function service() {
  return createBeneficiaryService(getSDKApiUrl())
}

export function beneficiaryKeys(projectId: string) {
  return {
    all: ['beneficiaries', projectId] as const,
    detail: (id: string) => ['beneficiaries', projectId, id] as const,
  }
}

export function useBeneficiaries(projectId: string) {
  return useQuery<Beneficiary[]>({
    queryKey: beneficiaryKeys(projectId).all,
    queryFn: () => service().list(projectId),
  })
}

export function useBeneficiary(projectId: string, id: string) {
  return useQuery<Beneficiary | undefined>({
    queryKey: beneficiaryKeys(projectId).detail(id),
    queryFn: () => service().get(projectId, id),
    enabled: !!id,
  })
}

export function useCreateBeneficiary(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBeneficiaryInput) => service().create(projectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: beneficiaryKeys(projectId).all }),
  })
}

export function useUpdateBeneficiary(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBeneficiaryInput }) =>
      service().update(projectId, id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: beneficiaryKeys(projectId).all })
      qc.invalidateQueries({ queryKey: beneficiaryKeys(projectId).detail(id) })
    },
  })
}

export function useDeleteBeneficiary(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => service().delete(projectId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: beneficiaryKeys(projectId).all }),
  })
}
