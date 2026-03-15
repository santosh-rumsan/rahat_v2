import * as React from 'react'
import type { ProjectSummary } from '@rahataid/plugin-sdk'
import { MoreHorizontal, Pencil, Coins } from 'lucide-react'
import { useProjectAllocations } from './project/index.js'

interface ProjectDashboardHeroProps {
  project: ProjectSummary
  projectTypeLabel: string
  accentClassName: string
  onEdit?: () => void
}

const statusClassNames: Record<string, string> = {
  Active: 'bg-emerald-500 text-white',
  Planning: 'bg-amber-400 text-white',
  Completed: 'bg-slate-400 text-white',
}

const TOKEN_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  cUSD: { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-400' },
  cEUR: { bg: 'bg-blue-50',    text: 'text-blue-600',    bar: 'bg-blue-400'    },
  cNPR: { bg: 'bg-purple-50',  text: 'text-purple-600',  bar: 'bg-purple-400'  },
}
const FALLBACK_COLORS = { bg: 'bg-gray-100', text: 'text-gray-600', bar: 'bg-gray-400' }

function fmtAmount(n: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)
}

export function ProjectDashboardHero({ project, projectTypeLabel, accentClassName, onEdit }: ProjectDashboardHeroProps) {
  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const { data: allocations = [] } = useProjectAllocations(project.id)

  // Aggregate per token
  const tokenTotals = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const a of allocations) {
      map.set(a.token, (map.get(a.token) ?? 0) + a.amount)
    }
    return Array.from(map.entries()).map(([token, amount]) => ({ token, amount }))
  }, [allocations])

  React.useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <section className="px-8 pt-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950 md:text-4xl xl:text-3xl">
            {project.name}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 md:text-base">
            {project.location}
          </p>
        </div>

        {onEdit && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MoreHorizontal size={16} />
              Actions
            </button>
            {open && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                <button
                  onClick={() => { setOpen(false); onEdit() }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs tracking-[0.05em] ${accentClassName}`}>
          {projectTypeLabel}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs  tracking-[0.05em] ${
            statusClassNames[project.status] ?? statusClassNames.Completed
          }`}
        >
          {project.status}
        </span>
      </div>

      {tokenTotals.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <Coins size={13} />
            Allocated funds:
          </span>
          {tokenTotals.map(({ token, amount }) => {
            const c = TOKEN_COLORS[token] ?? FALLBACK_COLORS
            return (
              <span
                key={token}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${c.bg} ${c.text}`}
              >
                {fmtAmount(amount)} {token}
              </span>
            )
          })}
        </div>
      )}
    </section>
  )
}
