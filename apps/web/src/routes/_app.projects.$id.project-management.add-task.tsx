import { createFileRoute } from '@tanstack/react-router'
import { ProjectManagementAddTaskPage, useProject } from '@rahataid/projects-shared'

export const Route = createFileRoute('/_app/projects/$id/project-management/add-task')({
  component: ProjectManagementAddTaskRoute,
})

function ProjectManagementAddTaskRoute() {
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

  return <ProjectManagementAddTaskPage project={project} />
}
