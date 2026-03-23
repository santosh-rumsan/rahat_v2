import { createFileRoute, useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  FileJson,
  Link,
  X,
  MessageSquare,
  MessageCircle,
  Slack,
  Phone,
  Coins,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createServiceService,
  getSDKApiUrl,
  SERVICE_TYPE_LABELS,
  SERVICE_TYPES,
} from '@rahataid/sdk'
import type { Service, ServiceType, CreateServiceInput } from '@rahataid/sdk'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@rs/ui/dialog'
import { toast } from '@rs/ui/toast'

export const Route = createFileRoute('/_app/services/')({ component: ServicesPage })

// ─── service helpers ──────────────────────────────────────────────────────────

function svc() {
  return createServiceService(getSDKApiUrl())
}

const serviceKeys = {
  all: ['services'] as const,
  detail: (id: string) => ['services', id] as const,
}

function useServices() {
  return useQuery({ queryKey: serviceKeys.all, queryFn: () => svc().list() })
}

function useDeleteService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => svc().delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceKeys.all }),
  })
}

function useToggleService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isEnabled }: { id: string; isEnabled: boolean }) =>
      svc().update(id, { isEnabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceKeys.all }),
  })
}

function useImportServices() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (records: CreateServiceInput[]) => {
      const s = svc()
      const existing = await s.list()
      const existingIds = new Set(existing.map((x) => x.id))
      const results: Service[] = []
      for (const r of records) {
        if (r.id && existingIds.has(r.id)) continue
        results.push(await s.create(r))
      }
      return results
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceKeys.all }),
  })
}

// ─── type icons / colors ──────────────────────────────────────────────────────

const TYPE_ICONS: Record<ServiceType, React.ReactNode> = {
  SMS: <MessageSquare size={15} />,
  WHATSAPP: <MessageCircle size={15} />,
  SLACK: <Slack size={15} />,
  SIP: <Phone size={15} />,
  TOKEN: <Coins size={15} />,
}

const TYPE_COLORS: Record<ServiceType, string> = {
  SMS: 'bg-blue-100 text-blue-700',
  WHATSAPP: 'bg-green-100 text-green-700',
  SLACK: 'bg-purple-100 text-purple-700',
  SIP: 'bg-orange-100 text-orange-700',
  TOKEN: 'bg-yellow-100 text-yellow-700',
}

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
  onImport: (records: CreateServiceInput[]) => void
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
      if (json.type !== 'services') {
        setError(`Type mismatch: expected "services", got "${json.type ?? 'unknown'}"`)
        return
      }
      if (!Array.isArray(json.data)) {
        setError('Invalid format: "data" must be an array')
        return
      }
      setError(null)
      onImport(json.data as CreateServiceInput[])
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
          <DialogTitle>Import Services</DialogTitle>
          <DialogDescription>
            Import services from a JSON file or URL. File must have{' '}
            <code>type: "services"</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mt-1">
          {(['file', 'url'] as ImportTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
                placeholder="https://example.com/services.json"
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

// ─── toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
        checked ? 'bg-brand-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

// ─── service row ──────────────────────────────────────────────────────────────

function ServiceRow({ service }: { service: Service }) {
  const navigate = useNavigate()
  const deleteMutation = useDeleteService()
  const toggleMutation = useToggleService()

  function handleToggle(isEnabled: boolean) {
    toggleMutation.mutate(
      { id: service.id, isEnabled },
      {
        onSuccess: () =>
          toast.success(isEnabled ? `${service.name} enabled` : `${service.name} disabled`),
      },
    )
  }

  function handleDelete() {
    if (!confirm(`Delete "${service.name}"?`)) return
    deleteMutation.mutate(service.id, {
      onSuccess: () => toast.success(`${service.name} deleted`),
    })
  }

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[service.serviceType]}`}
      >
        {TYPE_ICONS[service.serviceType]}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{service.name}</p>
          <span
            className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
              service.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {service.isEnabled ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
            {service.isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <p className="text-xs text-gray-400 truncate font-mono mt-0.5">{service.url}</p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <Toggle checked={service.isEnabled} onChange={handleToggle} />
        <button
          onClick={() =>
            navigate({ to: '/services/$serviceId/edit', params: { serviceId: service.id } })
          }
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Edit"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <MessageSquare size={24} className="text-blue-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">No services configured</h3>
      <p className="text-sm text-gray-400 mb-5 max-w-xs">
        Add your first service to integrate SMS, WhatsApp, Slack, SIP, or Token endpoints.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#333] transition-colors"
      >
        <Plus size={15} />
        Add service
      </button>
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

function ServicesPage() {
  const navigate = useNavigate()
  const { data: services = [], isLoading } = useServices()
  const importMutation = useImportServices()
  const [importOpen, setImportOpen] = React.useState(false)

  function handleImport(records: CreateServiceInput[]) {
    importMutation.mutate(records, {
      onSuccess: (imported) => {
        toast.success(`Imported ${imported.length} service${imported.length !== 1 ? 's' : ''}`)
        setImportOpen(false)
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Import failed')
      },
    })
  }

  const grouped = SERVICE_TYPES.reduce<Record<ServiceType, Service[]>>(
    (acc, type) => {
      acc[type] = services.filter((s) => s.serviceType === type)
      return acc
    },
    {} as Record<ServiceType, Service[]>,
  )

  const presentTypes = SERVICE_TYPES.filter((t) => grouped[t].length > 0)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Loading…
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImport}
        isImporting={importMutation.isPending}
      />

      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure external service integrations. Only one service per type can be enabled at a
            time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportOpen(true)}
            disabled={importMutation.isPending}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors disabled:opacity-40"
          >
            <Upload size={15} />
            {importMutation.isPending ? 'Importing…' : 'Import JSON'}
          </button>
          <button
            onClick={() => navigate({ to: '/services/add' })}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1a1a1a] hover:bg-[#333] px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={15} />
            Add service
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-6">
        {services.length === 0 ? (
          <EmptyState onAdd={() => navigate({ to: '/services/add' })} />
        ) : (
          <div className="max-w-3xl space-y-8">
            {presentTypes.map((type) => (
              <section key={type}>
                <div
                  className={`flex items-center gap-2 mb-3 text-sm font-semibold uppercase tracking-wide ${TYPE_COLORS[type].split(' ')[1]}`}
                >
                  {TYPE_ICONS[type]}
                  {SERVICE_TYPE_LABELS[type]}
                  <span className="ml-1 text-xs font-normal text-gray-400 normal-case tracking-normal">
                    ({grouped[type].filter((s) => s.isEnabled).length} of {grouped[type].length}{' '}
                    enabled)
                  </span>
                </div>
                <div className="space-y-2">
                  {grouped[type].map((s) => (
                    <ServiceRow key={s.id} service={s} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
