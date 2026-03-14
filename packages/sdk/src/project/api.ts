import type { Project, CreateProjectInput, UpdateProjectInput } from '../types/project.js'
import type { ProjectService } from './service.js'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

export function createApiProjectService(baseUrl: string): ProjectService {
  const base = `${baseUrl}/projects`

  return {
    list() {
      return apiFetch<Project[]>(base)
    },

    get(id) {
      return apiFetch<Project>(`${base}/${id}`)
    },

    create(data: CreateProjectInput) {
      return apiFetch<Project>(base, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update(id, data: UpdateProjectInput) {
      return apiFetch<Project>(`${base}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    async delete(id) {
      await apiFetch<void>(`${base}/${id}`, { method: 'DELETE' })
    },
  }
}
