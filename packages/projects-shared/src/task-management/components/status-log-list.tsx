import * as React from 'react'
import { Badge } from '@rs/ui/badge'
import { cn } from '@rs/ui'
import { ScrollText, Paperclip, ChevronDown } from 'lucide-react'
import { type StatusLog, statusBadgeClassNames } from '../types.js'

export function EmptyTabPlaceholder({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-400">
      <Icon className="size-8 opacity-40" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function StatusLogItem({ log }: { log: StatusLog }) {
  const [expanded, setExpanded] = React.useState(false)
  const hasDetails = !!log.notes || !!log.fileName

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => hasDetails && setExpanded((v) => !v)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
          hasDetails ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'
        )}
      >
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <Badge className={cn('shrink-0 text-xs', statusBadgeClassNames[log.status])}>{log.status}</Badge>
          <span className="text-xs text-slate-400 shrink-0">
            {new Date(log.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
          {log.fileName && (
            <span className="flex items-center gap-1 text-xs text-slate-400 truncate">
              <Paperclip className="size-3 shrink-0" />
              <span className="truncate">{log.fileName}</span>
            </span>
          )}
        </div>
        {hasDetails && (
          <ChevronDown className={cn('size-4 text-slate-400 shrink-0 transition-transform', expanded && 'rotate-180')} />
        )}
      </button>
      {expanded && hasDetails && (
        <div className="border-t border-slate-100 px-4 py-3 space-y-2 bg-slate-50/60">
          {log.notes && (
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{log.notes}</p>
          )}
          {log.fileName && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Paperclip className="size-3" />
              <span>{log.fileName}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function StatusLogList({ logs, compact = false }: { logs: StatusLog[]; compact?: boolean }) {
  const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  if (sorted.length === 0) {
    return <EmptyTabPlaceholder icon={ScrollText} label="No activity logs yet." />
  }
  return (
    <div className={cn('space-y-2', compact ? 'p-4' : 'py-4')}>
      {sorted.map((log) => (
        <StatusLogItem key={log.id} log={log} />
      ))}
    </div>
  )
}
