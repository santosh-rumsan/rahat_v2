import * as React from 'react'
import { Button } from '@rs/ui/button'
import { Badge } from '@rs/ui/badge'
import {
  AlertTriangle,
  Plus,
  RotateCcw,
  Settings2,
  Zap,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react'
import type { Trigger, TriggerStatement } from '@rahataid/sdk'
import { computeStats } from './hooks.js'
import { TriggerCard } from './components/trigger-card.js'
import type { TriggerSource } from './types.js'
import {
  useTriggerStatement,
  useTriggers,
  useTriggerExecutions,
  useUpdateTrigger,
  useUpdateTriggerStatement,
  useDeleteTrigger,
} from './queries.js'

type TriggerFilter = 'all' | 'not_triggered' | 'triggered' | 'history'

interface TriggerStatementDetailProps {
  statementId: string
  projectId: string
  sources?: TriggerSource[]
  onAddTrigger?: () => void
  onManageThreshold?: () => void
  onBack?: () => void
}

function StatChip({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent: string
}) {
  return (
    <div className={`flex-1 rounded-lg p-3 ${accent}`}>
      <p className="text-xl font-bold leading-none text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  )
}

export function TriggerStatementDetail({
  statementId,
  projectId,
  sources,
  onAddTrigger,
  onManageThreshold,
  onBack,
}: TriggerStatementDetailProps) {
  const [filter, setFilter] = React.useState<TriggerFilter>('all')

  const { data: statement } = useTriggerStatement(statementId)
  const { data: triggers = [] } = useTriggers(statementId)
  const { data: executions = [] } = useTriggerExecutions(statementId)
  const updateTrigger = useUpdateTrigger(statementId)
  const updateStatement = useUpdateTriggerStatement(projectId)
  const deleteTrigger = useDeleteTrigger(statementId)

  if (!statement) {
    return (
      <div className="flex h-40 items-center justify-center text-slate-400 text-sm">
        Loading...
      </div>
    )
  }

  const stats = computeStats(statement, triggers)
  const isTriggered = statement.status === 'triggered'

  const filteredTriggers: Trigger[] = (() => {
    if (filter === 'triggered') return triggers.filter((t) => t.status === 'triggered')
    if (filter === 'not_triggered') return triggers.filter((t) => t.status === 'not_triggered')
    return triggers
  })()

  function handleFire(triggerId: string) {
    updateTrigger.mutate({
      id: triggerId,
      data: { status: 'triggered', triggeredAt: new Date().toISOString() },
    })
  }

  function handleRevertTrigger(triggerId: string) {
    updateTrigger.mutate({ id: triggerId, data: { status: 'not_triggered', triggeredAt: undefined } })
  }

  function handleRevertStatement() {
    updateStatement.mutate({
      id: statementId,
      data: { status: 'not_triggered', triggeredAt: undefined },
    })
  }

  function handleDeleteTrigger(triggerId: string) {
    deleteTrigger.mutate(triggerId)
  }

  const FILTERS: { key: TriggerFilter; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: triggers.length },
    {
      key: 'not_triggered',
      label: 'Pending',
      count: triggers.filter((t) => t.status === 'not_triggered').length,
    },
    {
      key: 'triggered',
      label: 'Triggered',
      count: triggers.filter((t) => t.status === 'triggered').length,
    },
    { key: 'history', label: 'History', count: executions.length },
  ]

  const mandatoryMet = stats.mandatoryTriggered >= statement.mandatoryThreshold

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Back to overview
            </button>
          )}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">
              {statement.phase}
            </h1>
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${
                isTriggered
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {isTriggered ? 'Triggered' : 'Active'}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            {statement.phase.charAt(0).toUpperCase() + statement.phase.slice(1).toLowerCase()} phase trigger management
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={onManageThreshold}>
            <Settings2 className="h-3.5 w-3.5" />
            Threshold
          </Button>
          <Button size="sm" className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={onAddTrigger}>
            <Plus className="h-3.5 w-3.5" />
            Add Trigger
          </Button>
          {isTriggered && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-slate-600"
              onClick={handleRevertStatement}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Revert Phase
            </Button>
          )}
        </div>
      </div>

      {/* Triggered banner */}
      {isTriggered && statement.triggeredAt && (
        <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-700">This phase has been triggered</p>
            <p className="text-xs text-rose-500">{new Date(statement.triggeredAt).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="flex gap-3">
        <StatChip label="Total" value={stats.total} accent="bg-slate-50" />
        <StatChip label="Triggered" value={stats.triggered} accent="bg-rose-50" />
        <StatChip label="Mandatory" value={`${stats.mandatoryTriggered}/${statement.mandatoryThreshold}`} accent="bg-blue-50" />
        {statement.optionalThreshold > 0 && (
          <StatChip label="Optional" value={`${stats.optionalTriggered}/${statement.optionalThreshold}`} accent="bg-amber-50" />
        )}
      </div>

      {/* Threshold status */}
      <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          {mandatoryMet ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <Circle className="h-4 w-4 text-slate-300" />
          )}
          <span className={mandatoryMet ? 'text-emerald-700 font-medium' : 'text-slate-600'}>
            Mandatory threshold {mandatoryMet ? 'met' : 'not met'}
          </span>
          <span className="text-xs text-slate-400">
            ({stats.mandatoryTriggered} of {statement.mandatoryThreshold} required)
          </span>
        </div>
        {statement.optionalThreshold > 0 && (
          <>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-sm">
              {stats.optionalTriggered >= statement.optionalThreshold ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4 text-slate-300" />
              )}
              <span className={stats.optionalTriggered >= statement.optionalThreshold ? 'text-emerald-700 font-medium' : 'text-slate-600'}>
                Optional threshold {stats.optionalTriggered >= statement.optionalThreshold ? 'met' : 'not met'}
              </span>
              <span className="text-xs text-slate-400">
                ({stats.optionalTriggered} of {statement.optionalThreshold} required)
              </span>
            </div>
          </>
        )}
      </div>

      {/* Triggers section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Triggers</h2>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 border-b border-slate-200">
          {FILTERS.map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1.5 text-sm transition-colors ${
                filter === key
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
              {count !== undefined && count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                    filter === key ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {filter === 'history' ? (
          <div className="space-y-2">
            {executions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                <Clock className="h-8 w-8 text-slate-200" />
                <p className="text-sm">No execution history yet.</p>
              </div>
            ) : (
              executions.map((exec) => (
                <div
                  key={exec.id}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {new Date(exec.triggeredAt).toLocaleString()}
                    </p>
                    {exec.triggeredBy && (
                      <p className="text-xs text-slate-400">by {exec.triggeredBy}</p>
                    )}
                    {exec.note && <p className="mt-1 text-xs text-slate-400">{exec.note}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTriggers.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                <Zap className="h-8 w-8 text-slate-200" />
                <p className="text-sm">No triggers found.</p>
                <button
                  type="button"
                  className="text-xs text-blue-500 hover:underline"
                  onClick={onAddTrigger}
                >
                  Add a trigger
                </button>
              </div>
            ) : (
              filteredTriggers.map((trigger) => (
                <TriggerCard
                  key={trigger.id}
                  trigger={trigger}
                  sources={sources}
                  onFire={handleFire}
                  onRevert={handleRevertTrigger}
                  onDelete={handleDeleteTrigger}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
