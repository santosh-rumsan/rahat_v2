import * as React from 'react'
import { Button } from '@rs/ui/button'
import { Badge } from '@rs/ui/badge'
import { Plus, ArrowRight, Zap, CheckCircle2, AlertCircle, Activity } from 'lucide-react'
import type { TriggerStatement, Trigger } from '@rahataid/sdk'
import { computeStats } from './hooks.js'
import type { TriggerManagementConfig } from './types.js'
import { useTriggerStatements, useCreateTriggerStatement } from './queries.js'

const PHASE_COLORS: Record<string, { accent: string; bg: string; text: string; ring: string; icon: string }> = {
  Preparedness: {
    accent: 'bg-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    ring: 'ring-blue-200',
    icon: 'text-blue-500',
  },
  PREPAREDNESS: {
    accent: 'bg-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    ring: 'ring-blue-200',
    icon: 'text-blue-500',
  },
  Activation: {
    accent: 'bg-rose-500',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    ring: 'ring-rose-200',
    icon: 'text-rose-500',
  },
  ACTIVATION: {
    accent: 'bg-rose-500',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    ring: 'ring-rose-200',
    icon: 'text-rose-500',
  },
  Readiness: {
    accent: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
    icon: 'text-emerald-500',
  },
  READINESS: {
    accent: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
    icon: 'text-emerald-500',
  },
}

const DEFAULT_COLOR = {
  accent: 'bg-violet-500',
  bg: 'bg-violet-50',
  text: 'text-violet-700',
  ring: 'ring-violet-200',
  icon: 'text-violet-500',
}

function getPhaseColor(phase: string) {
  return PHASE_COLORS[phase] ?? DEFAULT_COLOR
}

