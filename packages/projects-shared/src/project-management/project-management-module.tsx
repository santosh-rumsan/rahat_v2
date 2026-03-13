import * as React from 'react'
import type { ProjectSummary } from '@rahataid/plugin-sdk'
import { ProjectDashboardHero } from '../project-dashboard-hero.js'
import { Button } from '@rs/ui/button'
import { Badge } from '@rs/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@rs/ui/card'
import { Input } from '@rs/ui/input'
import { Textarea } from '@rs/ui/textarea'
import { cn } from '@rs/ui'
import { CalendarDays, GripVertical, ListTodo, ShieldAlert, SquareKanban, Users2 } from 'lucide-react'

type TaskView = 'list' | 'kanban'
export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low'
export type TaskStatus = 'Assessment' | 'Planned' | 'In Progress' | 'Completed'

export interface HumanitarianTask {
  id: string
  title: string
  description: string
  sector: string
  interventionType: string
  location: string
  beneficiaryGroup: string
  focalPoint: string
  targetHouseholds: number
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
}

interface TaskDraft {
  title: string
  description: string
  sector: string
  interventionType: string
  location: string
  beneficiaryGroup: string
  focalPoint: string
  targetHouseholds: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
}

interface ProjectManagementModuleProps {
  project: ProjectSummary
}

interface AddTaskPageProps {
  project: ProjectSummary
}

const TASK_STORAGE_PREFIX = 'rahat-project-tasks'

const TASK_STATUSES: TaskStatus[] = ['Assessment', 'Planned', 'In Progress', 'Completed']
const PRIORITIES: TaskPriority[] = ['Critical', 'High', 'Medium', 'Low']
const SECTORS = ['WASH', 'Shelter', 'Food Security', 'Health', 'Protection', 'Cash Assistance', 'Education']
const INTERVENTION_TYPES = ['Rapid assessment', 'Distribution', 'Cash transfer', 'Training', 'Coordination', 'Monitoring visit']
const BENEFICIARY_GROUPS = ['Displaced households', 'Women-led households', 'Children', 'Older people', 'Persons with disabilities', 'Mixed community']

const statusBadgeClassNames: Record<TaskStatus, string> = {
  Assessment: 'bg-amber-100 text-amber-800',
  Planned: 'bg-sky-100 text-sky-800',
  'In Progress': 'bg-violet-100 text-violet-800',
  Completed: 'bg-emerald-100 text-emerald-800',
}

const priorityBadgeClassNames: Record<TaskPriority, string> = {
  Critical: 'bg-rose-100 text-rose-800',
  High: 'bg-orange-100 text-orange-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-slate-100 text-slate-700',
}

function getTaskStorageKey(projectId: string): string {
  return `${TASK_STORAGE_PREFIX}:${projectId}`
}

function getDefaultTaskDraft(project: ProjectSummary): TaskDraft {
  return {
    title: '',
    description: '',
    sector: SECTORS[0]!,
    interventionType: INTERVENTION_TYPES[0]!,
    location: project.location,
    beneficiaryGroup: BENEFICIARY_GROUPS[0]!,
    focalPoint: '',
    targetHouseholds: '',
    priority: 'Medium',
    status: 'Assessment',
    dueDate: '',
  }
}

function createInitialTasks(project: ProjectSummary): HumanitarianTask[] {
  return [
    {
      id: `${project.id}-task-1`,
      title: 'Validate community needs assessment',
      description: 'Confirm priority gaps with field teams and municipality focal points before finalizing the response package.',
      sector: 'Protection',
      interventionType: 'Rapid assessment',
      location: project.location,
      beneficiaryGroup: 'Mixed community',
      focalPoint: 'Assessment Lead',
      targetHouseholds: 120,
      priority: 'Critical',
      status: 'Assessment',
      dueDate: '2026-03-18',
    },
    {
      id: `${project.id}-task-2`,
      title: 'Prepare first-round distribution plan',
      description: 'Align commodity quantities, transport windows, and ward-level coverage targets for the initial distribution cycle.',
      sector: 'Food Security',
      interventionType: 'Distribution',
      location: project.location,
      beneficiaryGroup: 'Displaced households',
      focalPoint: 'Logistics Officer',
      targetHouseholds: 250,
      priority: 'High',
      status: 'Planned',
      dueDate: '2026-03-21',
    },
    {
      id: `${project.id}-task-3`,
      title: 'Conduct post-distribution monitoring',
      description: 'Track coverage, complaints, and inclusion risks after the first assistance round.',
      sector: 'Cash Assistance',
      interventionType: 'Monitoring visit',
      location: project.location,
      beneficiaryGroup: 'Women-led households',
      focalPoint: 'MEAL Officer',
      targetHouseholds: 90,
      priority: 'Medium',
      status: 'In Progress',
      dueDate: '2026-03-25',
    },
    {
      id: `${project.id}-task-4`,
      title: 'Submit municipal coordination update',
      description: 'Share implemented activities, reach, and outstanding pipeline constraints with coordination partners.',
      sector: 'Health',
      interventionType: 'Coordination',
      location: project.location,
      beneficiaryGroup: 'Mixed community',
      focalPoint: 'Project Manager',
      targetHouseholds: 0,
      priority: 'Low',
      status: 'Completed',
      dueDate: '2026-03-10',
    },
  ]
}

