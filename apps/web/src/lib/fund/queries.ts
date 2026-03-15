import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createFundService, getSDKApiUrl } from '@rahataid/sdk'
import type { CreateFundInput, CreateFundAllocationInput } from '@rahataid/sdk'

function service() {
  return createFundService(getSDKApiUrl())
}

export const fundKeys = {
  funds: ['funds'] as const,
  allocations: ['fund-allocations'] as const,
  logs: ['allocation-logs'] as const,
}

// ── Funds ──────────────────────────────────────────────────────────────────

export function useFunds() {
  return useQuery({
    queryKey: fundKeys.funds,
    queryFn: () => service().listFunds(),
  })
}

export function useCreateFund() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFundInput) => service().createFund(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fundKeys.funds })
      qc.invalidateQueries({ queryKey: fundKeys.logs })
    },
  })
}

export function useDeleteFund() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => service().deleteFund(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: fundKeys.funds }),
  })
}

// ── Allocations ────────────────────────────────────────────────────────────

export function useFundAllocations() {
  return useQuery({
    queryKey: fundKeys.allocations,
    queryFn: () => service().listAllocations(),
  })
}

export function useCreateAllocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFundAllocationInput) => service().createAllocation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fundKeys.allocations })
      qc.invalidateQueries({ queryKey: fundKeys.logs })
    },
  })
}

export function useDeleteAllocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => service().deleteAllocation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fundKeys.allocations })
      qc.invalidateQueries({ queryKey: fundKeys.logs })
    },
  })
}

// ── Logs ───────────────────────────────────────────────────────────────────

export function useAllocationLogs() {
  return useQuery({
    queryKey: fundKeys.logs,
    queryFn: () => service().listLogs(),
  })
}
