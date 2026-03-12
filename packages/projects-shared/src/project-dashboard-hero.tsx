import type { ProjectSummary } from '@rahataid/plugin-sdk'

interface ProjectDashboardHeroProps {
  project: ProjectSummary
  projectTypeLabel: string
  accentClassName: string
}

const statusClassNames: Record<string, string> = {
  Active: 'bg-emerald-500 text-white',
  Planning: 'bg-amber-400 text-white',
  Completed: 'bg-slate-400 text-white',
}

export function ProjectDashboardHero({ project, projectTypeLabel, accentClassName }: ProjectDashboardHeroProps) {
  return (
    <section className="px-8 pt-10">
      <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950 md:text-4xl xl:text-3xl">
        {project.name}
      </h1>
      <p className="mt-1.5 text-sm text-slate-500 md:text-base">
        {project.location}
      </p>
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
