import { createFileRoute } from '@tanstack/react-router'
import { ProjectManagementAddTaskPage } from '@rahataid/projects-shared'
import projectsData from '../data/projects.json'

export const Route = createFileRoute('/_app/projects/$id/project-management/add-task')({
  component: ProjectManagementAddTaskRoute,
})

function ProjectManagementAddTaskRoute() {
  const { id } = Route.useParams()
  const project = projectsData.find((item) => item.id === id)

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Project not found.
      </div>
    )
  }

  return <ProjectManagementAddTaskPage project={project} />
}
