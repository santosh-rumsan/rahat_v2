import * as React from 'react'
import { Search, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@rs/ui'
import type { Vendor } from '@rahataid/sdk'
import { useVendors, useDeleteVendor } from './queries.js'

// ─── constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<Vendor['status'], string> = {
  Active: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Inactive: 'bg-gray-100 text-gray-500',
}

// ─── component ───────────────────────────────────────────────────────────────

export interface VendorListProps {
  onAdd?: () => void
  onEdit?: (vendor: Vendor) => void
  onRowClick?: (vendor: Vendor) => void
}

export function VendorList({ onAdd, onEdit, onRowClick }: VendorListProps) {
  const { data: vendors = [] as Vendor[], isLoading } = useVendors()
  const deleteMutation = useDeleteVendor()
  const [search, setSearch] = React.useState('')
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    if (menuOpenId) document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [menuOpenId])

  const filtered = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(search.toLowerCase())
  )

  function handleDelete(id: string) {
    deleteMutation.mutate(id, { onSuccess: () => setMenuOpenId(null) })
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-500 mt-1">{vendors.length} registered vendors</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={16} />
          Add Vendor
        </button>
      </div>

      <div className="px-8 pt-5">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors…"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.currentTarget.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 px-8 py-5">
        <div className="bg-gray-50 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                <th className="px-5 py-3 font-medium">Vendor</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => onRowClick?.(v)}
                  className={cn('transition-colors', onRowClick ? 'hover:bg-white/70 cursor-pointer' : 'hover:bg-white/70')}
                >
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{v.name}</p>
                      <p className="text-xs text-gray-400">{v.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{v.type}</td>
                  <td className="px-5 py-3 text-gray-600">{v.contactPerson}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{v.phone}</td>
                  <td className="px-5 py-3">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[v.status])}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="relative" ref={menuOpenId === v.id ? menuRef : undefined}>
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === v.id ? null : v.id)}
                        className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                      {menuOpenId === v.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
                          <button
                            onClick={() => { onEdit?.(v); setMenuOpenId(null) }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                    {search ? `No vendors found matching "${search}"` : 'No vendors yet. Add one to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
