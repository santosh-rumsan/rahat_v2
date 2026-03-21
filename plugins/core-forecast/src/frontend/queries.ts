import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createForecastSourceService,
  getSDKApiUrl,
} from '@rahataid/sdk'
import type { CreateForecastSourceInput, UpdateForecastSourceInput } from '@rahataid/sdk'
import type { ForecastSource } from '@rahataid/sdk'

function service() {
  return createForecastSourceService(getSDKApiUrl())
}

export const forecastKeys = {
  all: ['forecast-sources'] as const,
  detail: (id: string) => ['forecast-sources', id] as const,
  data: (id: string) => ['forecast-sources', id, 'data'] as const,
}

export function useForecastSources() {
  return useQuery({
    queryKey: forecastKeys.all,
    queryFn: () => service().list(),
  })
}

export function useForecastSource(id: string) {
  return useQuery({
    queryKey: forecastKeys.detail(id),
    queryFn: () => service().get(id),
    enabled: !!id,
  })
}

export function useForecastSourceData(id: string) {
  return useQuery({
    queryKey: forecastKeys.data(id),
    queryFn: () => service().fetchData(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useCreateForecastSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateForecastSourceInput) => service().create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: forecastKeys.all }),
  })
}

export function useUpdateForecastSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateForecastSourceInput }) =>
      service().update(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: forecastKeys.all })
      qc.invalidateQueries({ queryKey: forecastKeys.detail(id) })
    },
  })
}

export function useDeleteForecastSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => service().delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: forecastKeys.all }),
  })
}

export function useImportForecastSources() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (sources: (CreateForecastSourceInput & { id?: string })[]) => {
      const svc = service()
      const existing = await svc.list()
      const existingIds = new Set(existing.map((s) => s.id))
      const results: ForecastSource[] = []
      for (const s of sources) {
        if (s.id && existingIds.has(s.id)) continue
        results.push(await svc.create(s))
      }
      return results
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: forecastKeys.all }),
  })
}
