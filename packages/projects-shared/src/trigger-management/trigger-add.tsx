import * as React from 'react'
import { Button } from '@rs/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@rs/ui/card'
import { cn } from '@rs/ui'
import type { TriggerStatement } from '@rahataid/sdk'
import type { TriggerSource, TriggerManagementConfig } from './types.js'
import { TRIGGER_OPERATORS } from './types.js'
import { useCreateTrigger } from './queries.js'

type TriggerItemType = 'automated' | 'manual'

interface TriggerAddProps {
  statement: TriggerStatement
  config: TriggerManagementConfig
  onSuccess?: () => void
  onCancel?: () => void
}

interface AutomatedFormState {
  sourceId: string
  station: string
  operator: string
  value: string
  config: Record<string, string>
}

function AutomatedFields({
  sources,
  form,
  onChange,
}: {
  sources: TriggerSource[]
  form: AutomatedFormState
  onChange: (update: Partial<AutomatedFormState>) => void
}) {
  const selectedSource = sources.find((s) => s.id === form.sourceId)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Source</label>
          <select
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
            value={form.sourceId}
            onChange={(e) => onChange({ sourceId: e.target.value, config: {}, station: '', operator: '>', value: '' })}
          >
            <option value="">Select Source</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSource && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {selectedSource.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={form.config[field.key] ?? ''}
                    onChange={(e) =>
                      onChange({ config: { ...form.config, [field.key]: e.target.value } })
                    }
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.key === 'station' ? (
                  <input
                    type="text"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder={field.placeholder ?? `Enter ${field.label}`}
                    value={form.station}
                    onChange={(e) => onChange({ station: e.target.value })}
                  />
                ) : (
                  <input
                    type="text"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder={field.placeholder ?? `Enter ${field.label}`}
                    value={form.config[field.key] ?? ''}
                    onChange={(e) =>
                      onChange({ config: { ...form.config, [field.key]: e.target.value } })
                    }
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Operator</label>
              <select
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                value={form.operator}
                onChange={(e) => onChange({ operator: e.target.value })}
              >
                {TRIGGER_OPERATORS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Value {selectedSource.unit ? `(${selectedSource.unit})` : ''}
              </label>
              <input
                type="number"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder={`Enter value${selectedSource.unit ? ` in (${selectedSource.unit})` : ''}`}
                value={form.value}
                onChange={(e) => onChange({ value: e.target.value })}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}

export function TriggerAdd({ statement, config, onSuccess, onCancel }: TriggerAddProps) {
  const [triggerItemType, setTriggerItemType] = React.useState<TriggerItemType>('automated')
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [isOptional, setIsOptional] = React.useState(false)
  const [autoForm, setAutoForm] = React.useState<AutomatedFormState>({
    sourceId: '',
    station: '',
    operator: '>',
    value: '',
    config: {},
  })

  const sources = config.sources ?? []
  const createTrigger = useCreateTrigger(statement.id)

  function handleClear() {
    setTitle('')
    setDescription('')
    setIsOptional(false)
    setAutoForm({ sourceId: '', station: '', operator: '>', value: '', config: {} })
  }

  function handleConfirm() {
    if (!title.trim()) return

    const baseData = {
      statementId: statement.id,
      projectId: statement.projectId,
      title: title.trim(),
      description: description.trim() || undefined,
      isOptional,
      triggerType: triggerItemType as 'automated' | 'manual',
    }

    const automatedData =
      triggerItemType === 'automated' && autoForm.sourceId
        ? {
            sourceId: autoForm.sourceId,
            station: autoForm.station || undefined,
            operator: autoForm.operator as '>' | '>=' | '<' | '<=' | '=',
            value: autoForm.value ? parseFloat(autoForm.value) : undefined,
            config: Object.keys(autoForm.config).length > 0 ? autoForm.config : undefined,
          }
        : {}

    createTrigger.mutate({ ...baseData, ...automatedData } as Parameters<typeof createTrigger.mutate>[0], {
      onSuccess: () => {
        handleClear()
        onSuccess?.()
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Trigger</h1>
        <p className="text-sm text-slate-500">Fill the form below to create new trigger statement</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Trigger Type</CardTitle>
          <p className="text-xs text-slate-500">Select trigger type and fill the details below</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Type toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1">
            {(['automated', 'manual'] as TriggerItemType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTriggerItemType(type)}
                className={cn(
                  'rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors',
                  triggerItemType === type
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800',
                )}
              >
                {type} trigger
              </button>
            ))}
          </div>

          {/* Read-only context */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Phase</label>
              <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                {statement.phase}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">River Basin</label>
              <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                {statement.riverBasin ?? config.riverBasin ?? '—'}
              </div>
            </div>
          </div>

          {/* Common fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Trigger Title</label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Enter Trigger Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            {triggerItemType === 'automated' && sources.length > 0 && (
              <div className="invisible" />
            )}
          </div>

          {/* Automated trigger source fields */}
          {triggerItemType === 'automated' && sources.length > 0 && (
            <AutomatedFields
              sources={sources}
              form={autoForm}
              onChange={(update) => setAutoForm((prev) => ({ ...prev, ...update }))}
            />
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Trigger description</label>
            <textarea
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[80px] resize-y"
              placeholder="Write trigger description here"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Optional toggle */}
          <label className="flex cursor-pointer items-center gap-2.5">
            <button
              type="button"
              role="switch"
              aria-checked={isOptional}
              onClick={() => setIsOptional((v) => !v)}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                isOptional ? 'bg-blue-600' : 'bg-slate-200',
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
                  isOptional ? 'translate-x-4' : 'translate-x-0.5',
                )}
              />
            </button>
            <span className="text-sm text-slate-700">Optional</span>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={() => { handleClear(); onCancel?.() }}>
              Clear
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!title.trim() || createTrigger.isPending}
            >
              {createTrigger.isPending ? 'Saving…' : 'Confirm'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
