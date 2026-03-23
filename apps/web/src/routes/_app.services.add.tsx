import { createFileRoute, useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createServiceService,
  getSDKApiUrl,
  SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
} from '@rahataid/sdk'
import type { ServiceType } from '@rahataid/sdk'
import { cn } from '@rs/ui'
import { toast } from '@rs/ui/toast'

export const Route = createFileRoute('/_app/services/add')({ component: ServiceAddPage })

const METHODS = ['GET', 'POST', 'PUT', 'PATCH'] as const

interface HeaderRow {
  key: string
  value: string
}

interface FormState {
  name: string
  serviceType: ServiceType
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH'
  headers: HeaderRow[]
  bodyText: string
  isEnabled: boolean
}

const emptyForm: FormState = {
  name: '',
  serviceType: 'SMS',
  url: '',
  method: 'POST',
  headers: [{ key: '', value: '' }],
  bodyText: '',
  isEnabled: true,
}

const inputClass =
  'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent'

function ServiceAddPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [bodyError, setBodyError] = React.useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: (data: Parameters<ReturnType<typeof createServiceService>['create']>[0]) =>
      createServiceService(getSDKApiUrl()).create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] })
      toast.success('Service added')
      navigate({ to: '/services' })
    },
  })

  const isValid = form.name.trim() && form.url.trim() && !bodyError

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handleBodyChange(text: string) {
    setField('bodyText', text)
    if (!text.trim()) { setBodyError(null); return }
    try { JSON.parse(text); setBodyError(null) } catch { setBodyError('Invalid JSON') }
  }

  function addHeader() {
    setField('headers', [...form.headers, { key: '', value: '' }])
  }

  function removeHeader(idx: number) {
    setField('headers', form.headers.filter((_, i) => i !== idx))
  }

  function updateHeader(idx: number, field: 'key' | 'value', val: string) {
    setField('headers', form.headers.map((row, i) => (i === idx ? { ...row, [field]: val } : row)))
  }

  function rowsToHeaders(rows: HeaderRow[]) {
    return Object.fromEntries(rows.filter((r) => r.key.trim()).map((r) => [r.key.trim(), r.value]))
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!isValid) return
    let body: Record<string, unknown> = {}
    if (form.bodyText.trim()) {
      try { body = JSON.parse(form.bodyText) } catch { setBodyError('Invalid JSON'); return }
    }
    createMutation.mutate({
      name: form.name.trim(),
      serviceType: form.serviceType,
      url: form.url.trim(),
      method: form.method,
      headers: rowsToHeaders(form.headers),
      body,
      isEnabled: form.isEnabled,
    })
  }

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="px-8 pt-7 pb-5 border-b border-gray-100">
        <button
          type="button"
          onClick={() => navigate({ to: '/services' })}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Services
        </button>
        <h1 className="text-2xl font-black text-[#1a1a1a]">Add Service</h1>
        <p className="text-sm text-gray-400 mt-1">Configure an external HTTP service endpoint</p>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-8 max-w-2xl space-y-7">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Service name *</label>
          <input
            type="text"
            placeholder="e.g. Sparrow SMS Production"
            value={form.name}
            onChange={(e) => setField('name', e.currentTarget.value)}
            autoFocus
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Service type *</label>
          <div className="flex flex-wrap gap-2">
            {SERVICE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setField('serviceType', t)}
                className={cn(
                  'px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                  form.serviceType === t
                    ? 'border-brand-400 bg-brand-50 text-brand-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300',
                )}
              >
                {SERVICE_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">API URL *</label>
            <input
              type="url"
              placeholder="https://api.example.com/v1/..."
              value={form.url}
              onChange={(e) => setField('url', e.currentTarget.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Method</label>
            <div className="flex gap-1">
              {METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setField('method', m)}
                  className={cn(
                    'px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
                    form.method === m
                      ? 'border-brand-400 bg-brand-50 text-brand-600'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300',
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Headers</label>
            <button
              type="button"
              onClick={addHeader}
              className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              <Plus size={12} />
              Add header
            </button>
          </div>
          <div className="space-y-2">
            {form.headers.map((row, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Key (e.g. Authorization)"
                  value={row.key}
                  onChange={(e) => updateHeader(idx, 'key', e.currentTarget.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent font-mono"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) => updateHeader(idx, 'value', e.currentTarget.value)}
                  className="flex-[2] px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent font-mono"
                />
                <button
                  type="button"
                  onClick={() => removeHeader(idx)}
                  disabled={form.headers.length === 1}
                  className="p-2 text-gray-300 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">
            Request body
            {form.method === 'GET' && (
              <span className="ml-2 text-xs text-gray-400 font-normal">(ignored for GET)</span>
            )}
          </label>
          <div className="relative">
            <textarea
              placeholder={'{\n  "key": "value"\n}'}
              value={form.bodyText}
              onChange={(e) => handleBodyChange(e.currentTarget.value)}
              rows={6}
              disabled={form.method === 'GET'}
              className={cn(
                'w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-y font-mono leading-relaxed',
                bodyError ? 'border-red-300 focus:ring-red-400' : 'border-gray-200',
                form.method === 'GET' && 'bg-gray-50 text-gray-400 cursor-not-allowed',
              )}
            />
            {bodyError && (
              <p className="absolute bottom-2 right-3 text-xs text-red-500">{bodyError}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setField('isEnabled', !form.isEnabled)}
            className={cn(
              'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
              form.isEnabled ? 'bg-brand-500' : 'bg-gray-200',
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200',
                form.isEnabled ? 'translate-x-4' : 'translate-x-0',
              )}
            />
          </button>
          <span className="text-sm text-gray-700">
            {form.isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!isValid || createMutation.isPending}
            className="px-6 py-2.5 text-sm font-semibold bg-[#1a1a1a] text-white rounded-xl hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {createMutation.isPending ? 'Saving…' : 'Add service'}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: '/services' })}
            className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
