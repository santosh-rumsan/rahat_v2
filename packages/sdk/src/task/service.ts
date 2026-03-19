import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task.js'

export interface TaskService {
  list(projectId: string): Promise<Task[]>
  get(id: string): Promise<Task | undefined>
  create(data: CreateTaskInput): Promise<Task>
  update(id: string, data: UpdateTaskInput): Promise<Task>
  delete(id: string): Promise<void>
}
