import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useProject } from '@rahataid/projects-shared'
import { getPlugin } from '../plugins'
import type { DashboardPageProps } from '@rahataid/plugin-sdk'
import { MapboxMap } from '../components/mapbox-map'

export const Route = createFileRoute('/_app/projects/$id/')({ component: ProjectDashboard })

function ProjectDashboard() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Loading…
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Project not found.
      </div>
    )
  }

  const plugin = getPlugin(project.projectType)
  const DashboardPage = plugin?.DashboardPage as ((props: DashboardPageProps) => React.ReactNode) | undefined

  const mapSlot =
    project.longitude != null && project.latitude != null ? (
      <MapboxMap
        longitude={project.longitude}
        latitude={project.latitude}
        zoom={10}
        className="w-full h-full"
        legend={project.location}
      />
    ) : undefined

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {DashboardPage ? (
        <DashboardPage
          project={project}
          onEdit={() => navigate({ to: '/projects/$id/edit', params: { id } })}
          mapSlot={mapSlot}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          No dashboard available for this project type.
        </div>
      )}
    </div>
  )
}
