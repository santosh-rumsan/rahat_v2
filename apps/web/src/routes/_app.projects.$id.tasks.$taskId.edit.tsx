import { createFileRoute } from '@tanstack/react-router'
import { TaskManagementEditTaskPage, useProject } from '@rahataid/projects-shared'

export const Route = createFileRoute('/_app/projects/$id/tasks/$taskId/edit')({
  component: TaskManagementEditRoute,
})

function TaskManagementEditRoute() {
  const { id, taskId } = Route.useParams()
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

  return <TaskManagementEditTaskPage project={project} taskId={taskId} />
}
