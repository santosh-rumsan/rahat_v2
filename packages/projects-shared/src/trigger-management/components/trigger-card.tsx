import * as React from 'react'
import { Badge } from '@rs/ui/badge'
import { Button } from '@rs/ui/button'
import { Zap, RotateCcw, Trash2, Activity, Hand } from 'lucide-react'
import type { Trigger, TriggerSource } from '../types.js'

interface TriggerCardProps {
  trigger: Trigger
  sources?: TriggerSource[]
  onFire?: (id: string) => void
  onRevert?: (id: string) => void
  onDelete?: (id: string) => void
}

function buildConditionLabel(trigger: Trigger, sources?: TriggerSource[]): string {
  if (trigger.triggerType !== 'automated') return ''
  const source = sources?.find((s) => s.id === trigger.sourceId)
  const parts: string[] = []
  if (trigger.station) parts.push(trigger.station)
  if (source) parts.push(source.label)
  if (trigger.operator && trigger.value !== undefined) {
    parts.push(`${trigger.operator} ${trigger.value}`)
  }
  return parts.join(' • ')
}

export function TriggerCard({ trigger, sources, onFire, onRevert, onDelete }: TriggerCardProps) {
  const isTriggered = trigger.status === 'triggered'
  const conditionLabel = buildConditionLabel(trigger, sources)
  const isAutomated = trigger.triggerType === 'automated'

  return (
    <div
      className={`relative flex gap-0 rounded-lg border bg-white overflow-hidden transition-shadow hover:shadow-sm ${
        isTriggered ? 'border-rose-200' : 'border-slate-200'
      }`}
    >
      {/* Left accent */}
      <div
        className={`w-1 shrink-0 ${isTriggered ? 'bg-rose-400' : 'bg-slate-200'}`}
      />

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-slate-900 leading-snug">{trigger.title}</p>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              isTriggered
                ? 'bg-rose-50 text-rose-600'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${isTriggered ? 'bg-rose-500' : 'bg-slate-400'}`}
            />
            {isTriggered ? 'Triggered' : 'Pending'}
          </span>
        </div>

        {/* Condition */}
        {conditionLabel && (
          <p className="text-xs text-slate-500 font-mono bg-slate-50 rounded px-2 py-1">
            {conditionLabel}
          </p>
        )}

        {/* Description */}
        {trigger.description && (
          <p className="text-xs text-slate-400 italic">{trigger.description}</p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={`h-5 gap-1 px-1.5 text-[10px] font-medium ${
                trigger.isOptional
                  ? 'border-amber-200 bg-amber-50 text-amber-600'
                  : 'border-blue-200 bg-blue-50 text-blue-600'
              }`}
            >
              {trigger.isOptional ? 'Optional' : 'Mandatory'}
            </Badge>
            <Badge
              variant="outline"
              className="h-5 gap-1 px-1.5 text-[10px] font-medium border-slate-200 bg-white text-slate-500"
            >
              {isAutomated ? (
                <Activity className="h-2.5 w-2.5" />
              ) : (
                <Hand className="h-2.5 w-2.5" />
              )}
              {isAutomated ? 'Automated' : 'Manual'}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            {isTriggered && onRevert && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 px-2 text-xs text-slate-500 hover:text-slate-700"
                onClick={() => onRevert(trigger.id)}
              >
                <RotateCcw className="h-3 w-3" />
                Revert
              </Button>
            )}
            {!isTriggered && onFire && trigger.triggerType === 'manual' && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 px-2 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                onClick={() => onFire(trigger.id)}
              >
                <Zap className="h-3 w-3" />
                Fire
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                onClick={() => onDelete(trigger.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
