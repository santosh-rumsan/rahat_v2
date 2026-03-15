import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import * as React from 'react'
import { cn } from '@rs/ui'
import { useProjects } from '@rahataid/projects-shared/project'
import { useCreateFund, useCreateAllocation } from '../lib/fund/queries.js'
import type { FundCurrency } from '@rahataid/sdk'

export const Route = createFileRoute('/_app/fund-management/allocate')({ component: AllocatePage })

type Tab = 'deposit' | 'allocate'

const CURRENCIES: FundCurrency[] = ['USD', 'EUR', 'NPR']

// ── Deposit Form ────────────────────────────────────────────────────────────

interface DepositForm {
  name: string
  source: string
  amount: string
  currency: FundCurrency
  date: string
  notes: string
}

const emptyDeposit: DepositForm = {
  name: '',
  source: '',
  amount: '',
  currency: 'USD',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
}

function DepositSection({ onDone }: { onDone: () => void }) {
  const [form, setForm] = React.useState<DepositForm>(emptyDeposit)
  const createFund = useCreateFund()

  const setField = <K extends keyof DepositForm>(k: K, v: DepositForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const isValid = form.name.trim() && form.source.trim() && Number(form.amount) > 0 && form.date

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!isValid) return
    await createFund.mutateAsync({
      name: form.name.trim(),
      source: form.source.trim(),
      amount: Number(form.amount),
      currency: form.currency,
      date: form.date,
      notes: form.notes.trim() || undefined,
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Fund name *</label>
          <input
            type="text"
            placeholder="e.g. UNICEF Q1 2025"
            value={form.name}
            onChange={(e) => setField('name', e.currentTarget.value)}
            autoFocus
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Source / Donor *</label>
          <input
            type="text"
            placeholder="e.g. UNICEF"
            value={form.source}
            onChange={(e) => setField('source', e.currentTarget.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Amount *</label>
          <input
            type="number"
            min="1"
            step="any"
            placeholder="500000"
            value={form.amount}
            onChange={(e) => setField('amount', e.currentTarget.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Currency *</label>
          <div className="flex gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setField('currency', c)}
                className={cn(
                  'px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                  form.currency === c
                    ? 'border-orange-400 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Date *</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setField('date', e.currentTarget.value)}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Notes</label>
        <textarea
          placeholder="Optional notes…"
          value={form.notes}
          onChange={(e) => setField('notes', e.currentTarget.value)}
          rows={3}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={!isValid || createFund.isPending}
          className="px-6 py-2.5 text-sm font-semibold bg-[#1a1a1a] text-white rounded-xl hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {createFund.isPending ? 'Saving…' : 'Record deposit'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Allocation Form ─────────────────────────────────────────────────────────

interface AllocationForm {
  projectId: string
  amount: string
  currency: FundCurrency
  notes: string
}

const emptyAllocation: AllocationForm = {
  projectId: '',
  amount: '',
  currency: 'USD',
  notes: '',
}

function AllocationSection({ onDone }: { onDone: () => void }) {
  const [form, setForm] = React.useState<AllocationForm>(emptyAllocation)
  const { data: projects = [], isLoading } = useProjects()
  const createAllocation = useCreateAllocation()

  const activeProjects = projects.filter((p) => p.status === 'Active')

  const setField = <K extends keyof AllocationForm>(k: K, v: AllocationForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const isValid = form.projectId && Number(form.amount) > 0

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!isValid) return
    await createAllocation.mutateAsync({
      projectId: form.projectId,
      amount: Number(form.amount),
      currency: form.currency,
      notes: form.notes.trim() || undefined,
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Project *</label>
        {isLoading ? (
          <p className="text-sm text-gray-400">Loading projects…</p>
        ) : activeProjects.length === 0 ? (
          <p className="text-sm text-gray-400">No active projects found.</p>
        ) : (
          <select
            value={form.projectId}
            onChange={(e) => setField('projectId', e.currentTarget.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
          >
            <option value="">Select a project…</option>
            {activeProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Amount *</label>
          <input
            type="number"
            min="1"
            step="any"
            placeholder="100000"
            value={form.amount}
            onChange={(e) => setField('amount', e.currentTarget.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Currency *</label>
          <div className="flex gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setField('currency', c)}
                className={cn(
                  'px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                  form.currency === c
                    ? 'border-orange-400 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Notes</label>
        <textarea
          placeholder="Optional notes about this allocation…"
          value={form.notes}
          onChange={(e) => setField('notes', e.currentTarget.value)}
          rows={3}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={!isValid || createAllocation.isPending}
          className="px-6 py-2.5 text-sm font-semibold bg-[#1a1a1a] text-white rounded-xl hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {createAllocation.isPending ? 'Saving…' : 'Allocate funds'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

function AllocatePage() {
  const navigate = useNavigate()
  const [tab, setTab] = React.useState<Tab>('allocate')

  function done() {
    navigate({ to: '/fund-management' })
  }

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="px-8 pt-7 pb-5 border-b border-gray-100">
        <button
          type="button"
          onClick={done}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Fund Management
        </button>
        <h1 className="text-2xl font-black text-[#1a1a1a]">Fund Entry</h1>
        <p className="text-sm text-gray-400 mt-1">Record a treasury deposit or allocate funds to a project.</p>
      </div>

      <div className="px-8 py-8">
        {/* Tab switcher */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
          {([['allocate', 'Allocate to Project'], ['deposit', 'Record Deposit']] as [Tab, string][]).map(
            ([t, label]) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  'px-5 py-2 rounded-lg text-sm font-medium transition-all',
                  tab === t ? 'bg-white shadow-sm text-[#1a1a1a]' : 'text-gray-500 hover:text-gray-700',
                )}
              >
                {label}
              </button>
            ),
          )}
        </div>

        {tab === 'deposit' ? (
          <DepositSection onDone={done} />
        ) : (
          <AllocationSection onDone={done} />
        )}
      </div>
    </div>
  )
}
