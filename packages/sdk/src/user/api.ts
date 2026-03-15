import type { User, CreateUserInput, UpdateUserInput } from '../types/user.js'
import type { UserService } from './service.js'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

export function createApiUserService(baseUrl: string): UserService {
  const base = `${baseUrl}/users`

  return {
    list() {
      return apiFetch<User[]>(base)
    },

    get(id) {
      return apiFetch<User>(`${base}/${id}`)
    },

    create(data: CreateUserInput) {
      return apiFetch<User>(base, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update(id, data: UpdateUserInput) {
      return apiFetch<User>(`${base}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    async delete(id) {
      await apiFetch<void>(`${base}/${id}`, { method: 'DELETE' })
    },
  }
}
