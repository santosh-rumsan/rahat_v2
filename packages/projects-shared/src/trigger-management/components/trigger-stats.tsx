import * as React from 'react'
import type { TriggerStatementStats } from '../types.js'

interface TriggerStatsProps {
  stats: TriggerStatementStats
  mandatoryThreshold: number
  optionalThreshold: number
}

export function TriggerStats({ stats, mandatoryThreshold, optionalThreshold }: TriggerStatsProps) {
  return (
    <div className="flex gap-3 w-full">
      <div className="flex-1 rounded-lg bg-blue-50 p-3 space-y-2">
        <p className="text-xs font-medium text-slate-600">Mandatory Triggers</p>
        <p className="text-xl font-bold text-blue-600">
          {stats.mandatoryTriggered}{' '}
          <span className="text-sm font-normal text-slate-500">triggered</span>
        </p>
        <div className="border-t border-blue-100 pt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Station</span>
            <span className="inline-flex h-5 w-10 items-center justify-center rounded-full bg-blue-500 text-[10px] font-semibold text-white">
              {stats.mandatoryTriggered}/{mandatoryThreshold}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Total Triggers</span>
            <span>{stats.mandatoryTotal}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Required</span>
            <span>{mandatoryThreshold}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Remaining</span>
            <span>{Math.max(0, mandatoryThreshold - stats.mandatoryTriggered)}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 rounded-lg bg-amber-50 p-3 space-y-2">
        <p className="text-xs font-medium text-slate-600">Optional Triggers</p>
        <p className="text-xl font-bold text-amber-500">
          {stats.optionalTriggered}{' '}
          <span className="text-sm font-normal text-slate-500">triggered</span>
        </p>
        <div className="border-t border-amber-100 pt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Station</span>
            <span className="inline-flex h-5 w-10 items-center justify-center rounded-full bg-amber-400 text-[10px] font-semibold text-white">
              {stats.optionalTriggered}/{optionalThreshold}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Total Triggers</span>
            <span>{stats.optionalTotal}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Required</span>
            <span>{optionalThreshold}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Remaining</span>
            <span>{Math.max(0, optionalThreshold - stats.optionalTriggered)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
