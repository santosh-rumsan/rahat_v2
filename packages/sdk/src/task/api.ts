import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task.js'
import type { TaskService } from './service.js'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

export function createApiTaskService(baseUrl: string): TaskService {
  const base = `${baseUrl}/tasks`

  return {
    list(projectId) {
      return apiFetch<Task[]>(`${base}?projectId=${projectId}`)
    },

    get(id) {
      return apiFetch<Task>(`${base}/${id}`)
    },

    create(data: CreateTaskInput) {
      return apiFetch<Task>(base, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update(id, data: UpdateTaskInput) {
      return apiFetch<Task>(`${base}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    async delete(id) {
      await apiFetch<void>(`${base}/${id}`, { method: 'DELETE' })
    },
  }
}
