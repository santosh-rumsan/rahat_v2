import * as React from 'react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@rs/ui'
import type { User } from '@rahataid/sdk'
import { useCreateUser, useUpdateUser } from './queries.js'

// ─── constants ────────────────────────────────────────────────────────────────

const ROLES: User['role'][] = ['Admin', 'Manager', 'Field', 'Finance', 'Viewer']
const STATUSES: User['status'][] = ['Active', 'Inactive']

// ─── component ───────────────────────────────────────────────────────────────

export interface UserFormProps {
  user?: User
  onSave: (user: User) => void
  onCancel: () => void
}

interface FormState {
  name: string
  email: string
  phone: string
  role: User['role']
  status: User['status']
  avatar: string
  notes: string
}

function toForm(u: User): FormState {
  return {
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    avatar: u.avatar ?? '',
    notes: u.notes ?? '',
  }
}

const emptyForm: FormState = {
  name: '',
  email: '',
  phone: '',
  role: 'Field',
  status: 'Active',
  avatar: '',
  notes: '',
}

export function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const [form, setForm] = React.useState<FormState>(() => (user ? toForm(user) : emptyForm))
  const isEditing = !!user
  const isValid = form.name.trim() && form.email.trim() && form.role

  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const isPending = createMutation.isPending || updateMutation.isPending

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!isValid) return

    const data = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      status: form.status,
      avatar: form.avatar.trim() || undefined,
      notes: form.notes.trim() || undefined,
    }

    if (isEditing && user) {
      updateMutation.mutate(
        { id: user.id, data },
        { onSuccess: (saved: User) => onSave(saved) },
      )
    } else {
      createMutation.mutate(data, { onSuccess: (saved: User) => onSave(saved) })
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
          Back to Users
        </button>
        <h1 className="text-2xl font-black text-[#1a1a1a]">
          {isEditing ? 'Edit User' : 'Add User'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {isEditing ? `Editing ${user.name}` : 'Add a new user to the system'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-8 py-8 max-w-2xl space-y-6">
        {/* Name + Email */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Full name *</label>
            <input
              type="text"
              placeholder="e.g. Anita Sharma"
              value={form.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('name', e.currentTarget.value)}
              autoFocus
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email *</label>
            <input
              type="email"
              placeholder="e.g. anita@rahat.io"
              value={form.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('email', e.currentTarget.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone</label>
          <input
            type="text"
            placeholder="e.g. +977-980-000-0001"
            value={form.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('phone', e.currentTarget.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        {/* Role */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Role *</label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setField('role', r)}
                className={cn(
                  'px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                  form.role === r
                    ? 'border-orange-400 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Status *</label>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setField('status', s)}
                className={cn(
                  'px-6 py-2.5 rounded-xl border text-sm font-medium transition-all',
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

        {/* Avatar URL */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Avatar URL</label>
          <input
            type="url"
            placeholder="https://…"
            value={form.avatar}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('avatar', e.currentTarget.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Notes</label>
          <textarea
            placeholder="Optional notes about this user…"
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
            {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Add user'}
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
