import * as React from 'react'
import type { ProjectSummary } from '@rahataid/plugin-sdk'
import { type ProjectTask, getTaskStorageKey, createInitialTasks } from './types.js'

export function useProjectTasks(project: ProjectSummary) {
  const [tasks, setTasks] = React.useState<ProjectTask[]>(() => {
    const key = getTaskStorageKey(project.id)
    try {
      const stored = window.localStorage.getItem(key)
      if (stored) {
        return JSON.parse(stored) as ProjectTask[]
      }
    } catch {}
    const seed = createInitialTasks(project)
    window.localStorage.setItem(key, JSON.stringify(seed))
    return seed
  })

  const persistTasks = React.useCallback(
    (updater: ProjectTask[] | ((current: ProjectTask[]) => ProjectTask[])) => {
      setTasks((current) => {
        const next = typeof updater === 'function' ? updater(current) : updater
        window.localStorage.setItem(getTaskStorageKey(project.id), JSON.stringify(next))
        return next
      })
    },
    [project.id]
  )

  return { tasks, setTasks: persistTasks }
}
