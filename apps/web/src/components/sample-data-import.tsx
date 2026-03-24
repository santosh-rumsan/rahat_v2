import * as React from 'react'
import { Loader2, CircleCheck, CircleX } from 'lucide-react'
import {
  importProjectDump,
  createIndexedDbProjectImportAdapter,
  createServiceService,
  getSDKApiUrl,
} from '@rahataid/sdk'
import type { CreateServiceInput } from '@rahataid/sdk'
import { useImportVendors } from '@rahataid/projects-shared'
import { useImportUsers } from '../lib/user/queries.js'
import { useImportForecastSources } from '@rahataid/plugin-core-forecast/frontend'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@rs/ui/dialog'
import { toast } from '@rs/ui/toast'

export const SAMPLE_ITEMS = [
  {
    id: 'vendor' as const,
    label: 'Vendors',
    description: 'Sample vendors with contacts and status',
    url: 'https://pub-238a24405f664ef98793dd22f50d8160.r2.dev/v2-import-samples/vendors_import.json',
    defaultSelected: true,
  },
  {
    id: 'user' as const,
    label: 'Users',
    description: 'Sample users with roles and profiles',
    url: 'https://pub-238a24405f664ef98793dd22f50d8160.r2.dev/v2-import-samples/users_import.json',
    defaultSelected: true,
  },
  {
    id: 'service' as const,
    label: 'Services',
    description: 'Sample service integrations (SMS, WhatsApp, etc.)',
    url: 'https://pub-238a24405f664ef98793dd22f50d8160.r2.dev/v2-import-samples/services_import.json',
    defaultSelected: true,
  },
  {
    id: 'forecast' as const,
    label: 'Forecast Sources',
    description: 'Sample forecast data sources for AA projects',
    url: 'https://pub-238a24405f664ef98793dd22f50d8160.r2.dev/v2-import-samples/forecast_import.json',
    defaultSelected: true,
  },
  {
    id: 'cva' as const,
    label: 'CVA Project',
    description: 'Sample CVA project with beneficiaries and benefits',
    url: 'https://pub-238a24405f664ef98793dd22f50d8160.r2.dev/v2-import-samples/cva-sample-1.json',
    defaultSelected: true,
  },
  {
    id: 'aa' as const,
    label: 'AA Project — Botswana',
    description: 'Okavango flood anticipatory action in Maun (3 task groups × 15 tasks)',
    url: 'https://pub-238a24405f664ef98793dd22f50d8160.r2.dev/v2-import-samples/aa-sample-1.json',
    defaultSelected: true,
  },
  {
    id: 'microlearning' as const,
    label: 'Microlearning Project — Norway',
    description: 'Newcomer digital inclusion programme in Steinkjer, Trøndelag',
    url: 'https://pub-238a24405f664ef98793dd22f50d8160.r2.dev/v2-import-samples/microlearning-sample-1.json',
    defaultSelected: true,
  },
  {
    id: 'beneficiary-mgmt' as const,
    label: 'Beneficiary Management — Peru',
    description: 'Glacial flood registration project in Huaraz, Ancash',
    url: 'https://pub-238a24405f664ef98793dd22f50d8160.r2.dev/v2-import-samples/beneficiary-mgmt-sample-1.json',
    defaultSelected: true,
  },
  {
    id: 'microloan' as const,
    label: 'Microloan Project — New Zealand',
    description: 'Māori business microloan fund in Kaikohe, Northland',
    url: 'https://pub-238a24405f664ef98793dd22f50d8160.r2.dev/v2-import-samples/microloan-sample-1.json',
    defaultSelected: true,
  },
  {
    id: 'cva-logs' as const,
    label: 'CVA Project with Logs',
    description: 'CVA project including activity and module logs',
    url: 'https://pub-238a24405f664ef98793dd22f50d8160.r2.dev/v2-import-samples/cva-project-with-logs-1.json',
    defaultSelected: false,
  },

  {
    id: 'aa-2' as const,
    label: 'AA Project - Bangladesh',
    description: 'Anticipatory Action project with multi-phase task groups and forecast triggers',
    url: 'https://pub-238a24405f664ef98793dd22f50d8160.r2.dev/v2-import-samples/aa-sample-2.json',
    defaultSelected: false,
  },
  {
    id: 'microlearning-2' as const,
    label: 'Microlearning Project - Surkhet',
    description: 'Digital literacy microlearning programme with module delivery and assessments',
    url: 'https://pub-238a24405f664ef98793dd22f50d8160.r2.dev/v2-import-samples/microlearning-sample-2.json',
    defaultSelected: false,
  },
  {
    id: 'beneficiary-mgmt-2' as const,
    label: 'Beneficiary Management Project - Bangladesh',
    description: 'Refugee registration and beneficiary management across multiple camps',
    url: 'https://pub-238a24405f664ef98793dd22f50d8160.r2.dev/v2-import-samples/beneficiary-mgmt-sample-2.json',
    defaultSelected: false,
  },
  {
    id: 'microloan-2' as const,
    label: 'Microloan Project - Kenya',
    description: 'Small business microloan programme with repayment tracking and business coaching',
    url: 'https://pub-238a24405f664ef98793dd22f50d8160.r2.dev/v2-import-samples/microloan-sample-2.json',
    defaultSelected: false,
  },
]

