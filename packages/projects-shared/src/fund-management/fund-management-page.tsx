import * as React from 'react'
import { Coins, ArrowDownLeft, ArrowUpRight, Lock, Ban } from 'lucide-react'
import { cn } from '@rs/ui'
import { TREASURY_TOKENS } from '@rahataid/sdk'
import type { TreasuryToken } from '@rahataid/sdk'
import { useProject } from '../project/queries.js'
import {
  useProjectFundAllocations,
  useProjectFundLogs,
  computeProjectFundData,
  deriveTokenActivities,
  isTreasuryToken,
} from './queries.js'
import type { ProjectTokenBalance, ProjectActivity, ActivityKind } from './queries.js'

// ─── constants ────────────────────────────────────────────────────────────────

const TOKEN_META: Record<TreasuryToken, { label: string; color: string; bg: string; bar: string }> = {
  cUSD: { label: 'US Dollar',      color: 'text-green-700',  bg: 'bg-green-50',  bar: 'bg-green-500' },
  cEUR: { label: 'Euro',           color: 'text-blue-700',   bg: 'bg-blue-50',   bar: 'bg-blue-500' },
  cNPR: { label: 'Nepali Rupee',   color: 'text-orange-700', bg: 'bg-orange-50', bar: 'bg-orange-500' },
}

