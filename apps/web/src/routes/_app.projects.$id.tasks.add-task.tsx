import { createFileRoute } from '@tanstack/react-router'
import { TaskManagementAddTaskPage, useProject } from '@rahataid/projects-shared'
import { getRegisteredTaskTypes } from '@rahataid/projects-shared/task-management'
import { isPluginEnabled } from '../plugins/plugin-state'

export const Route = createFileRoute('/_app/projects/$id/tasks/add-task')({
  component: TaskManagementAddTaskRoute,
})

function TaskManagementAddTaskRoute() {
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

  const taskTypes = getRegisteredTaskTypes().filter((t) => isPluginEnabled(t.type))
  return <TaskManagementAddTaskPage project={project} taskTypes={taskTypes} />
}
