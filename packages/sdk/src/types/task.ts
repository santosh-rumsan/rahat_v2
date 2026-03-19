export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Delayed'
export type TaskPriority = 'low' | 'normal' | 'high' | 'critical'

export interface TaskStatusLog {
  id: string
  status: TaskStatus
  notes: string
  fileName?: string
  timestamp: string
}

export interface Task {
  id: string
  projectId: string
  title: string
  assignedTo: string
  category: string
  description: string
  dueDate: string
  status: TaskStatus
  priority: TaskPriority
  statusLogs?: TaskStatusLog[]
}

export type CreateTaskInput = Omit<Task, 'id' | 'statusLogs'>
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'projectId'>>
