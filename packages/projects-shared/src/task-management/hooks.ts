import * as React from 'react'
import type { ProjectSummary } from '@rahataid/plugin-sdk'
import { idbTaskService } from '@rahataid/sdk'
import type { CreateTaskInput } from '@rahataid/sdk'
import type { ProjectTask } from './types.js'

export function useProjectTasks(project: ProjectSummary) {
  const [tasks, setTasksState] = React.useState<ProjectTask[]>([])

  React.useEffect(() => {
    idbTaskService.list(project.id).then((loaded) => {
      setTasksState(loaded as unknown as ProjectTask[])
    }).catch(() => {})
  }, [project.id])

  const setTasks = React.useCallback(
    (updater: ProjectTask[] | ((current: ProjectTask[]) => ProjectTask[])) => {
      setTasksState((current) => {
        const next = typeof updater === 'function' ? updater(current) : updater
        void syncTasksToIdb(project.id, current, next)
        return next
      })
    },
    [project.id]
  )

  return { tasks, setTasks }
}

async function syncTasksToIdb(projectId: string, prev: ProjectTask[], next: ProjectTask[]) {
  const prevIds = new Set(prev.map((t) => t.id))
  const nextIds = new Set(next.map((t) => t.id))

  for (const task of prev) {
    if (!nextIds.has(task.id)) {
      await idbTaskService.delete(task.id).catch(() => {})
    }
  }

  for (const task of next) {
    const record = { ...task, projectId } as unknown as CreateTaskInput
    if (!prevIds.has(task.id)) {
      await idbTaskService.create(record).catch(() => {})
    } else {
      const prevTask = prev.find((t) => t.id === task.id)
      if (prevTask !== task) {
        await idbTaskService.update(task.id, record).catch(() => {})
      }
    }
  }
}
