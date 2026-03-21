import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createVendorService, getSDKApiUrl } from '@rahataid/sdk'
import type { Vendor, CreateVendorInput, UpdateVendorInput } from '@rahataid/sdk'

function service() {
  return createVendorService(getSDKApiUrl())
}

export const vendorKeys = {
  all: ['vendors'] as const,
  detail: (id: string) => ['vendors', id] as const,
}

export function useVendors() {
  return useQuery<Vendor[]>({
    queryKey: vendorKeys.all,
    queryFn: () => service().list(),
  })
}

export function useVendor(id: string) {
  return useQuery<Vendor | undefined>({
    queryKey: vendorKeys.detail(id),
    queryFn: () => service().get(id),
    enabled: !!id,
  })
}

export function useCreateVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVendorInput) => service().create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: vendorKeys.all }),
  })
}

export function useUpdateVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendorInput }) =>
      service().update(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: vendorKeys.all })
      qc.invalidateQueries({ queryKey: vendorKeys.detail(id) })
    },
  })
}

export function useDeleteVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => service().delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: vendorKeys.all }),
  })
}

export function useImportVendors() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (records: CreateVendorInput[]) =>
      Promise.all(records.map((r) => service().create(r))),
    onSuccess: () => qc.invalidateQueries({ queryKey: vendorKeys.all }),
  })
}
