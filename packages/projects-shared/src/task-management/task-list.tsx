import * as React from 'react'
import type { ProjectSummary } from '@rahataid/plugin-sdk'
import { Button } from '@rs/ui/button'
import { Badge } from '@rs/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@rs/ui/card'
import { cn } from '@rs/ui'
import { GripVertical, ListTodo, SquareKanban, ClipboardList, Zap, Shield, Star, Target, Folder, FlaskConical, Users, BookOpen, type LucideIcon } from 'lucide-react'

const GROUP_ICONS: LucideIcon[] = [ClipboardList, Zap, Shield, Star, Target, Folder, FlaskConical, Users, BookOpen]
import { type TaskView, type TaskStatus, type StatusLog, TASK_STATUSES, statusBadgeClassNames, priorityBadgeClassNames, priorityLabel } from './types.js'
import { useProjectTasks } from './hooks.js'
import { TaskPreviewPanel } from './task-preview.js'

const DEFAULT_GROUP = 'General'

export function TaskManagementModule({ project, taskGroups }: { project: ProjectSummary; taskGroups?: string[] }) {
  const groups = taskGroups && taskGroups.length > 0 ? taskGroups : [DEFAULT_GROUP]
  const showTabs = groups.length > 1
  const [activeGroup, setActiveGroup] = React.useState(groups[0]!)
  const [view, setView] = React.useState<TaskView>('list')
  const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null)
  const { tasks, setTasks } = useProjectTasks(project)

  const groupedTasks = tasks.filter((t) => (t.group ?? DEFAULT_GROUP) === activeGroup)

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null

  function moveTask(taskId: string, status: TaskStatus) {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)))
  }

  function handleStatusChange(taskId: string, status: TaskStatus, notes: string, fileName?: string) {
    const log: StatusLog = {
      id: crypto.randomUUID(),
      status,
      notes,
      fileName,
      timestamp: new Date().toISOString(),
    }
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, status, statusLogs: [...(task.statusLogs ?? []), log] }
          : task
      )
    )
  }

  function handleRowClick(taskId: string) {
    setSelectedTaskId((current) => (current === taskId ? null : taskId))
  }

  function handleRowDoubleClick(taskId: string) {
    window.location.href = `/projects/${project.id}/tasks/${taskId}`
  }

  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#fffdf8_0%,#f7fbff_42%,#f6f7fb_100%)]">
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        <Card className="min-h-0 flex-1 gap-0 py-0 border-slate-200/80 bg-white/92 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] rounded-none flex flex-col">
          <CardHeader className="border-b border-slate-200/80 pt-4 pb-4 shrink-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="text-xl font-semibold">Task Management</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                {showTabs && (
                  <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
                    {groups.map((group, i) => {
                      const GroupIcon = GROUP_ICONS[i % GROUP_ICONS.length]!
                      const count = tasks.filter((t) => (t.group ?? DEFAULT_GROUP) === group).length
                      return (
                        <button
                          key={group}
                          type="button"
                          onClick={() => { setActiveGroup(group); setSelectedTaskId(null) }}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
                            activeGroup === group ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          )}
                        >
                          <GroupIcon className="size-3.5" />
                          {group}
                          <span className={cn('ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium leading-none', activeGroup === group ? 'bg-slate-100 text-slate-600' : 'bg-slate-200/60 text-slate-500')}>
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
                <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <div className="relative group/tooltip">
                    <button
                      type="button"
                      onClick={() => { setView('list'); setSelectedTaskId(null) }}
                      className={cn('inline-flex items-center rounded-lg px-2.5 py-2 transition-colors', view === 'list' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
                    >
                      <ListTodo className="size-4" />
                    </button>
                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100">
                      Table view
                    </div>
                  </div>
                  <div className="relative group/tooltip">
                    <button
                      type="button"
                      onClick={() => { setView('kanban'); setSelectedTaskId(null) }}
                      className={cn('inline-flex items-center rounded-lg px-2.5 py-2 transition-colors', view === 'kanban' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
                    >
                      <SquareKanban className="size-4" />
                    </button>
                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100">
                      Kanban
                    </div>
                  </div>
                </div>
                <a href={`/projects/${project.id}/tasks/add-task`}>
                  <Button className="h-10 bg-orange-500 text-white hover:bg-orange-600">Add task</Button>
                </a>
              </div>
            </div>
          </CardHeader>

          <CardContent className="min-h-0 p-0 flex-1 overflow-hidden flex">
            {view === 'list' ? (
              <>
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                  <div className="overflow-y-auto overflow-x-auto flex-1">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 font-medium">Title</th>
                          <th className="px-4 py-3 font-medium">Category</th>
                          <th className="px-4 py-3 font-medium">Assigned to</th>
                          <th className="px-4 py-3 font-medium">Due date</th>
                          <th className="px-4 py-3 font-medium">Priority</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {groupedTasks.map((task) => (
                          <tr
                            key={task.id}
                            onClick={() => handleRowClick(task.id)}
                            onDoubleClick={() => handleRowDoubleClick(task.id)}
                            className={cn(
                              'align-top cursor-pointer transition-colors hover:bg-slate-50',
                              task.id === selectedTaskId && 'bg-orange-50 hover:bg-orange-50'
                            )}
                          >
                            <td className="px-4 py-4">
                              <p className="font-medium text-slate-950 min-w-44">{task.title}</p>
                            </td>
                            <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{task.category}</td>
                            <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{task.assignedTo || '—'}</td>
                            <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{task.dueDate || '—'}</td>
                            <td className="px-4 py-4">
                              <Badge className={priorityBadgeClassNames[task.priority]}>{priorityLabel[task.priority]}</Badge>
                            </td>
                            <td className="px-4 py-4">
                              <Badge className={statusBadgeClassNames[task.status]}>{task.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedTask && (
                  <TaskPreviewPanel
                    task={selectedTask}
                    projectId={project.id}
                    onClose={() => setSelectedTaskId(null)}
                    onStatusChange={handleStatusChange}
                  />
                )}
              </>
            ) : (
              <div className="flex flex-1 min-w-0 overflow-hidden">
                <div className="flex-1 overflow-x-auto overflow-y-auto px-4 py-4">
                  <div className="flex gap-4" style={{ minWidth: `${TASK_STATUSES.length * 288 + (TASK_STATUSES.length - 1) * 16}px` }}>
                    {TASK_STATUSES.map((status) => {
                      const columnTasks = groupedTasks.filter((task) => task.status === status)
                      return (
                        <div
                          key={status}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => {
                            if (draggedTaskId) moveTask(draggedTaskId, status)
                            setDraggedTaskId(null)
                          }}
                          className="w-72 shrink-0 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{status}</p>
                              <p className="text-xs text-slate-500">{columnTasks.length} tasks</p>
                            </div>
                            <Badge className={statusBadgeClassNames[status]}>{columnTasks.length}</Badge>
                          </div>
                          <div className="space-y-3">
                            {columnTasks.map((task) => (
                              <div
                                key={task.id}
                                draggable
                                onDragStart={() => setDraggedTaskId(task.id)}
                                onDragEnd={() => setDraggedTaskId(null)}
                                onDoubleClick={() => setSelectedTaskId((current) => current === task.id ? null : task.id)}
                                className={cn(
                                  'cursor-grab rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_32px_-26px_rgba(15,23,42,0.45)] active:cursor-grabbing select-none',
                                  task.id === selectedTaskId && 'ring-2 ring-orange-400 border-orange-300'
                                )}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-950 truncate">{task.title}</p>
                                    <p className="mt-1 text-xs text-slate-500">{task.category}</p>
                                    {task.assignedTo && (
                                      <p className="mt-0.5 text-xs text-slate-400">{task.assignedTo}</p>
                                    )}
                                  </div>
                                  <GripVertical className="mt-0.5 size-4 text-slate-300 shrink-0" />
                                </div>
                                <div className="mt-2">
                                  <Badge className={cn('text-xs', priorityBadgeClassNames[task.priority])}>{priorityLabel[task.priority]}</Badge>
                                </div>
                              </div>
                            ))}
                            {columnTasks.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-3 py-6 text-center text-xs text-slate-400">
                                Drop tasks here to update status.
                              </div>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {selectedTask && (
                  <TaskPreviewPanel
                    task={selectedTask}
                    projectId={project.id}
                    onClose={() => setSelectedTaskId(null)}
                    onStatusChange={handleStatusChange}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
