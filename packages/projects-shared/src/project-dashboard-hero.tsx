import * as React from 'react'
import type { ProjectSummary } from '@rahataid/plugin-sdk'
import { MoreHorizontal, Pencil } from 'lucide-react'

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

export function ProjectDashboardHero({ project, projectTypeLabel, accentClassName, onEdit }: ProjectDashboardHeroProps) {
  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

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
    </section>
  )
}
