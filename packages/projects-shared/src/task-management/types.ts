export type TaskView = 'list' | 'kanban'
export type TaskPriority = 'low' | 'normal' | 'high' | 'critical'
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Delayed'
export type TaskType = string
export type TriggerType = 'manual' | 'automated'

export interface StatusLog {
  id: string
  status: TaskStatus
  notes: string
  fileName?: string
  timestamp: string
}

export interface TaskDocument {
  id: string
  name: string
  dataUrl: string
  uploadedAt: string
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
  taskType: TaskType
  triggerType: TriggerType
  group?: string
  designerData?: Record<string, unknown>
  statusLogs?: StatusLog[]
  documents?: TaskDocument[]
}

export interface TaskDraft {
  title: string
  assignedTo: string
  category: string
  description: string
  dueDate: string
  status: TaskStatus
  priority: TaskPriority
  taskType: TaskType
  triggerType: TriggerType
  group?: string
}

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

export function getDefaultTaskDraft(): TaskDraft {
  return {
    title: '',
    assignedTo: '',
    category: CATEGORIES[0]!,
    description: '',
    dueDate: '',
    status: 'Not Started',
    priority: 'normal',
    taskType: 'default',
    triggerType: 'manual',
  }
}
