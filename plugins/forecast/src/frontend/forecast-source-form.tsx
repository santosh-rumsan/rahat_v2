import * as React from 'react'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { cn } from '@rs/ui'
import { FORECAST_SOURCE_TYPES, FORECAST_SOURCE_TYPE_LABELS } from '@rahataid/sdk'
import type { ForecastSource, ForecastSourceType } from '@rahataid/sdk'
import { useCreateForecastSource, useUpdateForecastSource } from './queries.js'

export interface ForecastSourceFormProps {
  source?: ForecastSource
  onSave: (source: ForecastSource) => void
  onCancel: () => void
}

interface HeaderRow {
  key: string
  value: string
}

interface FormState {
  name: string
  sourceType: ForecastSourceType
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH'
  headers: HeaderRow[]
  bodyText: string
  isActive: boolean
}

function headersToRows(obj: Record<string, string>): HeaderRow[] {
  const entries = Object.entries(obj)
  return entries.length > 0 ? entries.map(([key, value]) => ({ key, value })) : [{ key: '', value: '' }]
}

function rowsToHeaders(rows: HeaderRow[]): Record<string, string> {
  return Object.fromEntries(rows.filter((r) => r.key.trim()).map((r) => [r.key.trim(), r.value]))
}

function toForm(s: ForecastSource): FormState {
  return {
    name: s.name,
    sourceType: s.sourceType,
    url: s.url,
    method: s.method as FormState['method'],
    headers: headersToRows(s.headers),
    bodyText: Object.keys(s.body).length > 0 ? JSON.stringify(s.body, null, 2) : '',
    isActive: s.isActive,
  }
}

const emptyForm: FormState = {
  name: '',
  sourceType: 'RIVER_WATCH',
  url: '',
  method: 'POST',
  headers: [{ key: '', value: '' }],
  bodyText: '',
  isActive: true,
}

const METHODS = ['GET', 'POST', 'PUT', 'PATCH'] as const

const inputClass =
  'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent'

export function ForecastSourceForm({ source, onSave, onCancel }: ForecastSourceFormProps) {
  const [form, setForm] = React.useState<FormState>(() => (source ? toForm(source) : emptyForm))
  const [bodyError, setBodyError] = React.useState<string | null>(null)
  const isEditing = !!source

  const createMutation = useCreateForecastSource()
  const updateMutation = useUpdateForecastSource()
  const isPending = createMutation.isPending || updateMutation.isPending

  const isValid = form.name.trim() && form.url.trim() && !bodyError

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handleBodyChange(text: string) {
    setField('bodyText', text)
    if (!text.trim()) {
      setBodyError(null)
      return
    }
    try {
      JSON.parse(text)
      setBodyError(null)
    } catch {
      setBodyError('Invalid JSON')
    }
  }

  function addHeader() {
    setField('headers', [...form.headers, { key: '', value: '' }])
  }

  function removeHeader(idx: number) {
    setField('headers', form.headers.filter((_, i) => i !== idx))
  }

  function updateHeader(idx: number, field: 'key' | 'value', val: string) {
    const updated = form.headers.map((row, i) => (i === idx ? { ...row, [field]: val } : row))
    setField('headers', updated)
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!isValid) return

    let body: Record<string, unknown> = {}
    if (form.bodyText.trim()) {
      try {
        body = JSON.parse(form.bodyText)
      } catch {
        setBodyError('Invalid JSON')
        return
      }
    }

    const data = {
      name: form.name.trim(),
      sourceType: form.sourceType,
      url: form.url.trim(),
      method: form.method,
      headers: rowsToHeaders(form.headers),
      body,
      isActive: form.isActive,
    }

    if (isEditing && source) {
      updateMutation.mutate(
        { id: source.id, data },
        { onSuccess: (saved) => onSave(saved) },
      )
    } else {
      createMutation.mutate(data, { onSuccess: (saved) => onSave(saved) })
    }
  }

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="px-8 pt-7 pb-5 border-b border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Forecast Data
        </button>
        <h1 className="text-2xl font-black text-[#1a1a1a]">
          {isEditing ? 'Edit Data Source' : 'Add Data Source'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Configure an external API endpoint to pull forecast data from
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-8 max-w-2xl space-y-7">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Source name *</label>
          <input
            type="text"
            placeholder="e.g. Doda River – East West Highway"
            value={form.name}
            onChange={(e) => setField('name', e.currentTarget.value)}
            autoFocus
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Data type *</label>
          <div className="flex flex-wrap gap-2">
            {FORECAST_SOURCE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => !isEditing && setField('sourceType', t)}
                disabled={isEditing}
                className={cn(
                  'px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                  form.sourceType === t
                    ? 'border-orange-400 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300',
                  isEditing && 'opacity-60 cursor-not-allowed',
                )}
              >
                {FORECAST_SOURCE_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          {isEditing && (
            <p className="text-xs text-gray-400 mt-1.5">Data type cannot be changed after creation</p>
          )}
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
                      ? 'border-orange-400 bg-orange-50 text-orange-600'
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
              className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
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
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent font-mono"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Bearer token…)"
                  value={row.value}
                  onChange={(e) => updateHeader(idx, 'value', e.currentTarget.value)}
                  className="flex-[2] px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent font-mono"
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
          <p className="text-xs text-gray-400 mt-1.5">
            Common: <code className="bg-gray-100 px-1 rounded">Authorization</code> · <code className="bg-gray-100 px-1 rounded">Content-Type</code>
          </p>
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
              placeholder={'{\n  "action": "ms.waterLevels.getDhm",\n  "payload": {\n    "riverBasin": "...",\n    "from": "2026/03/20",\n    "to": "2026/03/20"\n  }\n}'}
              value={form.bodyText}
              onChange={(e) => handleBodyChange(e.currentTarget.value)}
              rows={8}
              disabled={form.method === 'GET'}
              className={cn(
                'w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-y font-mono leading-relaxed',
                bodyError ? 'border-red-300 focus:ring-red-400' : 'border-gray-200',
                form.method === 'GET' && 'bg-gray-50 text-gray-400 cursor-not-allowed',
              )}
            />
            {bodyError && (
              <p className="absolute bottom-2 right-3 text-xs text-red-500">{bodyError}</p>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Must be valid JSON if provided</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setField('isActive', !form.isActive)}
            className={cn(
              'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
              form.isActive ? 'bg-orange-400' : 'bg-gray-200',
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200',
                form.isActive ? 'translate-x-4' : 'translate-x-0',
              )}
            />
          </button>
          <span className="text-sm text-gray-700">
            {form.isActive ? 'Active – data will be fetched' : 'Inactive – source is paused'}
          </span>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!isValid || isPending}
            className="px-6 py-2.5 text-sm font-semibold bg-[#1a1a1a] text-white rounded-xl hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Add source'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
