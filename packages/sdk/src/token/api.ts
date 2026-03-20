import type { Token, CreateTokenInput, UpdateTokenInput } from '../types/benefit.js'
import type { TokenService } from './service.js'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

export function createApiTokenService(baseUrl: string): TokenService {
  const base = `${baseUrl}/tokens`

  return {
    list(projectId) {
      return apiFetch<Token[]>(`${base}?projectId=${projectId}`)
    },

    get(_projectId, id) {
      return apiFetch<Token>(`${base}/${id}`)
    },

    create(_projectId, data: CreateTokenInput) {
      return apiFetch<Token>(base, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update(_projectId, id, data: UpdateTokenInput) {
      return apiFetch<Token>(`${base}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    async delete(_projectId, id) {
      await apiFetch<void>(`${base}/${id}`, { method: 'DELETE' })
    },
  }
}
