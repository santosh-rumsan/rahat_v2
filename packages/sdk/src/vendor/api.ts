import type { Vendor, CreateVendorInput, UpdateVendorInput } from '../types/vendor.js'
import type { VendorService } from './service.js'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

export function createApiVendorService(baseUrl: string): VendorService {
  const base = `${baseUrl}/vendors`

  return {
    list() {
      return apiFetch<Vendor[]>(base)
    },

    get(id) {
      return apiFetch<Vendor>(`${base}/${id}`)
    },

    create(data: CreateVendorInput) {
      return apiFetch<Vendor>(base, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update(id, data: UpdateVendorInput) {
      return apiFetch<Vendor>(`${base}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    async delete(id) {
      await apiFetch<void>(`${base}/${id}`, { method: 'DELETE' })
    },
  }
}
