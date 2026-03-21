import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import {
  useForecastSourceData,
  GlofasItem,
  ReturnPeriodTable,
  HydrographImage,
} from '@rahataid/plugin-forecast/frontend'

export const Route = createFileRoute('/_app/forecast/$sourceId/glofas/$itemIndex')({
  component: GlofasDetailPage,
})

function GlofasDetailPage() {
  const { sourceId, itemIndex } = Route.useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useForecastSourceData(sourceId)

  function goBack() {
    navigate({ to: '/forecast' })
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Loading…
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Failed to load data.
      </div>
    )
  }

  const d = data as Record<string, unknown>
  const items: GlofasItem[] = Array.isArray(d.data) ? (d.data as GlofasItem[]) : []
  const item = items[Number(itemIndex)]

  if (!item) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Item not found.
      </div>
    )
  }

  const info = item.info
  const riverBasin = item.source?.riverBasin
  const returnPeriod = info?.returnPeriod
  const hasTable =
    (info?.returnPeriodTable?.returnPeriodHeaders?.length ?? 0) > 0 ||
    (info?.returnPeriodTable?.returnPeriodData?.length ?? 0) > 0
  const hasHydrograph = !!info?.hydrographImageUrl

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="px-8 pt-7 pb-5 border-b border-gray-100">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Forecast Data
        </button>
        <h1 className="text-2xl font-black text-[#1a1a1a]">
          {riverBasin || 'GloFAS Details'}
        </h1>
        {returnPeriod && (
          <p className="text-sm text-gray-400 mt-1">Return Period: {returnPeriod}</p>
        )}
      </div>

      <div className="px-8 py-8 max-w-4xl space-y-6">
        {hasTable && (
          <ReturnPeriodTable table={info!.returnPeriodTable!} returnPeriod={returnPeriod} />
        )}
        {hasHydrograph && <HydrographImage url={info!.hydrographImageUrl!} />}
        {!hasTable && !hasHydrograph && (
          <p className="text-sm text-gray-400">No additional details available.</p>
        )}
      </div>
    </div>
  )
}