type SampleItemId = (typeof SAMPLE_ITEMS)[number]['id']
type ItemStatus = 'idle' | 'loading' | 'done' | 'error'

export function SampleDataDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onImported?: () => void
}) {
  const qc = useQueryClient()
  const importVendors = useImportVendors()
  const importUsers = useImportUsers()
  const importForecast = useImportForecastSources()

  const defaultSelected = new Set(
    SAMPLE_ITEMS.filter((i) => i.defaultSelected).map((i) => i.id),
  )
  const [selected, setSelected] = React.useState<Set<SampleItemId>>(defaultSelected)
  const [statuses, setStatuses] = React.useState<Partial<Record<SampleItemId, ItemStatus>>>({})
  const [running, setRunning] = React.useState(false)
  const [done, setDone] = React.useState(false)

  function toggle(id: SampleItemId) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function setStatus(id: SampleItemId, status: ItemStatus) {
    setStatuses((prev) => ({ ...prev, [id]: status }))
  }

  async function runImport() {
    setRunning(true)
    setDone(false)
    const errors: string[] = []

    for (const item of SAMPLE_ITEMS) {
      if (!selected.has(item.id)) continue
      setStatus(item.id, 'loading')
      try {
        const res = await fetch(item.url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()
        const json = JSON.parse(text)

        if (item.id === 'vendor') {
          await importVendors.mutateAsync(json.data)
        } else if (item.id === 'user') {
          await importUsers.mutateAsync(json.data)
        } else if (item.id === 'service') {
          const svc = createServiceService(getSDKApiUrl())
          const existing = await svc.list()
          const existingIds = new Set(existing.map((x) => x.id))
          for (const r of json.data as CreateServiceInput[]) {
            if (r.id && existingIds.has(r.id)) continue
            await svc.create(r)
          }
          await qc.invalidateQueries({ queryKey: ['services'] })
        } else if (item.id === 'forecast') {
          await importForecast.mutateAsync(json.data)
        } else if (item.id === 'cva' || item.id === 'cva-logs' || item.id === 'aa' || item.id === 'microlearning' || item.id === 'beneficiary-mgmt' || item.id === 'microloan') {
          await importProjectDump(text, createIndexedDbProjectImportAdapter(), {
            includeActivities: item.id === 'cva-logs',
          })
          await qc.invalidateQueries({ queryKey: ['projects'] })
        }

        setStatus(item.id, 'done')
      } catch (err) {
        setStatus(item.id, 'error')
        errors.push(`${item.label}: ${err instanceof Error ? err.message : 'failed'}`)
      }
    }

    setRunning(false)
    setDone(true)
    if (errors.length === 0) {
      toast.success('Sample data imported successfully')
      onImported?.()
      onOpenChange(false)
    } else {
      toast.error(`${errors.length} item(s) failed to import`)
    }
  }

  function handleClose() {
    if (running) return
    setSelected(defaultSelected)
    setStatuses({})
    setDone(false)
    onOpenChange(false)
  }

  const selectedCount = SAMPLE_ITEMS.filter((i) => selected.has(i.id)).length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Sample Data</DialogTitle>
          <DialogDescription>
            Select the data sets you want to import. Existing records with matching IDs will be
            skipped.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid grid-cols-2 gap-2">
          {SAMPLE_ITEMS.map((item) => {
            const status = statuses[item.id] ?? 'idle'
            const isChecked = selected.has(item.id)
            return (
              <label
                key={item.id}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-colors cursor-pointer ${
                  isChecked && !running
                    ? 'border-brand-300 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${running ? 'cursor-default' : ''}`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 accent-brand-500"
                  checked={isChecked}
                  disabled={running}
                  onChange={() => toggle(item.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                </div>
                {status === 'loading' && (
                  <Loader2 size={16} className="text-brand-500 animate-spin flex-shrink-0 mt-0.5" />
                )}
                {status === 'done' && (
                  <CircleCheck size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                )}
                {status === 'error' && (
                  <CircleX size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                )}
              </label>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            disabled={running}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {done ? 'Close' : 'Cancel'}
          </button>
          <button
            onClick={runImport}
            disabled={running || selectedCount === 0 || done}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running && <Loader2 size={14} className="animate-spin" />}
            {running
              ? 'Importing…'
              : `Import ${selectedCount > 0 ? `${selectedCount} item${selectedCount !== 1 ? 's' : ''}` : ''}`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