function isDueWithinDays(dueDate: string, days: number): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const deadline = new Date(dueDate)
  deadline.setHours(0, 0, 0, 0)

  const diffInDays = Math.round((deadline.getTime() - today.getTime()) / 86400000)
  return diffInDays >= 0 && diffInDays <= days
}

function useProjectTasks(project: ProjectSummary) {
  const [tasks, setTasks] = React.useState<HumanitarianTask[]>(() => createInitialTasks(project))

  React.useEffect(() => {
    const key = getTaskStorageKey(project.id)
    const stored = window.localStorage.getItem(key)
    if (!stored) {
      const seed = createInitialTasks(project)
      setTasks(seed)
      window.localStorage.setItem(key, JSON.stringify(seed))
      return
    }

    try {
      const parsed = JSON.parse(stored) as HumanitarianTask[]
      setTasks(parsed)
    } catch {
      const seed = createInitialTasks(project)
      setTasks(seed)
      window.localStorage.setItem(key, JSON.stringify(seed))
    }
  }, [project])

  const persistTasks = React.useCallback(
    (updater: HumanitarianTask[] | ((current: HumanitarianTask[]) => HumanitarianTask[])) => {
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

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  tone: string
}) {
  return (
    <Card className="border-slate-200/80 bg-white/90 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
      <CardContent className="flex items-center justify-between gap-4 px-5 py-5">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <span className={cn('flex size-10 items-center justify-center rounded-2xl', tone)}>
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  )
}

function FormSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-orange-300"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

function TaskForm({
  project,
  onSubmit,
}: {
  project: ProjectSummary
  onSubmit?: () => void
}) {
  const { setTasks } = useProjectTasks(project)
  const [draft, setDraft] = React.useState<TaskDraft>(() => getDefaultTaskDraft(project))

  function updateDraft<K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.title.trim() || !draft.focalPoint.trim() || !draft.dueDate) return

    const nextTask: HumanitarianTask = {
      id: `${project.id}-task-${crypto.randomUUID()}`,
      title: draft.title.trim(),
      description: draft.description.trim(),
      sector: draft.sector,
      interventionType: draft.interventionType,
      location: draft.location.trim() || project.location,
      beneficiaryGroup: draft.beneficiaryGroup,
      focalPoint: draft.focalPoint.trim(),
      targetHouseholds: Number.parseInt(draft.targetHouseholds, 10) || 0,
      priority: draft.priority,
      status: draft.status,
      dueDate: draft.dueDate,
    }

    setTasks((current) => [nextTask, ...current])
    setDraft(getDefaultTaskDraft(project))
    onSubmit?.()
  }

  return (
    <form onSubmit={handleCreateTask} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="task-title" className="text-sm font-medium text-slate-700">Task title</label>
        <Input
          id="task-title"
          value={draft.title}
          onChange={(event) => updateDraft('title', event.target.value)}
          placeholder="e.g. Finalize shelter NFI dispatch plan"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="task-description" className="text-sm font-medium text-slate-700">Description</label>
        <Textarea
          id="task-description"
          value={draft.description}
          onChange={(event) => updateDraft('description', event.target.value)}
          placeholder="Key activity, dependency, or reporting requirement"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect label="Sector" value={draft.sector} onChange={(value) => updateDraft('sector', value)} options={SECTORS} />
        <FormSelect label="Intervention type" value={draft.interventionType} onChange={(value) => updateDraft('interventionType', value)} options={INTERVENTION_TYPES} />
        <FormSelect label="Beneficiary group" value={draft.beneficiaryGroup} onChange={(value) => updateDraft('beneficiaryGroup', value)} options={BENEFICIARY_GROUPS} />
        <FormSelect label="Priority" value={draft.priority} onChange={(value) => updateDraft('priority', value as TaskPriority)} options={PRIORITIES} />
        <FormSelect label="Starting status" value={draft.status} onChange={(value) => updateDraft('status', value as TaskStatus)} options={TASK_STATUSES} />
        <div className="space-y-1.5">
          <label htmlFor="task-due-date" className="text-sm font-medium text-slate-700">Due date</label>
          <Input id="task-due-date" type="date" value={draft.dueDate} onChange={(event) => updateDraft('dueDate', event.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="task-location" className="text-sm font-medium text-slate-700">Operational location</label>
          <Input id="task-location" value={draft.location} onChange={(event) => updateDraft('location', event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="task-focal-point" className="text-sm font-medium text-slate-700">Focal point</label>
          <Input
            id="task-focal-point"
            value={draft.focalPoint}
            onChange={(event) => updateDraft('focalPoint', event.target.value)}
            placeholder="Field coordinator or owner"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="task-target-households" className="text-sm font-medium text-slate-700">Target households</label>
          <Input
            id="task-target-households"
            type="number"
            min="0"
            value={draft.targetHouseholds}
            onChange={(event) => updateDraft('targetHouseholds', event.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <Button type="submit" className="h-10 w-full bg-orange-500 text-white hover:bg-orange-600">
        Add task
      </Button>
    </form>
  )
}

export function ProjectManagementModule({ project }: ProjectManagementModuleProps) {
  const [view, setView] = React.useState<TaskView>('list')
  const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null)
  const { tasks, setTasks } = useProjectTasks(project)

  const tasksDueSoon = tasks.filter((task) => task.status !== 'Completed' && isDueWithinDays(task.dueDate, 7)).length
  const criticalTasks = tasks.filter((task) => task.priority === 'Critical' || task.priority === 'High').length

  function moveTask(taskId: string, status: TaskStatus) {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)))
  }

  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#fffdf8_0%,#f7fbff_42%,#f6f7fb_100%)]">
      <div className="flex min-h-0 flex-1 flex-col gap-6 px-8 pt-6">

        <Card className="min-h-0 flex-1 gap-0 py-0 border-slate-200/80 bg-white/92 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
          <CardHeader className="border-b border-slate-200/80 pt-4 pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Task tracker</CardTitle>
                <CardDescription>Use the table for structured review or switch to kanban to move work between status columns.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className={cn('inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors', view === 'list' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
                  >
                    <ListTodo className="size-4" />
                    Table view
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('kanban')}
                    className={cn('inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors', view === 'kanban' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
                  >
                    <SquareKanban className="size-4" />
                    Kanban
                  </button>
                </div>
                <a href={`/projects/${project.id}/project-management/add-task`}>
                  <Button className="h-10 bg-orange-500 text-white hover:bg-orange-600">Add task</Button>
                </a>
              </div>
            </div>
          </CardHeader>
          <CardContent className={view === 'list' ? 'flex-1 p-0' : 'flex-1 px-4 py-4'}>
            {view === 'list' ? (
              <div className="flex min-h-full flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-medium">Task</th>
                        <th className="px-4 py-3 font-medium">Sector</th>
                        <th className="px-4 py-3 font-medium">Owner</th>
                        <th className="px-4 py-3 font-medium">Location</th>
                        <th className="px-4 py-3 font-medium">Due date</th>
                        <th className="px-4 py-3 font-medium">Priority</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {tasks.map((task) => (
                        <tr key={task.id} className="align-top">
                          <td className="px-4 py-4">
                            <div className="min-w-56">
                              <p className="font-medium text-slate-950">{task.title}</p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">{task.interventionType} • {task.beneficiaryGroup}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600">{task.sector}</td>
                          <td className="px-4 py-4 text-slate-600">{task.focalPoint}</td>
                          <td className="px-4 py-4 text-slate-600">{task.location}</td>
                          <td className="px-4 py-4 text-slate-600">{task.dueDate}</td>
                          <td className="px-4 py-4">
                            <Badge className={priorityBadgeClassNames[task.priority]}>{task.priority}</Badge>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={task.status}
                              onChange={(event) => moveTask(task.id, event.target.value as TaskStatus)}
                              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-300"
                            >
                              {TASK_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-4">
                {TASK_STATUSES.map((status) => {
                  const columnTasks = tasks.filter((task) => task.status === status)
                  return (
                    <div
                      key={status}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (draggedTaskId) moveTask(draggedTaskId, status)
                        setDraggedTaskId(null)
                      }}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3"
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
                            className="cursor-grab rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_32px_-26px_rgba(15,23,42,0.45)] active:cursor-grabbing"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-slate-950">{task.title}</p>
                                <p className="mt-1 text-xs text-slate-500">{task.focalPoint}</p>
                              </div>
                              <GripVertical className="mt-0.5 size-4 text-slate-300" />
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function ProjectManagementAddTaskPage({ project }: AddTaskPageProps) {
  return (
    <div className="flex min-h-full flex-col bg-[linear-gradient(180deg,#fffdf8_0%,#f7fbff_42%,#f6f7fb_100%)]">
      <ProjectDashboardHero project={project} projectTypeLabel="Project Management" accentClassName="bg-orange-500 text-white" />

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-8 py-6">
        <Card className="border-slate-200/80 bg-white/95 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Add task</CardTitle>
                <CardDescription>Create a new humanitarian project task with the operational fields used by field teams.</CardDescription>
              </div>
              <a href={`/projects/${project.id}/project-management`}>
                <Button variant="outline" className="h-10">Back to tasks</Button>
              </a>
            </div>
          </CardHeader>
          <CardContent className="px-5 py-5">
            <TaskForm project={project} onSubmit={() => { window.location.href = `/projects/${project.id}/project-management` }} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