function SegmentedProgress({
  value,
  max,
  accentClass,
}: {
  value: number
  max: number
  accentClass: string
}) {
  if (max === 0) return null
  const segments = Array.from({ length: max }, (_, i) => i < value)

  return (
    <div className="flex gap-1">
      {segments.map((filled, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
            filled ? accentClass : 'bg-slate-100'
          }`}
        />
      ))}
    </div>
  )
}

interface PhaseCardProps {
  statement: TriggerStatement
  triggers: Trigger[]
  onViewDetails?: () => void
  onAddTrigger?: () => void
}

function PhaseCard({ statement, triggers, onViewDetails, onAddTrigger }: PhaseCardProps) {
  const stats = computeStats(statement, triggers)
  const isTriggered = statement.status === 'triggered'
  const colors = getPhaseColor(statement.phase)

  const mandatoryMet = stats.mandatoryTriggered >= statement.mandatoryThreshold
  const hasOptional = statement.optionalThreshold > 0

  const overallPct =
    stats.total > 0 ? Math.round((stats.triggered / stats.total) * 100) : 0

  return (
    <div
      className={`group relative flex flex-col rounded-2xl bg-white shadow-sm ring-1 transition-all duration-200 hover:shadow-md ${
        isTriggered ? 'ring-rose-300' : 'ring-slate-200'
      }`}
    >
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${
          isTriggered ? 'bg-rose-400' : colors.accent
        }`}
      />

      <div className="flex flex-col gap-5 p-6 pl-7">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${colors.bg} ${colors.icon}`}
              >
                <Zap className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                {statement.phase}
              </h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {stats.triggered}
              <span className="text-base font-medium text-slate-400">/{stats.total}</span>
            </p>
            <p className="text-xs text-slate-400">
              {stats.triggered === 0
                ? 'No triggers fired yet'
                : `${stats.triggered} trigger${stats.triggered !== 1 ? 's' : ''} fired`}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border-0 ${
                isTriggered
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isTriggered ? (
                <><AlertCircle className="mr-1 h-3 w-3" />Triggered</>
              ) : (
                <><Activity className="mr-1 h-3 w-3" />Active</>
              )}
            </Badge>

            {stats.total > 0 && (
              <span className={`text-2xl font-bold ${isTriggered ? 'text-rose-500' : colors.text}`}>
                {overallPct}%
              </span>
            )}
          </div>
        </div>

        {/* Thresholds */}
        <div className="space-y-3">
          {/* Mandatory */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {mandatoryMet ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-slate-200" />
                )}
                <span className="text-xs font-medium text-slate-600">Mandatory</span>
              </div>
              <span className="text-xs font-bold text-slate-700">
                {stats.mandatoryTriggered}
                <span className="font-normal text-slate-400">/{statement.mandatoryThreshold}</span>
              </span>
            </div>
            <SegmentedProgress
              value={stats.mandatoryTriggered}
              max={statement.mandatoryThreshold}
              accentClass={isTriggered ? 'bg-rose-400' : colors.accent}
            />
          </div>

          {/* Optional */}
          {hasOptional && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {stats.optionalTriggered >= statement.optionalThreshold ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-slate-200" />
                  )}
                  <span className="text-xs font-medium text-slate-600">Optional</span>
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {stats.optionalTriggered}
                  <span className="font-normal text-slate-400">/{statement.optionalThreshold}</span>
                </span>
              </div>
              <SegmentedProgress
                value={stats.optionalTriggered}
                max={statement.optionalThreshold}
                accentClass="bg-amber-400"
              />
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className={`flex items-center gap-3 rounded-xl ${colors.bg} px-4 py-3`}>
          <div className="flex-1 text-center">
            <p className={`text-xl font-bold ${colors.text}`}>{stats.total}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Total</p>
          </div>
          <div className="h-8 w-px bg-white/60" />
          <div className="flex-1 text-center">
            <p className={`text-xl font-bold ${colors.text}`}>{stats.mandatoryTotal}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Mandatory</p>
          </div>
          {stats.optionalTotal > 0 && (
            <>
              <div className="h-8 w-px bg-white/60" />
              <div className="flex-1 text-center">
                <p className="text-xl font-bold text-amber-600">{stats.optionalTotal}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Optional</p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg border-slate-200 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            onClick={onAddTrigger}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Trigger
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 gap-1 text-xs font-medium ${colors.text} hover:bg-transparent`}
            onClick={onViewDetails}
          >
            View Details
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

interface TriggerStatementOverviewProps {
  config: TriggerManagementConfig
  triggers: Trigger[]
}

export function TriggerStatementOverview({ config, triggers }: TriggerStatementOverviewProps) {
  const { projectId, phases, onViewDetails, onAddTrigger, riverBasin } = config
  const { data: statements = [], isLoading } = useTriggerStatements(projectId)
  const createStatement = useCreateTriggerStatement(projectId)

  React.useEffect(() => {
    if (isLoading) return
    for (const phase of phases) {
      const exists = statements.some((s) => s.phase === phase)
      if (!exists) {
        createStatement.mutate({
          projectId,
          phase,
          riverBasin,
          mandatoryThreshold: 1,
          optionalThreshold: 0,
          taskGroupId: config.phaseTaskGroups?.[phase],
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, statements.length])

  const totalFired = triggers.filter((t) => t.status === 'triggered').length
  const totalTriggers = triggers.length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trigger Statements</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Monitor and manage phase trigger conditions
          </p>
        </div>
        {!isLoading && totalTriggers > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            {totalFired} / {totalTriggers} fired
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {phases.map((phase) => (
            <div key={phase} className="h-72 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {phases.map((phase) => {
            const statement = statements.find((s) => s.phase === phase)
            if (!statement) return null
            const phaseTriggers = triggers.filter((t) => t.statementId === statement.id)
            return (
              <PhaseCard
                key={phase}
                statement={statement}
                triggers={phaseTriggers}
                onViewDetails={() => onViewDetails?.(phase, statement.id)}
                onAddTrigger={() => onAddTrigger?.(phase, statement.id)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
