import { createFileRoute } from '@tanstack/react-router'
import { ProjectReportsPage } from '@rahataid/projects-shared/reports'

export const Route = createFileRoute('/_app/projects/$id/reports/')({ component: ProjectReportsIndexPage })

function ProjectReportsIndexPage() {
  const { id } = Route.useParams()
  return <ProjectReportsPage projectId={id} />
}
