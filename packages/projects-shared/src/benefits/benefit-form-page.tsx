import * as React from 'react'
import { ChevronLeft, Banknote, Package, Droplets, Box, Briefcase } from 'lucide-react'
import { cn } from '@rs/ui'
import type { Benefit, BenefitType } from './types.js'
import { loadBenefits, saveBenefits } from './benefit-list.js'

// ─── helpers ─────────────────────────────────────────────────────────────────

const BENEFIT_TYPES: BenefitType[] = ['Cash', 'Food', 'WASH', 'NFI', 'Service']

const TYPE_META: Record<BenefitType, { icon: React.ReactNode; color: string; bg: string }> = {
  Cash:    { icon: <Banknote size={18} />,   color: 'text-green-600',  bg: 'bg-green-100' },
  Food:    { icon: <Package size={18} />,    color: 'text-orange-500', bg: 'bg-orange-100' },
  WASH:    { icon: <Droplets size={18} />,   color: 'text-blue-500',   bg: 'bg-blue-100' },
  NFI:     { icon: <Box size={18} />,        color: 'text-purple-500', bg: 'bg-purple-100' },
  Service: { icon: <Briefcase size={18} />,  color: 'text-rose-500',   bg: 'bg-rose-100' },
}

// ─── types ────────────────────────────────────────────────────────────────────

interface BenefitForm {
  name: string
  type: BenefitType
  description: string
  unit: string
  valuePerUnit: string
}

const emptyForm: BenefitForm = { name: '', type: 'Cash', description: '', unit: '', valuePerUnit: '' }

export interface BenefitFormPageProps {
  projectId: string
  benefitId?: string
  onDone: () => void
  onCancel: () => void
}

// ─── component ───────────────────────────────────────────────────────────────

export function BenefitFormPage({ projectId, benefitId, onDone, onCancel }: BenefitFormPageProps) {
  const isEdit = !!benefitId
  const [benefits, setBenefits] = React.useState<Benefit[]>([])
  const existing = benefitId ? benefits.find((b) => b.id === benefitId) : undefined

  const [form, setForm] = React.useState<BenefitForm>(emptyForm)

  React.useEffect(() => {
    setBenefits(loadBenefits(projectId))
  }, [projectId])

  React.useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        type: existing.type,
        description: existing.description ?? '',
        unit: existing.unit,
        valuePerUnit: String(existing.valuePerUnit),
      })
      return
    }
    setForm(emptyForm)
  }, [existing, benefitId])

  const setField = <K extends keyof BenefitForm>(k: K, v: BenefitForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const canSave = form.name.trim() && form.unit.trim() && form.valuePerUnit

  function handleSave() {
    if (!canSave) return
    if (isEdit && existing) {
      const updated = benefits.map((b) =>
        b.id === existing.id
          ? {
              ...b,
              name: form.name.trim(),
              type: form.type,
              description: form.description.trim() || undefined,
              unit: form.unit.trim(),
              valuePerUnit: Number(form.valuePerUnit),
            }
          : b
      )
      saveBenefits(projectId, updated)
    } else {
      const next: Benefit = {
        id: `b${Date.now()}`,
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim() || undefined,
        unit: form.unit.trim(),
        valuePerUnit: Number(form.valuePerUnit),
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]!,
      }
      saveBenefits(projectId, [...benefits, next])
    }
    onDone()
  }

  const selectedMeta = TYPE_META[form.type]

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-100">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          Back to Benefits
        </button>
        <h1 className="text-2xl font-black text-[#1a1a1a]">
          {isEdit ? 'Edit Benefit' : 'New Benefit'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {isEdit ? 'Update the benefit details below.' : 'Define a new benefit to assign to project beneficiaries.'}
        </p>
      </div>

      {/* Form */}
      <div className="px-8 py-6 max-w-lg space-y-6">
        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Name *</label>
          <input
            type="text"
            placeholder="e.g. Monthly Cash Transfer"
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('name', e.currentTarget.value)}
            autoFocus
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        {/* Type */}
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Type *</label>
          <div className="grid grid-cols-5 gap-2">
            {BENEFIT_TYPES.map((t) => {
              const m = TYPE_META[t]
              const active = form.type === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setField('type', t)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all',
                    active
                      ? 'border-orange-400 bg-orange-50 text-orange-600'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  )}
                >
                  <span className={active ? 'text-orange-500' : m.color}>{m.icon}</span>
                  {t}
                </button>
              )
            })}
          </div>

          {/* Selected type preview */}
          <div className={cn('mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-sm', selectedMeta.bg)}>
            <span className={selectedMeta.color}>{selectedMeta.icon}</span>
            <span className={cn('font-medium', selectedMeta.color)}>{form.type}</span>
            <span className="text-gray-500 text-xs ml-auto">Selected</span>
          </div>
        </div>

        {/* Unit + Value per token */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Unit *</label>
            <input
              type="text"
              placeholder="e.g. NPR, KG, Kit"
              value={form.unit}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('unit', e.currentTarget.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Value per token *</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              min={0}
              value={form.valuePerUnit}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('valuePerUnit', e.currentTarget.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Description</label>
          <textarea
            placeholder="Optional description of this benefit…"
            value={form.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setField('description', e.currentTarget.value)}
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2.5 text-sm font-semibold bg-[#1a1a1a] text-white rounded-xl hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isEdit ? 'Save changes' : 'Create benefit'}
          </button>
        </div>
      </div>
    </div>
  )
}
