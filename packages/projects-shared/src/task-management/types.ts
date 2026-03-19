import type { ProjectSummary } from '@rahataid/plugin-sdk'

export type TaskView = 'list' | 'kanban'
export type TaskPriority = 'low' | 'normal' | 'high' | 'critical'
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Delayed'

export interface StatusLog {
  id: string
  status: TaskStatus
  notes: string
  fileName?: string
  timestamp: string
}

export interface ProjectTask {
  id: string
  title: string
  assignedTo: string
  category: string
  description: string
  dueDate: string
  status: TaskStatus
  priority: TaskPriority
  statusLogs?: StatusLog[]
}

export interface TaskDraft {
  title: string
  assignedTo: string
  category: string
  description: string
  dueDate: string
  status: TaskStatus
  priority: TaskPriority
}

export const TASK_STORAGE_PREFIX = 'rahat-project-tasks-v3'

export const TASK_STATUSES: TaskStatus[] = ['Not Started', 'In Progress', 'Completed', 'Delayed']
export const PRIORITIES: TaskPriority[] = ['low', 'normal', 'high', 'critical']
export const CATEGORIES = [
  'Planning',
  'Field Operations',
  'Assessment',
  'Monitoring',
  'Coordination',
  'Reporting',
  'Training',
  'Distribution',
  'Other',
]

export const statusBadgeClassNames: Record<TaskStatus, string> = {
  'Not Started': 'bg-slate-100 text-slate-700',
  'In Progress': 'bg-violet-100 text-violet-800',
  'Completed': 'bg-emerald-100 text-emerald-800',
  'Delayed': 'bg-rose-100 text-rose-800',
}

export const priorityBadgeClassNames: Record<TaskPriority, string> = {
  critical: 'bg-rose-100 text-rose-800',
  high: 'bg-orange-100 text-orange-800',
  normal: 'bg-sky-100 text-sky-800',
  low: 'bg-slate-100 text-slate-600',
}

export const priorityLabel: Record<TaskPriority, string> = {
  critical: 'Critical',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
}

export function getTaskStorageKey(projectId: string): string {
  return `${TASK_STORAGE_PREFIX}:${projectId}`
}

export function getDefaultTaskDraft(): TaskDraft {
  return {
    title: '',
    assignedTo: '',
    category: CATEGORIES[0]!,
    description: '',
    dueDate: '',
    status: 'Not Started',
    priority: 'normal',
  }
}

export function createInitialTasks(project: ProjectSummary): ProjectTask[] {
  return [
    {
      id: `${project.id}-task-1`,
      title: 'Validate community needs assessment',
      assignedTo: 'Assessment Lead',
      category: 'Assessment',
      description: 'Confirm priority gaps with field teams and municipality focal points before finalizing the response package.',
      dueDate: '2026-03-25',
      status: 'In Progress',
      priority: 'critical',
    },
    {
      id: `${project.id}-task-2`,
      title: 'Prepare first-round distribution plan',
      assignedTo: 'Logistics Officer',
      category: 'Distribution',
      description: 'Align commodity quantities, transport windows, and ward-level coverage targets for the initial distribution cycle.',
      dueDate: '2026-03-28',
      status: 'Not Started',
      priority: 'high',
    },
    {
      id: `${project.id}-task-3`,
      title: 'Conduct post-distribution monitoring',
      assignedTo: 'MEAL Officer',
      category: 'Monitoring',
      description: 'Track coverage, complaints, and inclusion risks after the first assistance round.',
      dueDate: '2026-04-05',
      status: 'Not Started',
      priority: 'normal',
    },
    {
      id: `${project.id}-task-4`,
      title: 'Submit municipal coordination update',
      assignedTo: 'Project Manager',
      category: 'Coordination',
      description: 'Share implemented activities, reach, and outstanding pipeline constraints with coordination partners.',
      dueDate: '2026-03-10',
      status: 'Completed',
      priority: 'low',
    },
    {
      id: `${project.id}-task-5`,
      title: 'Beneficiary registration data cleaning',
      assignedTo: 'Data Officer',
      category: 'Field Operations',
      description: 'Reconcile duplicate entries and validate ID numbers across the beneficiary database.',
      dueDate: '2026-03-20',
      status: 'Delayed',
      priority: 'high',
    },
  ]
}
