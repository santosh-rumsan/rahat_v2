import {
  RefreshCw,
  Calendar,
  BarChart2,
  LineChart,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@rs/ui'

// ─── types ────────────────────────────────────────────────────────────────────

interface PointForecastField<T = string> {
  data?: T
  header?: string
}

interface GlofasPointForecastData {
  alertLevel?: PointForecastField
  forecastDate?: PointForecastField
  maxProbability?: PointForecastField<number>
  peakForecasted?: PointForecastField
  maxProbabilityStep?: PointForecastField
  dischargeTendencyImage?: PointForecastField
}

export interface GlofasReturnPeriodTable {
  returnPeriodData?: string[][]
  returnPeriodHeaders?: string[]
}

export interface GlofasInfo {
  forecastDate?: string
  returnPeriod?: string
  pointForecastData?: GlofasPointForecastData
  returnPeriodTable?: GlofasReturnPeriodTable
  hydrographImageUrl?: string
}

export interface GlofasItem {
  id?: number
  sourceId?: number
  dataSource?: string
  info?: GlofasInfo
  createdAt?: string
  updatedAt?: string
  source?: { riverBasin?: string }
}

// ─── alert level color ────────────────────────────────────────────────────────

function alertLevelColor(level?: string): string {
  if (!level) return 'text-gray-500'
  const l = level.toLowerCase()
  if (l.includes('high') || l.includes('danger') || l.includes('red')) return 'text-red-600'
  if (l.includes('medium') || l.includes('warning') || l.includes('orange')) return 'text-amber-600'
  if (l.includes('low') || l.includes('yellow')) return 'text-yellow-600'
  return 'text-gray-500'
}

// ─── return period table ──────────────────────────────────────────────────────

export function ReturnPeriodTable({
  table,
  returnPeriod,
}: {
  table: GlofasReturnPeriodTable
  returnPeriod?: string
}) {
  const headers = table.returnPeriodHeaders ?? []
  const rows = table.returnPeriodData ?? []

  if (headers.length === 0 && rows.length === 0) return null

  const label = returnPeriod ? `ECMWF-ENS > ${returnPeriod} RP` : 'ECMWF-ENS Return Period'

  return (
    <div className="mt-5">
      <h4 className="text-sm font-bold text-[#1a1a1a] mb-3">{label}</h4>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-left font-semibold text-gray-500 border-b border-gray-100 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={cn(
                      'px-3 py-2 whitespace-nowrap',
                      ci === 0 ? 'font-semibold text-gray-700' : 'text-center text-gray-400',
                      cell && ci > 0 ? 'bg-purple-50 text-purple-700 font-medium' : '',
                    )}
                  >
                    {cell || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── hydrograph image ─────────────────────────────────────────────────────────

export function HydrographImage({ url }: { url: string }) {
  return (
    <div className="mt-5">
      <h4 className="text-sm font-bold text-[#1a1a1a] mb-3">Hydrograph</h4>
      <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
        <img
          src={url}
          alt="Hydrograph"
          className="w-full"
          onError={(e) => {
            const t = e.currentTarget
            t.style.display = 'none'
            const p = t.nextElementSibling as HTMLElement | null
            if (p) p.style.display = 'flex'
          }}
        />
        <div
          className="hidden items-center justify-center p-6 text-sm text-gray-400"
        >
          Hydrograph not available
        </div>
      </div>
    </div>
  )
}

// ─── glofas card ──────────────────────────────────────────────────────────────

export function GlofasCard({ item, onViewDetails }: { item: GlofasItem; onViewDetails?: () => void }) {
  const info = item.info
  const pfd = info?.pointForecastData
  const riverBasin = item.source?.riverBasin

  const returnPeriod = info?.returnPeriod
  const forecastDate = info?.forecastDate

  const maxProb = pfd?.maxProbability?.data
  const maxProbStep = pfd?.maxProbabilityStep?.data
  const alertLevel = pfd?.alertLevel?.data
  const peakForecasted = pfd?.peakForecasted?.data
  const dischargeTendencyImg = pfd?.dischargeTendencyImage?.data

  const updatedAt = item.updatedAt
  const hasTable =
    (info?.returnPeriodTable?.returnPeriodHeaders?.length ?? 0) > 0 ||
    (info?.returnPeriodTable?.returnPeriodData?.length ?? 0) > 0
  const hasHydrograph = !!info?.hydrographImageUrl

  function formatDate(d?: string) {
    if (!d) return 'N/A'
    return new Date(d).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5 flex gap-4 items-start">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <h3 className="text-base font-bold text-[#1a1a1a]">
                {riverBasin || 'Unknown Station'}
              </h3>
              {riverBasin && (
                <p className="text-xs text-gray-500 mt-0.5">{riverBasin}</p>
              )}
            </div>
            <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg font-medium flex-shrink-0">
              Steady
            </span>
          </div>

          {updatedAt && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 mb-4">
              <RefreshCw size={11} />
              <span>Last Synced at: {new Date(updatedAt).toLocaleString()}</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="flex items-start gap-2">
              <Calendar size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Forecast Date</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{formatDate(forecastDate)}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Return Period</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{returnPeriod || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <BarChart2 size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Discharge Tendency</p>
                {dischargeTendencyImg ? (
                  <img
                    src={dischargeTendencyImg}
                    alt="Discharge tendency"
                    className="h-6 mt-0.5"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-400">N/A</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <LineChart size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Peak Forecasted</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{peakForecasted || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Alert Level</p>
                <p className={cn('text-sm font-semibold', alertLevelColor(alertLevel))}>
                  {alertLevel || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Max Probability panel */}
        <div className="w-44 flex-shrink-0 rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-sm font-bold text-[#1a1a1a] mb-1">Maximum Probability</p>
          <p className="text-xs text-gray-400 mb-3">
            Max Probability Step: {maxProbStep || 'No Data'}
          </p>
          <p className="text-3xl font-black text-blue-600 mb-1">
            {maxProb !== undefined ? `${maxProb} %` : 'N/A'}
          </p>
          <p className="text-sm text-gray-500">{returnPeriod || 'N/A'}</p>
        </div>
      </div>

      {/* View details link */}
      {(hasTable || hasHydrograph) && onViewDetails && (
        <button
          onClick={onViewDetails}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-gray-100 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ExternalLink size={13} />
          Show return period table &amp; hydrograph
        </button>
      )}
    </div>
  )
}