const ACTIVITY_META: Record<ActivityKind, { label: string; chipCls: string; icon: React.ReactNode; sign: '+' | '-' | '' }> = {
  received:  { label: 'Received',  chipCls: 'bg-green-50 text-green-700',  icon: <ArrowDownLeft size={11} />, sign: '+' },
  reserved:  { label: 'Reserved',  chipCls: 'bg-blue-50 text-blue-700',    icon: <Lock size={11} />,          sign: '-' },
  disbursed: { label: 'Disbursed', chipCls: 'bg-red-50 text-red-600',      icon: <ArrowUpRight size={11} />,  sign: '-' },
  voided:    { label: 'Voided',    chipCls: 'bg-gray-100 text-gray-500',   icon: <Ban size={11} />,           sign: ''  },
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── sub-components ──────────────────────────────────────────────────────────

function PrimaryTokenCard({ balance, isPrimary }: { balance: ProjectTokenBalance; isPrimary: boolean }) {
  const meta = TOKEN_META[balance.token]
  const totalUsed = balance.reserved + balance.disbursed
  const pctUsed = balance.received > 0 ? Math.round((totalUsed / balance.received) * 100) : 0
  const pctDisbursed = balance.received > 0 ? Math.round((balance.disbursed / balance.received) * 100) : 0
  const pctReserved = pctUsed - pctDisbursed

  return (
    <div className={cn('rounded-2xl border p-6', meta.bg, 'border-gray-200')}>
      <div className="flex items-start justify-between mb-5">
        <div>
          {isPrimary && (
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Primary Token</p>
          )}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <Coins size={20} className={meta.color} />
            </div>
            <div>
              <h2 className={cn('text-2xl font-black', meta.color)}>{balance.token}</h2>
              <p className="text-xs text-gray-500">{meta.label}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-0.5">Available</p>
          <p className={cn('text-3xl font-black', meta.color)}>{fmt(balance.available)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl p-3">
          <p className="text-[11px] text-gray-400 mb-0.5">Received</p>
          <p className="text-base font-bold text-gray-800">{fmt(balance.received)}</p>
        </div>
        <div className="bg-white rounded-xl p-3">
          <p className="text-[11px] text-gray-400 mb-0.5">Reserved</p>
          <p className="text-base font-bold text-blue-600">{fmt(balance.reserved)}</p>
        </div>
        <div className="bg-white rounded-xl p-3">
          <p className="text-[11px] text-gray-400 mb-0.5">Disbursed</p>
          <p className="text-base font-bold text-red-500">{fmt(balance.disbursed)}</p>
        </div>
      </div>

      {/* Stacked progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Utilization</span>
          <span>{pctUsed}%</span>
        </div>
        <div className="h-2 bg-white rounded-full overflow-hidden flex">
          {/* disbursed portion */}
          <div
            className="h-full bg-red-400 transition-all"
            style={{ width: `${pctDisbursed}%` }}
          />
          {/* reserved portion */}
          <div
            className="h-full bg-blue-400 transition-all"
            style={{ width: `${pctReserved}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-1.5 text-[11px] text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Disbursed</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Reserved</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200 inline-block" />Available</span>
        </div>
      </div>
    </div>
  )
}

function TokenBalanceRow({ balance }: { balance: ProjectTokenBalance }) {
  const meta = TOKEN_META[balance.token]
  const pct = balance.received > 0
    ? Math.min(Math.round(((balance.reserved + balance.disbursed) / balance.received) * 100), 100)
    : 0

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', meta.bg)}>
        <Coins size={14} className={meta.color} />
      </div>
      <div className="w-16">
        <p className="text-xs font-bold text-gray-900">{balance.token}</p>
        <p className="text-[11px] text-gray-400">{meta.label}</p>
      </div>
      <div className="flex-1">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
          <div className="h-full bg-red-400" style={{ width: `${Math.min(Math.round((balance.disbursed / balance.received) * 100), 100)}%` }} />
          <div className="h-full bg-blue-400" style={{ width: `${Math.min(Math.round((balance.reserved / balance.received) * 100), 100)}%` }} />
        </div>
      </div>
      <div className="text-right min-w-0">
        <p className={cn('text-sm font-bold', meta.color)}>{fmt(balance.available)}</p>
        <p className="text-[11px] text-gray-400">of {fmt(balance.received)} received</p>
      </div>
    </div>
  )
}

function ActivitiesTable({ activities }: { activities: ProjectActivity[] }) {
  const sorted = [...activities].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">Token Activities</h3>
        <p className="text-xs text-gray-400 mt-0.5">{sorted.length} transaction{sorted.length !== 1 ? 's' : ''}</p>
      </div>

      {sorted.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">
          No activities yet. Allocate funds from the treasury to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Token</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((a) => {
                const am = ACTIVITY_META[a.kind]
                const tm = a.token ? TOKEN_META[a.token] : null
                return (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-gray-400 whitespace-nowrap">{fmtDate(a.date)}</td>
                    <td className="px-6 py-3.5">
                      <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', am.chipCls)}>
                        {am.icon}
                        {am.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      {tm ? (
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', tm.bg, tm.color)}>
                          {a.token}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono font-semibold text-xs">
                      <span className={a.kind === 'received' ? 'text-green-600' : a.kind === 'voided' ? 'text-gray-400' : 'text-red-500'}>
                        {am.sign}{fmt(a.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-gray-500">{a.label}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export interface FundManagementPageProps {
  projectId: string
}

export function FundManagementPage({ projectId }: FundManagementPageProps) {
  const { data: project } = useProject(projectId)
  const { data: allocations = [], isLoading: loadingAlloc } = useProjectFundAllocations(projectId)
  const { data: logs = [], isLoading: loadingLogs } = useProjectFundLogs(projectId)

  // Re-read localStorage-derived data on every render (benefits + tokens are mutated in place)
  const [localKey, setLocalKey] = React.useState(0)
  React.useEffect(() => {
    // Re-derive whenever projectId changes
    setLocalKey((k) => k + 1)
  }, [projectId])

  const { balances, serverActivities } = React.useMemo(
    () => computeProjectFundData(projectId, allocations, logs, project?.primaryToken),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectId, allocations, logs, localKey, project?.primaryToken],
  )

  const localActivities = React.useMemo(
    () => deriveTokenActivities(projectId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectId, localKey],
  )

  const allActivities = [...serverActivities, ...localActivities]

  // Primary token = project.primaryToken if set (always present in balances), else highest received
  const primaryBalance = React.useMemo(() => {
    if (balances.length === 0) return null
    const pt = project?.primaryToken
    if (pt && isTreasuryToken(pt)) {
      return balances.find((b) => b.token === pt) ?? null
    }
    return balances.reduce<ProjectTokenBalance>((best, b) => b.received > best.received ? b : best, balances[0]!)
  }, [balances, project?.primaryToken])

  const otherBalances = primaryBalance
    ? balances.filter((b) => b.token !== primaryBalance.token)
    : balances

  const isLoading = loadingAlloc || loadingLogs

  const totalReceived = balances.reduce((s, b) => s + b.received, 0)
  const totalAvailable = balances.reduce((s, b) => s + b.available, 0)

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1a1a1a]">Fund Management</h1>
          <p className="text-sm text-gray-400 mt-1">
            {isLoading
              ? 'Loading…'
              : balances.length === 0
                ? 'No funds allocated to this project yet'
                : totalReceived === 0 && project?.primaryToken
                  ? `Primary token: ${project.primaryToken} · No funds allocated yet`
                  : `${balances.length} token${balances.length !== 1 ? 's' : ''} · ${fmt(totalAvailable)} available of ${fmt(totalReceived)} received`}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-sm text-gray-400">Loading fund data…</div>
      ) : balances.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center px-8">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Coins size={24} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">No funds allocated yet</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            Allocate funds from the treasury to this project to track balances and activities.
          </p>
        </div>
      ) : (
        <div className="px-8 py-6 space-y-6">
          {/* Primary token card + other balances */}
          {primaryBalance && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <PrimaryTokenCard balance={primaryBalance} isPrimary={!!project?.primaryToken} />
              </div>
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">All Tokens</h2>
                {balances.map((b) => (
                  <TokenBalanceRow key={b.token} balance={b} />
                ))}
              </div>
            </div>
          )}

          {/* Activities table */}
          <ActivitiesTable activities={allActivities} />
        </div>
      )}
    </div>
  )
}
