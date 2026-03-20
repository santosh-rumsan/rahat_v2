import * as React from 'react'
import { Search, Ticket, CheckCircle2, Clock, XCircle, Ban, ChevronDown, Plus, X } from 'lucide-react'
import { cn } from '@rs/ui'
import { idbBenefitService, idbTokenService } from '@rahataid/sdk'
import type { Benefit, Token, TokenStatus } from './types.js'
import type { Beneficiary } from '../beneficiary/types.js'

export function loadTokens(projectId: string): Promise<Token[]> {
  return idbTokenService.list(projectId)
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const STATUS_META: Record<TokenStatus, { label: string; icon: React.ReactNode; chip: string }> = {
  Issued:   { label: 'Issued',   icon: <Clock size={12} />,        chip: 'bg-blue-100 text-blue-700' },
  Redeemed: { label: 'Redeemed', icon: <CheckCircle2 size={12} />, chip: 'bg-green-100 text-green-700' },
  Expired:  { label: 'Expired',  icon: <XCircle size={12} />,      chip: 'bg-yellow-100 text-yellow-700' },
  Voided:   { label: 'Voided',   icon: <Ban size={12} />,          chip: 'bg-red-100 text-red-600' },
}

const BENEFICIARY_STATUS_COLORS: Record<Beneficiary['status'], string> = {
  Verified: 'bg-green-100 text-green-700',
  Pending:  'bg-yellow-100 text-yellow-700',
  Inactive: 'bg-gray-100 text-gray-500',
}

function generateCode(tokens: Token[]): string {
  const max = tokens.reduce((n, t) => {
    const num = parseInt(t.code.replace('TKN-', ''), 10)
    return isNaN(num) ? n : Math.max(n, num)
  }, 0)
  return `TKN-${String(max + 1).padStart(4, '0')}`
}

// ─── component ───────────────────────────────────────────────────────────────

type Tab = 'tokens' | 'assign'

export interface TokenAssignmentProps {
  projectId?: string
  beneficiaries?: Beneficiary[]
}

export function TokenAssignment({
  projectId = 'default',
  beneficiaries = [],
}: TokenAssignmentProps) {
  const [tokens, setTokens] = React.useState<Token[]>([])
  const [benefits, setBenefits] = React.useState<Benefit[]>([])
  const [tab, setTab] = React.useState<Tab>('tokens')

  // filters
  const [search, setSearch] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState<TokenStatus | 'All'>('All')
  const [filterBenefit, setFilterBenefit] = React.useState<string>('All')

  // assign form
  const [selectedBenefitId, setSelectedBenefitId] = React.useState('')
  const [selectedBeneficiaryIds, setSelectedBeneficiaryIds] = React.useState<Set<string>>(new Set())
  const [assignSearch, setAssignSearch] = React.useState('')
  const [customAmount, setCustomAmount] = React.useState('')
  const [showConfirm, setShowConfirm] = React.useState(false)

  React.useEffect(() => {
    loadTokens(projectId).then(setTokens).catch(() => {})
    idbBenefitService.list(projectId).then(setBenefits).catch(() => {})
  }, [projectId])

  // ── derived ──────────────────────────────────────────────────────────────
  const filtered = tokens.filter((t) => {
    const bene = beneficiaries.find((b) => b.id === t.beneficiaryId)
    const nameMatch = bene ? bene.name.toLowerCase().includes(search.toLowerCase()) : false
    const codeMatch = t.code.toLowerCase().includes(search.toLowerCase())
    const statusOk = filterStatus === 'All' || t.status === filterStatus
    const benefitOk = filterBenefit === 'All' || t.benefitId === filterBenefit
    return (nameMatch || codeMatch) && statusOk && benefitOk
  })

  const activeBenefits = benefits.filter((b) => b.isActive)
  const selectedBenefit = benefits.find((b) => b.id === selectedBenefitId)

  const filteredBeneficiaries = beneficiaries.filter(
    (b) =>
      b.status !== 'Inactive' &&
      (b.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
        b.location.toLowerCase().includes(assignSearch.toLowerCase()))
  )

  function toggleBeneficiary(id: string) {
    setSelectedBeneficiaryIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleIssueTokens() {
    if (!selectedBenefit || selectedBeneficiaryIds.size === 0) return
    const amount = customAmount ? Number(customAmount) : selectedBenefit.valuePerUnit
    const today = new Date().toISOString().split('T')[0]!

    const newTokens: Token[] = []
    let running = [...tokens]
    for (const beneficiaryId of selectedBeneficiaryIds) {
      const code = generateCode(running)
      const token = await idbTokenService.create(projectId, {
        code,
        beneficiaryId,
        benefitId: selectedBenefit.id,
        amount,
        status: 'Issued',
        issuedDate: today,
      })
      newTokens.push(token)
      running = [...running, token]
    }

    setTokens((prev) => [...prev, ...newTokens])
    setSelectedBeneficiaryIds(new Set())
    setSelectedBenefitId('')
    setCustomAmount('')
    setAssignSearch('')
    setShowConfirm(false)
    setTab('tokens')
  }

  function handleUpdateStatus(tokenId: string, status: TokenStatus) {
    const update = {
      status,
      redeemedDate: status === 'Redeemed' ? new Date().toISOString().split('T')[0] : undefined,
    }
    setTokens((prev) => prev.map((t) => t.id === tokenId ? { ...t, ...update } : t))
    idbTokenService.update(projectId, tokenId, update).catch(() => {})
  }

  // ── stats ────────────────────────────────────────────────────────────────
  const totalIssued   = tokens.filter((t) => t.status === 'Issued').length
  const totalRedeemed = tokens.filter((t) => t.status === 'Redeemed').length
  const totalExpired  = tokens.filter((t) => t.status === 'Expired').length
  const totalVoided   = tokens.filter((t) => t.status === 'Voided').length

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-black text-[#1a1a1a]">Token Management</h1>
            <p className="text-sm text-gray-400 mt-1">{tokens.length} token{tokens.length !== 1 ? 's' : ''} issued</p>
          </div>
          <button
            onClick={() => setTab('assign')}
            className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={14} />
            Assign Tokens
          </button>
        </div>

        {/* Stat chips */}
        <div className="flex items-center gap-3 flex-wrap">
          {([
            { label: 'Issued',   count: totalIssued,   chip: 'bg-blue-100 text-blue-700' },
            { label: 'Redeemed', count: totalRedeemed, chip: 'bg-green-100 text-green-700' },
            { label: 'Expired',  count: totalExpired,  chip: 'bg-yellow-100 text-yellow-700' },
            { label: 'Voided',   count: totalVoided,   chip: 'bg-red-100 text-red-600' },
          ] as const).map((s) => (
            <div key={s.label} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold', s.chip)}>
              <span className="text-base font-black">{s.count}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 pt-4 flex items-center gap-1 border-b border-gray-100">
        {(['tokens', 'assign'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors',
              tab === t
                ? 'text-[#1a1a1a] border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-gray-700'
            )}
          >
            {t === 'tokens' ? 'All Tokens' : 'Assign Tokens'}
          </button>
        ))}
      </div>

      {/* ── Token list tab ── */}
      {tab === 'tokens' && (
        <div className="px-8 py-6">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or code…"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.currentTarget.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.currentTarget.value as typeof filterStatus)}
                className="appearance-none pl-3 pr-7 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="All">All statuses</option>
                {(Object.keys(STATUS_META) as TokenStatus[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Benefit filter */}
            <div className="relative">
              <select
                value={filterBenefit}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterBenefit(e.currentTarget.value)}
                className="appearance-none pl-3 pr-7 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="All">All benefits</option>
                {benefits.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 font-semibold">
                  <th className="text-left px-4 py-3">Code</th>
                  <th className="text-left px-4 py-3">Beneficiary</th>
                  <th className="text-left px-4 py-3">Benefit</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Issued</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((token) => {
                  const bene    = beneficiaries.find((b) => b.id === token.beneficiaryId)
                  const benefit = benefits.find((b) => b.id === token.benefitId)
                  const sm      = STATUS_META[token.status]
                  return (
                    <tr key={token.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Ticket size={13} className="text-gray-400" />
                          <span className="font-mono text-xs font-semibold text-[#1a1a1a]">{token.code}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {bene ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                              {bene.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#1a1a1a] leading-none">{bene.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{bene.location}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Unknown</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{benefit?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-[#1a1a1a]">
                        {token.amount} {benefit?.unit}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium', sm.chip)}>
                          {sm.icon}
                          {sm.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{token.issuedDate}</td>
                      <td className="px-4 py-3">
                        {token.status === 'Issued' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateStatus(token.id, 'Redeemed')}
                              className="text-[11px] font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2 py-0.5 rounded-lg transition-colors"
                            >
                              Mark redeemed
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(token.id, 'Voided')}
                              className="text-[11px] font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-lg transition-colors"
                            >
                              Void
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Ticket size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">No tokens found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or assign new tokens</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Assign tab ── */}
      {tab === 'assign' && (
        <div className="px-8 py-6 max-w-2xl">
          <h2 className="text-base font-bold text-[#1a1a1a] mb-5">Issue Tokens to Beneficiaries</h2>

          {/* Step 1 – select benefit */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-gray-500 block mb-2">1. Select benefit *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activeBenefits.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setSelectedBenefitId(b.id); setCustomAmount('') }}
                  className={cn(
                    'text-left p-3 rounded-xl border text-xs transition-all',
                    selectedBenefitId === b.id
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <p className="font-semibold text-[#1a1a1a]">{b.name}</p>
                  <p className="text-gray-400 mt-0.5">{b.valuePerUnit} {b.unit} / token</p>
                </button>
              ))}
              {activeBenefits.length === 0 && (
                <p className="col-span-full text-xs text-gray-400">No active benefits. Create benefits first.</p>
              )}
            </div>
          </div>

          {/* Step 2 – optional custom amount */}
          {selectedBenefit && (
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-500 block mb-2">
                2. Token amount <span className="font-normal text-gray-400">(default: {selectedBenefit.valuePerUnit} {selectedBenefit.unit})</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  placeholder={String(selectedBenefit.valuePerUnit)}
                  value={customAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomAmount(e.currentTarget.value)}
                  className="w-40 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                <span className="text-sm text-gray-500">{selectedBenefit.unit}</span>
                {customAmount && (
                  <button onClick={() => setCustomAmount('')} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3 – select beneficiaries */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-gray-500 block mb-2">
              3. Select beneficiaries *
              {selectedBeneficiaryIds.size > 0 && (
                <span className="ml-2 text-orange-500">{selectedBeneficiaryIds.size} selected</span>
              )}
            </label>

            <div className="relative mb-3">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search beneficiaries…"
                value={assignSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssignSearch(e.currentTarget.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto rounded-xl border border-gray-200 p-2">
              {filteredBeneficiaries.map((b) => {
                const checked = selectedBeneficiaryIds.has(b.id)
                return (
                  <label
                    key={b.id}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors',
                      checked ? 'bg-orange-50' : 'hover:bg-gray-50'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleBeneficiary(b.id)}
                      className="accent-orange-500"
                    />
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                      {b.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#1a1a1a]">{b.name}</p>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', BENEFICIARY_STATUS_COLORS[b.status])}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{b.location}</p>
                    </div>
                  </label>
                )
              })}
              {filteredBeneficiaries.length === 0 && (
                <p className="text-xs text-center text-gray-400 py-4">No matching beneficiaries</p>
              )}
            </div>
          </div>

          {/* Issue button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!selectedBenefit || selectedBeneficiaryIds.size === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Ticket size={14} />
              Issue {selectedBeneficiaryIds.size > 0 ? `${selectedBeneficiaryIds.size} ` : ''}token{selectedBeneficiaryIds.size !== 1 ? 's' : ''}
            </button>
            {(selectedBenefit || selectedBeneficiaryIds.size > 0) && (
              <button
                onClick={() => { setSelectedBenefitId(''); setSelectedBeneficiaryIds(new Set()); setCustomAmount('') }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {showConfirm && selectedBenefit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1a1a1a]">Confirm token issuance</h2>
              <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              You are about to issue <span className="font-bold text-[#1a1a1a]">{selectedBeneficiaryIds.size}</span> token{selectedBeneficiaryIds.size !== 1 ? 's' : ''} for&nbsp;
              <span className="font-bold text-[#1a1a1a]">{selectedBenefit.name}</span> ({customAmount || selectedBenefit.valuePerUnit} {selectedBenefit.unit} each).
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { void handleIssueTokens() }}
                className="px-4 py-2 text-sm font-semibold bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors"
              >
                Issue tokens
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
