import * as React from 'react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@rs/ui'
import type { Vendor } from '@rahataid/sdk'
import { useCreateVendor, useUpdateVendor } from './queries.js'

// ─── constants ────────────────────────────────────────────────────────────────

const STATUSES: Vendor['status'][] = ['Active', 'Pending', 'Inactive']

const VENDOR_TYPES = [
  'Food & Groceries',
  'Construction Materials',
  'Healthcare',
  'Agriculture',
  'Logistics',
  'Technology',
  'Clothing & NFI',
  'Education',
  'Finance',
  'Other',
]

// ─── component ───────────────────────────────────────────────────────────────

export interface VendorFormProps {
  vendor?: Vendor
  onSave: (vendor: Vendor) => void
  onCancel: () => void
}

interface FormState {
  name: string
  type: string
  contactPerson: string
  email: string
  phone: string
  status: Vendor['status']
  location: string
  notes: string
}

function toForm(v: Vendor): FormState {
  return {
    name: v.name,
    type: v.type,
    contactPerson: v.contactPerson,
    email: v.email,
    phone: v.phone,
    status: v.status,
    location: v.location ?? '',
    notes: v.notes ?? '',
  }
}

const emptyForm: FormState = {
  name: '',
  type: '',
  contactPerson: '',
  email: '',
  phone: '',
  status: 'Active',
  location: '',
  notes: '',
}

export function VendorForm({ vendor, onSave, onCancel }: VendorFormProps) {
  const [form, setForm] = React.useState<FormState>(() => (vendor ? toForm(vendor) : emptyForm))
  const isEditing = !!vendor
  const isValid = form.name.trim() && form.type.trim() && form.contactPerson.trim() && form.email.trim()

  const createMutation = useCreateVendor()
  const updateMutation = useUpdateVendor()
  const isPending = createMutation.isPending || updateMutation.isPending

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!isValid) return

    const data = {
      name: form.name.trim(),
      type: form.type.trim(),
      contactPerson: form.contactPerson.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      status: form.status,
      location: form.location.trim() || undefined,
      notes: form.notes.trim() || undefined,
    }

    if (isEditing && vendor) {
      updateMutation.mutate(
        { id: vendor.id, data },
        { onSuccess: (saved: Vendor) => onSave(saved) },
      )
    } else {
      createMutation.mutate(data, { onSuccess: (saved: Vendor) => onSave(saved) })
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
          Back to Vendors
        </button>
        <h1 className="text-2xl font-black text-[#1a1a1a]">
          {isEditing ? 'Edit Vendor' : 'Add Vendor'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {isEditing ? `Editing ${vendor.name}` : 'Register a new vendor'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-8 py-8 max-w-2xl space-y-6">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Vendor name *</label>
          <input
            type="text"
            placeholder="e.g. Aasha Suppliers Pvt. Ltd."
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('name', e.currentTarget.value)}
            autoFocus
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        {/* Type */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Business type *</label>
          <select
            value={form.type}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('type', e.currentTarget.value)}
            className={cn(
              'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white',
              !form.type && 'text-gray-400'
            )}
          >
            <option value="" disabled>Select type…</option>
            {VENDOR_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Contact person + Email */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Contact person *</label>
            <input
              type="text"
              placeholder="e.g. Ram Shrestha"
              value={form.contactPerson}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('contactPerson', e.currentTarget.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email *</label>
            <input
              type="email"
              placeholder="e.g. ram@example.com"
              value={form.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('email', e.currentTarget.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Phone + Location */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone</label>
            <input
              type="text"
              placeholder="e.g. +977-1-4234567"
              value={form.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('phone', e.currentTarget.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Location</label>
            <input
              type="text"
              placeholder="e.g. Kathmandu"
              value={form.location}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('location', e.currentTarget.value)}
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
            placeholder="Optional notes about this vendor…"
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
            {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Add vendor'}
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
