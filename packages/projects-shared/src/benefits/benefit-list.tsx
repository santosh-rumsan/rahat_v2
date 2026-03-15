import * as React from 'react'
import { Plus, Trash2, Pencil, Package, Banknote, Droplets, Box, Briefcase, CheckCircle2, XCircle, Users } from 'lucide-react'
import { cn } from '@rs/ui'
import type { Benefit, BenefitType } from './types.js'

// ─── mock data ───────────────────────────────────────────────────────────────

const SEED_BENEFITS: Benefit[] = [
  { id: 'b1', name: 'Cash Transfer', type: 'Cash', description: 'Monthly cash assistance in local currency', unit: 'NPR', valuePerUnit: 5000, isActive: true, createdAt: '2026-02-10' },
  { id: 'b2', name: 'Food Package', type: 'Food', description: 'Monthly rice and lentil package per household', unit: 'KG', valuePerUnit: 25, isActive: true, createdAt: '2026-02-10' },
  { id: 'b3', name: 'Hygiene Kit', type: 'WASH', description: 'Basic hygiene supplies including soap and sanitary items', unit: 'Kit', valuePerUnit: 1, isActive: true, createdAt: '2026-02-12' },
  { id: 'b4', name: 'Non-Food Items', type: 'NFI', description: 'Blankets, cooking utensils and shelter materials', unit: 'Set', valuePerUnit: 1, isActive: false, createdAt: '2026-02-15' },
]

// ─── helpers ─────────────────────────────────────────────────────────────────

const TYPE_META: Record<BenefitType, { icon: React.ReactNode; color: string; bg: string }> = {
  Cash:    { icon: <Banknote size={16} />,   color: 'text-green-600',  bg: 'bg-green-100' },
  Food:    { icon: <Package size={16} />,    color: 'text-orange-500', bg: 'bg-orange-100' },
  WASH:    { icon: <Droplets size={16} />,   color: 'text-blue-500',   bg: 'bg-blue-100' },
  NFI:     { icon: <Box size={16} />,        color: 'text-purple-500', bg: 'bg-purple-100' },
  Service: { icon: <Briefcase size={16} />,  color: 'text-rose-500',   bg: 'bg-rose-100' },
}

function benefitStorageKey(projectId: string) {
  return `rahat-benefits:${projectId}`
}

function loadBenefits(projectId: string): Benefit[] {
  if (typeof window === 'undefined') return SEED_BENEFITS
  try {
    const raw = window.localStorage.getItem(benefitStorageKey(projectId))
    if (raw) return JSON.parse(raw) as Benefit[]
  } catch {}
  return SEED_BENEFITS
}

function saveBenefits(projectId: string, benefits: Benefit[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(benefitStorageKey(projectId), JSON.stringify(benefits))
  } catch {}
}

export { benefitStorageKey, loadBenefits, saveBenefits }

// ─── component ───────────────────────────────────────────────────────────────

export interface BenefitListProps {
  projectId?: string
  initialBenefitId?: string
  onBenefitSelect?: (benefitId: string | undefined) => void
  onAssign?: (benefitId: string) => void
  onAdd?: () => void
  onEdit?: (benefitId: string) => void
}

export function BenefitList({ projectId = 'default', initialBenefitId, onBenefitSelect, onAssign, onAdd, onEdit }: BenefitListProps) {
  const [benefits, setBenefits] = React.useState<Benefit[]>([])

  React.useEffect(() => {
    setBenefits(loadBenefits(projectId))
  }, [projectId])

  const selected = initialBenefitId ? benefits.find((b) => b.id === initialBenefitId) : undefined

  const persist = (next: Benefit[]) => {
    setBenefits(next)
    saveBenefits(projectId, next)
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    persist(benefits.filter((b) => b.id !== id))
    if (initialBenefitId === id) onBenefitSelect?.(undefined)
  }

  function handleToggleActive(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    persist(benefits.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)))
  }

  // ── detail view ──────────────────────────────────────────────────────────
  if (selected) {
    const meta = TYPE_META[selected.type]
    return (
      <div className="flex-1 bg-white overflow-y-auto">
        <div className="px-8 pt-7 pb-5 border-b border-gray-100">
          <button
            onClick={() => onBenefitSelect?.(undefined)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            ← All Benefits
          </button>
          <div className="flex items-start gap-5">
            <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0', meta.bg)}>
              <span className={meta.color}>{meta.icon}</span>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#1a1a1a]">{selected.name}</h1>
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold', meta.bg, meta.color)}>
                  {selected.type}
                </span>
                {selected.isActive
                  ? <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">Active</span>
                  : <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">Inactive</span>
                }
              </div>
              {selected.description && (
                <p className="text-sm text-gray-400 mt-1">{selected.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1.5">
                {selected.valuePerUnit} {selected.unit} per token · Added {selected.createdAt}
              </p>
            </div>
          </div>
        </div>
        <div className="px-8 py-8 text-sm text-gray-400 text-center">
          Token assignments for this benefit will appear here.
        </div>
      </div>
    )
  }

  // ── list view ────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 bg-white overflow-y-auto">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1a1a1a]">Benefits</h1>
          <p className="text-sm text-gray-400 mt-1">{benefits.length} benefit{benefits.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#333] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={14} />
          New Benefit
        </button>
      </div>

      {/* Cards */}
      <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {benefits.map((b) => {
          const meta = TYPE_META[b.type]
          return (
            <div
              key={b.id}
              role="button"
              tabIndex={0}
              onClick={() => onBenefitSelect?.(b.id)}
              onKeyDown={(e) => e.key === 'Enter' && onBenefitSelect?.(b.id)}
              className="text-left p-5 rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', meta.bg)}>
                  <span className={meta.color}>{meta.icon}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  {onEdit && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(b.id) }}
                      className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-all"
                      title="Edit"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleToggleActive(b.id, e)}
                    className="p-1.5 text-gray-400 hover:text-green-500 rounded-lg hover:bg-green-50 transition-all"
                    title={b.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {b.isActive ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                  </button>
                  <button
                    onClick={(e) => handleDelete(b.id, e)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-[#1a1a1a]">{b.name}</h3>
                {!b.isActive && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium">
                    Inactive
                  </span>
                )}
              </div>
              {b.description && (
                <p className="text-xs text-gray-400 mb-2 line-clamp-2">{b.description}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-semibold', meta.bg, meta.color)}>
                    {b.type}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {b.valuePerUnit} {b.unit} / token
                  </span>
                </div>
                {onAssign && b.isActive && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onAssign(b.id) }}
                    className="flex items-center gap-1 text-[10px] font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Assign to beneficiaries"
                  >
                    <Users size={10} />
                    Assign
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {benefits.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Package size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No benefits defined yet</p>
            <p className="text-xs text-gray-400 mt-1">Add cash, commodity, or service benefits to assign as tokens</p>
          </div>
        )}
      </div>
    </div>
  )
}
