import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import projectsData from '../data/projects.json'
import { getPlugin } from '../plugins'
import type { DashboardPageProps } from '@rahataid/plugin-sdk'

export const Route = createFileRoute('/_app/projects/$id/')({ component: ProjectDashboard })

function ProjectDashboard() {
  const { id } = Route.useParams()
  const project = projectsData.find((p) => p.id === id)!
  const plugin = getPlugin(project.projectType)
  const DashboardPage = plugin?.DashboardPage as ((props: DashboardPageProps) => React.ReactNode) | undefined

  return DashboardPage ? (
    <DashboardPage project={project} />
  ) : (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      No dashboard available for this project type.
    </div>
  )
}
