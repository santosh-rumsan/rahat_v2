import * as React from 'react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@rs/ui'
import type { Beneficiary } from './types.js'
import { useCreateBeneficiary, useUpdateBeneficiary } from './queries.js'

// ─── constants ────────────────────────────────────────────────────────────────

const STATUSES: Beneficiary['status'][] = ['Verified', 'Pending', 'Inactive']
const GENDERS: Beneficiary['gender'][] = ['Male', 'Female', 'Other']

// ─── component ───────────────────────────────────────────────────────────────

export interface BeneficiaryFormProps {
  projectId: string
  /** Pass to edit an existing beneficiary; omit for create */
  beneficiary?: Beneficiary
  onSave: (beneficiary: Beneficiary) => void
  onCancel: () => void
}

interface FormState {
  name: string
  age: string
  gender: Beneficiary['gender']
  location: string
  phone: string
  status: Beneficiary['status']
  householdSize: string
  notes: string
}

function toForm(b: Beneficiary): FormState {
  return {
    name: b.name,
    age: String(b.age),
    gender: b.gender,
    location: b.location,
    phone: b.phone ?? '',
    status: b.status,
    householdSize: b.householdSize != null ? String(b.householdSize) : '',
    notes: b.notes ?? '',
  }
}

const emptyForm: FormState = {
  name: '',
  age: '',
  gender: 'Female',
  location: '',
  phone: '',
  status: 'Pending',
  householdSize: '',
  notes: '',
}

export function BeneficiaryForm({ projectId, beneficiary, onSave, onCancel }: BeneficiaryFormProps) {
  const [form, setForm] = React.useState<FormState>(() => (beneficiary ? toForm(beneficiary) : emptyForm))
  const isEditing = !!beneficiary
  const isValid = form.name.trim() && form.age && form.location.trim()

  const createMutation = useCreateBeneficiary(projectId)
  const updateMutation = useUpdateBeneficiary(projectId)
  const isPending = createMutation.isPending || updateMutation.isPending

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!isValid) return

    const data = {
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      location: form.location.trim(),
      phone: form.phone.trim() || undefined,
      status: form.status,
      householdSize: form.householdSize ? Number(form.householdSize) : undefined,
      notes: form.notes.trim() || undefined,
    }

    if (isEditing && beneficiary) {
      updateMutation.mutate(
        { id: beneficiary.id, data },
        { onSuccess: (saved: Beneficiary) => onSave(saved) },
      )
    } else {
      createMutation.mutate(data, { onSuccess: (saved: Beneficiary) => onSave(saved) })
    }
  }

  return (
    <div className="h-full bg-white overflow-y-auto">
      {/* Page header */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Beneficiaries
        </button>
        <h1 className="text-2xl font-black text-[#1a1a1a]">
          {isEditing ? 'Edit Beneficiary' : 'Add Beneficiary'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {isEditing ? `Editing ${beneficiary.name}` : 'Register a new beneficiary for this project'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-8 py-8 max-w-2xl space-y-6">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Full name *</label>
          <input
            type="text"
            placeholder="e.g. Gita Sharma"
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('name', e.currentTarget.value)}
            autoFocus
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        {/* Age + Gender */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Age *</label>
            <input
              type="number"
              placeholder="e.g. 34"
              min={0}
              max={120}
              value={form.age}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('age', e.currentTarget.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Gender *</label>
            <div className="grid grid-cols-3 gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setField('gender', g)}
                  className={cn(
                    'py-2.5 rounded-xl border text-sm font-medium transition-all',
                    form.gender === g
                      ? 'border-orange-400 bg-orange-50 text-orange-600'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Location *</label>
          <input
            type="text"
            placeholder="e.g. Ward 5, Kathmandu"
            value={form.location}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('location', e.currentTarget.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        {/* Phone + Household size */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone</label>
            <input
              type="text"
              placeholder="e.g. 9841234567"
              value={form.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('phone', e.currentTarget.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Household size</label>
            <input
              type="number"
              placeholder="e.g. 4"
              min={1}
              value={form.householdSize}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('householdSize', e.currentTarget.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Status *</label>
          <div className="grid grid-cols-3 gap-2 max-w-xs">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setField('status', s)}
                className={cn(
                  'py-2.5 rounded-xl border text-sm font-medium transition-all',
                  form.status === s
                    ? 'border-orange-400 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Notes</label>
          <textarea
            placeholder="Optional notes about this beneficiary…"
            value={form.notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setField('notes', e.currentTarget.value)}
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!isValid || isPending}
            className="px-6 py-2.5 text-sm font-semibold bg-[#1a1a1a] text-white rounded-xl hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Add beneficiary'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
