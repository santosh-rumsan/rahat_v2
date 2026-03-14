import * as React from 'react'
import {
  Search,
  Plus,
  SlidersHorizontal,
  MapPin,
  Phone,
  Calendar,
  Users,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { cn } from '@rs/ui'
import type { Beneficiary } from './types.js'
import { useBeneficiaries, useDeleteBeneficiary } from './queries.js'

// ─── constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<Beneficiary['status'], string> = {
  Verified: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Inactive: 'bg-gray-100 text-gray-500',
}

// ─── component ───────────────────────────────────────────────────────────────

export interface BeneficiaryListProps {
  projectId?: string
  onAdd?: () => void
  onEdit?: (beneficiary: Beneficiary) => void
}

export function BeneficiaryList({ projectId = 'default', onAdd, onEdit }: BeneficiaryListProps) {
  const { data: beneficiaries = [] as Beneficiary[], isLoading } = useBeneficiaries(projectId)
  const deleteMutation = useDeleteBeneficiary(projectId)
  const [search, setSearch] = React.useState('')
  const [selectedId, setSelectedId] = React.useState<string>('')
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)

  // keep selectedId in sync with loaded data
  React.useEffect(() => {
    if (!selectedId && beneficiaries.length > 0) {
      setSelectedId(beneficiaries[0]!.id)
    }
  }, [beneficiaries, selectedId])

  // close menu on outside click
  React.useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    if (menuOpenId) document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [menuOpenId])

  const filtered = beneficiaries.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.phone ?? '').includes(search) ||
      b.location.toLowerCase().includes(search.toLowerCase())
  )

  const selected = beneficiaries.find((b) => b.id === selectedId) ?? beneficiaries[0]

  function handleDelete(id: string) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        if (selectedId === id) {
          const next = beneficiaries.filter((b) => b.id !== id)
          setSelectedId(next[0]?.id ?? '')
        }
        setMenuOpenId(null)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f0f0f0]">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
      </div>
    )
  }

  return (
    <div className="flex h-full bg-[#f0f0f0] overflow-hidden">
      {/* Left: beneficiary list */}
      <div className="w-[280px] flex-shrink-0 flex flex-col bg-[#f0f0f0]">
        {/* Header */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-[#1a1a1a]">Beneficiaries</h2>
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-white/50">
                <SlidersHorizontal size={15} />
              </button>
              <button
                onClick={onAdd}
                className="flex items-center gap-1 bg-[#1a1a1a] hover:bg-[#333] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
              >
                <Plus size={13} />
                Add
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {beneficiaries.length} total ·{' '}
            {beneficiaries.filter((b) => b.status === 'Verified').length} verified
          </p>

          {/* Search */}
          <div className="relative mt-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search beneficiaries…"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.currentTarget.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
          {filtered.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedId(b.id)}
              className={cn(
                'w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-colors',
                b.id === selectedId ? 'bg-white shadow-sm' : 'hover:bg-white/50'
              )}
            >
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600 flex-shrink-0">
                {b.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1a1a1a] truncate">{b.name}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ml-1',
                      STATUS_COLORS[b.status]
                    )}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{b.location}</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-center text-gray-400 py-8">No beneficiaries found</p>
          )}
        </div>
      </div>

      {/* Right: beneficiary detail */}
      {selected ? (
        <div className="flex-1 bg-white rounded-l-3xl overflow-hidden flex flex-col min-w-0">
          {/* Detail header */}
          <div className="px-8 pt-7 pb-5 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-5">
                <div className="w-24 h-24 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl font-black text-orange-500">
                    {selected.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="pt-1">
                  <h1 className="text-3xl font-black text-[#1a1a1a] leading-tight">{selected.name}</h1>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={cn('text-xs px-2.5 py-1 rounded-full font-semibold', STATUS_COLORS[selected.status])}>
                      {selected.status}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-600">
                      {selected.gender}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-gray-400" />
                      {selected.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit?.(selected)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors"
                >
                  <Pencil size={13} />
                  Edit
                </button>
                <div className="relative" ref={menuOpenId === selected.id ? menuRef : undefined}>
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === selected.id ? null : selected.id)}
                    className="text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {menuOpenId === selected.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
                      <button
                        onClick={() => { onEdit?.(selected); setMenuOpenId(null) }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(selected.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detail body */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-400 mb-1">Enrolled</p>
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-gray-400" />
                  <p className="text-sm font-semibold text-[#1a1a1a]">{selected.enrolledDate}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-400 mb-1">Household size</p>
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-gray-400" />
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    {selected.householdSize ?? '—'} members
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-400 mb-1">Phone</p>
                <div className="flex items-center gap-1.5">
                  <Phone size={13} className="text-gray-400" />
                  <p className="text-sm font-semibold text-[#1a1a1a]">{selected.phone ?? '—'}</p>
                </div>
              </div>
            </div>

            <h3 className="text-base font-bold text-[#1a1a1a] mb-4">Profile details</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              {[
                { label: 'Full name', value: selected.name },
                { label: 'Age', value: String(selected.age) },
                { label: 'Gender', value: selected.gender },
                { label: 'Phone', value: selected.phone ?? '—' },
                { label: 'Location', value: selected.location },
                { label: 'Status', value: selected.status },
              ].map((field) => (
                <div key={field.label}>
                  <p className="text-xs text-gray-400 mb-1">{field.label}</p>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{field.value}</p>
                </div>
              ))}
            </div>

            {selected.notes && (
              <div className="mt-8">
                <h3 className="text-base font-bold text-[#1a1a1a] mb-2">Notes</h3>
                <p className="text-sm text-gray-500">{selected.notes}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-l-3xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Users size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No beneficiaries yet</p>
            <p className="text-xs text-gray-400 mt-1">Add a beneficiary to get started</p>
          </div>
        </div>
      )}
    </div>
  )
}
