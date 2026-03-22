import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Plus,
  RefreshCw,
  Activity,
  Pencil,
  Trash2,
  MoreHorizontal,
  Droplets,
  Thermometer,
  Waves,
  CloudRain,
  MapPin,
  Radio,
  AlertTriangle,
  Skull,
  TrendingUp,
  TrendingDown,
  Minus,
  Upload,
  FileJson,
  Link,
  X,
} from 'lucide-react'
import { cn } from '@rs/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@rs/ui/dialog'
import { toast } from '@rs/ui/toast'
import { FORECAST_SOURCE_TYPE_LABELS } from '@rahataid/sdk'
import type { ForecastSourceType, ForecastSource, CreateForecastSourceInput } from '@rahataid/sdk'
import {
  useForecastSources,
  useForecastSourceData,
  useDeleteForecastSource,
  useImportForecastSources,
} from './queries.js'
import { GlofasCard } from './glofas-card.js'
import type { GlofasItem } from './glofas-card.js'

// ─── import dialog ────────────────────────────────────────────────────────────

type ImportTab = 'file' | 'url'

function ImportDialog({
  open,
  onOpenChange,
  onImport,
  isImporting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (records: CreateForecastSourceInput[]) => void
  isImporting: boolean
}) {
  const [tab, setTab] = React.useState<ImportTab>('file')
  const [url, setUrl] = React.useState('')
  const [isDragging, setIsDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function reset() {
    setUrl('')
    setTab('file')
    setError(null)
  }

  function handleClose() {
    if (isImporting) return
    reset()
    onOpenChange(false)
  }

  function parseAndImport(jsonText: string) {
    try {
      const json = JSON.parse(jsonText)
      if (json.type !== 'forecast') {
        setError(`Type mismatch: expected "forecast", got "${json.type ?? 'unknown'}"`)
        return
      }
      if (!Array.isArray(json.data)) {
        setError('Invalid format: "data" must be an array')
        return
      }
      setError(null)
      onImport(json.data as CreateForecastSourceInput[])
    } catch {
      setError('Invalid JSON file')
    }
  }

  async function handleFile(file: File) {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setError('Please select a JSON file')
      return
    }
    parseAndImport(await file.text())
  }

  async function handleUrlImport(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    try {
      const response = await fetch(trimmed)
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
      parseAndImport(await response.text())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch URL')
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Forecast Sources</DialogTitle>
          <DialogDescription>
            Import sources from a JSON file or a URL. File must have <code>type: "forecast"</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mt-1">
          {(['file', 'url'] as ImportTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === t
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'file' ? <Upload size={14} /> : <Link size={14} />}
              {t === 'file' ? 'From File' : 'From URL'}
            </button>
          ))}
        </div>

        {tab === 'file' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-1 flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
                e.target.value = ''
              }}
            />
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
              <FileJson size={22} className="text-gray-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Drop a JSON file here</p>
              <p className="text-xs text-gray-400 mt-0.5">or click to browse</p>
            </div>
          </div>
        )}

        {tab === 'url' && (
          <form onSubmit={handleUrlImport} className="mt-1 space-y-3">
            <div className="relative">
              <Link size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                placeholder="https://example.com/forecast.json"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!url.trim() || isImporting}
              className="w-full py-2.5 text-sm font-medium bg-[#1a1a1a] hover:bg-[#333] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Importing…' : 'Import from URL'}
            </button>
          </form>
        )}

        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        {isImporting && tab === 'file' && (
          <p className="text-center text-sm text-gray-500 mt-1">Importing…</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── icons per type ───────────────────────────────────────────────────────────

const TYPE_ICONS: Record<ForecastSourceType, React.ReactNode> = {
  RIVER_WATCH: <Waves size={15} />,
  RAINFALL_WATCH: <CloudRain size={15} />,
  GLOFAS: <Activity size={15} />,
  HEAT_INDEX: <Thermometer size={15} />,
}

const TYPE_COLORS: Record<ForecastSourceType, string> = {
  RIVER_WATCH: 'bg-blue-100 text-blue-700',
  RAINFALL_WATCH: 'bg-cyan-100 text-cyan-700',
  GLOFAS: 'bg-purple-100 text-purple-700',
  HEAT_INDEX: 'bg-orange-100 text-orange-700',
}

// ─── status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null
  const s = status.toLowerCase()
  const isAbove = s.includes('above') || s.includes('danger')
  const isWarning = s.includes('warning')

  return (
    <span
      className={cn(
        'px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide',
        isAbove
          ? 'bg-red-100 text-red-700'
          : isWarning
            ? 'bg-amber-100 text-amber-700'
            : 'bg-green-100 text-green-700',
      )}
    >
      {status}
    </span>
  )
}

// ─── steady indicator ─────────────────────────────────────────────────────────

function SteadyIcon({ steady }: { steady?: string }) {
  if (!steady) return null
  const s = steady.toUpperCase()
  if (s === 'RISING') return <TrendingUp size={13} className="text-red-500" />
  if (s === 'FALLING') return <TrendingDown size={13} className="text-blue-500" />
  return <Minus size={13} className="text-gray-400" />
}

// ─── river watch card ─────────────────────────────────────────────────────────

interface RiverWatchInfo {
  name?: string
  basin?: string
  status?: string
  steady?: string
  district?: string
  stationIndex?: string
  warning_level?: string
  danger_level?: string
  waterLevel?: { value: number; datetime: string }
}

function RiverWatchCard({ info }: { info: RiverWatchInfo }) {
  const waterLevel = info.waterLevel?.value
  const waterLevelTime = info.waterLevel?.datetime
  const hasData = waterLevel !== undefined

  const isAboveDanger =
    hasData && info.danger_level && waterLevel >= parseFloat(info.danger_level)
  const isAboveWarning =
    hasData && info.warning_level && waterLevel >= parseFloat(info.warning_level)

  const levelColor = isAboveDanger
    ? 'text-red-600 bg-red-50 border-red-200'
    : isAboveWarning
      ? 'text-amber-600 bg-amber-50 border-amber-200'
      : 'text-blue-600 bg-green-50 border-green-200'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <h3 className="text-base font-bold text-[#1a1a1a]">{info.name || 'Unknown Station'}</h3>
            {info.basin && <p className="text-xs text-gray-500 mt-0.5">{info.basin}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <SteadyIcon steady={info.steady} />
            {info.steady && (
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {info.steady}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-green-600 mb-4">
          <RefreshCw size={11} className="animate-none" />
          <span>Data available</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {info.stationIndex && (
            <div className="flex items-start gap-2">
              <Radio size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Station Index</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{info.stationIndex}</p>
              </div>
            </div>
          )}
          {info.district && (
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">District</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{info.district}</p>
              </div>
            </div>
          )}
          {info.warning_level && (
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Warning Level</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{info.warning_level}</p>
              </div>
            </div>
          )}
          {info.danger_level && (
            <div className="flex items-start gap-2">
              <Skull size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Danger Level</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{info.danger_level}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          'w-40 flex-shrink-0 rounded-xl border-2 p-4 text-center',
          hasData ? levelColor : 'bg-gray-50 border-gray-200 text-gray-400',
        )}
      >
        {hasData ? (
          <>
            <p className="text-3xl font-black mb-0.5">{waterLevel}</p>
            <p className="text-xs font-semibold mb-2">Water Level</p>
            {waterLevelTime && (
              <p className="text-[10px] text-gray-500 leading-tight">
                {new Date(waterLevelTime).toLocaleString()}
              </p>
            )}
            <div className="mt-2">
              <StatusBadge status={info.status} />
            </div>
          </>
        ) : (
          <p className="text-xs">No data</p>
        )}
      </div>
    </div>
  )
}

// ─── rainfall card ────────────────────────────────────────────────────────────

const RAINFALL_PERIODS = [
  { key: 'rain_1h', label: '1 hour', warning: '60mm' },
  { key: 'rain_3h', label: '3 hours', warning: '80mm' },
  { key: 'rain_6h', label: '6 hours', warning: '100mm' },
  { key: 'rain_12h', label: '12 hours', warning: '120mm' },
  { key: 'rain_24h', label: '24 hours', warning: '140mm' },
] as const

interface RainfallInfo {
  name?: string
  basin?: string
  status?: string
  stationIndex?: string
  district?: string
  rain_1h?: number
  rain_3h?: number
  rain_6h?: number
  rain_12h?: number
  rain_24h?: number
}

function RainfallCard({ info }: { info: RainfallInfo }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5 flex gap-4">
        <div className="w-44 flex-shrink-0">
          <h3 className="text-base font-bold text-[#1a1a1a] mb-1">{info.name || 'N/A'}</h3>
          {info.basin && <p className="text-xs text-gray-500 mb-3">{info.basin}</p>}
          <StatusBadge status={info.status} />
          <div className="flex items-center gap-1.5 text-xs text-green-600 mt-3">
            <RefreshCw size={11} />
            <span>Data available</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Radio size={11} className="text-gray-400" />
              <span>Index: {info.stationIndex ?? 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={11} className="text-gray-400" />
              <span>{info.district ?? 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-5 gap-2">
          {RAINFALL_PERIODS.map((p) => {
            const val = info[p.key]
            const hasVal = val !== undefined && val !== null
            return (
              <div key={p.key} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className={cn('text-lg font-bold mb-0.5', hasVal ? 'text-blue-600' : 'text-gray-300')}>
                  {hasVal ? `${val}mm` : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 font-medium mb-2">{p.label}</p>
                <div className="border-t border-gray-200 pt-2">
                  <p className="text-[10px] text-gray-400">Warning:</p>
                  <p className="text-[10px] text-gray-500 font-medium">{p.warning}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── generic data card ────────────────────────────────────────────────────────

function GenericDataCard({ data }: { data: unknown }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

// ─── extract items from raw api response ──────────────────────────────────────

function extractItems(sourceType: ForecastSourceType, data: unknown): unknown[] {
  if (!data) return []
  const d = data as Record<string, unknown>
  if (sourceType === 'GLOFAS') {
    // GLOFAS returns { success: true, data: [...] }
    return Array.isArray(d.data) ? d.data : []
  }
  // RIVER_WATCH / RAINFALL_WATCH return { data: { info: [...] } }
  const inner = d.data as Record<string, unknown> | undefined
  return Array.isArray(inner?.info) ? (inner.info as unknown[]) : []
}

// ─── source data view ─────────────────────────────────────────────────────────

function SourceDataView({ source }: { source: ForecastSource }) {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch, isFetching } = useForecastSourceData(source.id)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
        <RefreshCw size={14} className="animate-spin" />
        Fetching data…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-6">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-sm text-red-600">Failed to fetch data from this source.</p>
          <button
            onClick={() => refetch()}
            className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  const items = extractItems(source.sourceType, data)

  if (items.length === 0) {
    return (
      <div className="py-8 text-sm text-gray-400 flex items-center justify-between">
        <span>No records returned from this source.</span>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
        >
          <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3 py-2">
      {items.map((item, idx) => {
        const i = item as Record<string, unknown>

        if (source.sourceType === 'RIVER_WATCH') {
          const ri: RiverWatchInfo = {
            name: i.name as string,
            basin: i.basin as string,
            status: i.status as string,
            steady: i.steady as string,
            district: i.district as string,
            stationIndex: i.stationIndex as string,
            warning_level: i.warning_level as string,
            danger_level: i.danger_level as string,
            waterLevel: i.waterLevel as { value: number; datetime: string },
          }
          return <RiverWatchCard key={idx} info={ri} />
        }

        if (source.sourceType === 'RAINFALL_WATCH') {
          const ri: RainfallInfo = {
            name: i.name as string,
            basin: i.basin as string,
            status: i.status as string,
            stationIndex: i.stationIndex as string,
            district: i.district as string,
            rain_1h: i.rain_1h as number,
            rain_3h: i.rain_3h as number,
            rain_6h: i.rain_6h as number,
            rain_12h: i.rain_12h as number,
            rain_24h: i.rain_24h as number,
          }
          return <RainfallCard key={idx} info={ri} />
        }

        if (source.sourceType === 'GLOFAS') {
          return (
            <GlofasCard
              key={idx}
              item={item as GlofasItem}
              onViewDetails={() =>
                navigate({
                  to: '/forecast/$sourceId/glofas/$itemIndex',
                  params: { sourceId: source.id, itemIndex: String(idx) },
                })
              }
            />
          )
        }

        return <GenericDataCard key={idx} data={item} />
      })}
    </div>
  )
}

// ─── empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <Droplets size={24} className="text-blue-400" />
      </div>
      <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">No data sources yet</h3>
      <p className="text-sm text-gray-400 mb-5 max-w-xs">
        Add your first forecast data source to start monitoring river, rainfall, or climate data.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#333] transition-colors"
      >
        <Plus size={15} />
        Add data source
      </button>
    </div>
  )
}

// ─── source list item ─────────────────────────────────────────────────────────

function SourceListItem({
  source,
  isSelected,
  onSelect,
}: {
  source: ForecastSource
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-colors',
        isSelected ? 'bg-white shadow-sm' : 'hover:bg-white/50',
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          TYPE_COLORS[source.sourceType],
        )}
      >
        {TYPE_ICONS[source.sourceType]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1a1a1a] truncate">{source.name}</p>
        <p className="text-xs text-gray-400">{FORECAST_SOURCE_TYPE_LABELS[source.sourceType]}</p>
      </div>
      {!source.isActive && (
        <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
          Paused
        </span>
      )}
    </button>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

export function ForecastPage() {
  const navigate = useNavigate()
  const { data: sources = [], isLoading } = useForecastSources()
  const deleteMutation = useDeleteForecastSource()
  const importMutation = useImportForecastSources()
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [importOpen, setImportOpen] = React.useState(false)

  function handleImport(records: CreateForecastSourceInput[]) {
    importMutation.mutate(records, {
      onSuccess: (imported) => {
        toast.success(`Imported ${imported.length} source${imported.length !== 1 ? 's' : ''}`)
        setImportOpen(false)
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Import failed')
      },
    })
  }

  const selected = sources.find((s) => s.id === selectedId) ?? null
  const sourceTypes = [...new Set(sources.map((s) => s.sourceType))] as ForecastSourceType[]

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Loading…
      </div>
    )
  }

  if (sources.length === 0) {
    return (
      <div className="h-full bg-white">
        <ImportDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          onImport={handleImport}
          isImporting={importMutation.isPending}
        />
        <div className="px-8 pt-7 pb-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1a1a1a]">Forecast Data</h1>
            <p className="text-sm text-gray-400 mt-0.5">Track all forecast data sources here</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setImportOpen(true)}
              disabled={importMutation.isPending}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40"
            >
              <Upload size={15} />
              {importMutation.isPending ? 'Importing…' : 'Import JSON'}
            </button>
          </div>
        </div>
        <EmptyState onAdd={() => navigate({ to: '/forecast/add' })} />
      </div>
    )
  }

  return (
    <div className="flex h-full bg-[#f0f0f0] overflow-hidden">
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImport}
        isImporting={importMutation.isPending}
      />
      {/* Left sidebar */}
      <div className="w-[260px] flex-shrink-0 flex flex-col bg-[#f0f0f0]">
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-[#1a1a1a]">Sources</h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setImportOpen(true)}
                disabled={importMutation.isPending}
                title="Import from JSON"
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-40"
              >
                <Upload size={13} />
                {importMutation.isPending ? 'Importing…' : 'Import'}
              </button>
              <button
                onClick={() => navigate({ to: '/forecast/add' })}
                className="flex items-center gap-1 bg-[#1a1a1a] hover:bg-[#333] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
              >
                <Plus size={13} />
                Add
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {sources.length} configured · {sources.filter((s) => s.isActive).length} active
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
          {sourceTypes.map((type) => {
            const group = sources.filter((s) => s.sourceType === type)
            return (
              <div key={type}>
                <div
                  className={cn(
                    'flex items-center gap-1.5 px-1 mb-1.5 text-xs font-semibold uppercase tracking-wide',
                    TYPE_COLORS[type].split(' ')[1],
                  )}
                >
                  {TYPE_ICONS[type]}
                  {FORECAST_SOURCE_TYPE_LABELS[type]}
                </div>
                <div className="space-y-0.5">
                  {group.map((s) => (
                    <SourceListItem
                      key={s.id}
                      source={s}
                      isSelected={s.id === selectedId}
                      onSelect={() => setSelectedId(s.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right detail panel */}
      {selected ? (
        <div className="flex-1 bg-white rounded-l-3xl overflow-hidden flex flex-col min-w-0">
          <div className="px-8 pt-7 pb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    TYPE_COLORS[selected.sourceType],
                  )}
                >
                  {TYPE_ICONS[selected.sourceType]}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#1a1a1a]">{selected.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-semibold',
                        TYPE_COLORS[selected.sourceType],
                      )}
                    >
                      {FORECAST_SOURCE_TYPE_LABELS[selected.sourceType]}
                    </span>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-semibold',
                        selected.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500',
                      )}
                    >
                      {selected.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    navigate({
                      to: '/forecast/$sourceId/edit',
                      params: { sourceId: selected.id },
                    })
                  }
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors"
                >
                  <Pencil size={13} />
                  Edit
                </button>
                <div className="relative group">
                  <button className="text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100">
                    <MoreHorizontal size={16} />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1 hidden group-focus-within:block z-10">
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${selected.name}"?`)) {
                          deleteMutation.mutate(selected.id, {
                            onSuccess: () => setSelectedId(null),
                          })
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      Delete source
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            <SourceDataView source={selected} />
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-l-3xl flex items-center justify-center text-sm text-gray-400">
          Select a source
        </div>
      )}
    </div>
  )
}
