import { createFileRoute } from '@tanstack/react-router'
import { ProjectManagementModule, useProject } from '@rahataid/projects-shared'

export const Route = createFileRoute('/_app/projects/$id/project-management')({
  component: ProjectManagementPage,
})

function ProjectManagementPage() {
  const { id } = Route.useParams()
  const { data: project, isLoading } = useProject(id)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Project not found.
      </div>
    )
  }

  return <ProjectManagementModule project={project} />
}
