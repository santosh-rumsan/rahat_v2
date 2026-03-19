import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowDownLeft, ArrowUpRight, Plus, Send, Trash2 } from 'lucide-react'
import * as React from 'react'
import { TREASURY_TOKENS } from '@rahataid/sdk'
import { useProjects } from '@rahataid/projects-shared/project'
import { useAllocationLogs, useDeleteAllocation, useDeleteFund, useFundAllocations, useFunds } from '../lib/fund/queries.js'
import type { TreasuryToken } from '@rahataid/sdk'

export const Route = createFileRoute('/_app/funds/')({ component: FundManagementPage })

function fmtAmount(n: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Math.abs(n))
}

function fmtToken(amount: number, token: TreasuryToken) {
  return `${fmtAmount(amount)} ${token}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const TOKEN_COLORS: Record<TreasuryToken, { bg: string; text: string; bar: string }> = {
  cUSD: { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-400' },
  cEUR: { bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-400' },
  cNPR: { bg: 'bg-purple-50', text: 'text-purple-600', bar: 'bg-purple-400' },
}

const FALLBACK_TOKEN_COLORS = { bg: 'bg-gray-100', text: 'text-gray-600', bar: 'bg-gray-400' } as const

function isTreasuryToken(token: string): token is TreasuryToken {
  return TREASURY_TOKENS.includes(token as TreasuryToken)
}

function getTokenColors(token: string) {
  return isTreasuryToken(token) ? TOKEN_COLORS[token] : FALLBACK_TOKEN_COLORS
}

function FundManagementPage() {
  const navigate = useNavigate()
  const { data: funds = [] } = useFunds()
  const { data: allocations = [] } = useFundAllocations()
  const { data: logs = [] } = useAllocationLogs()
  const { data: projects = [] } = useProjects()
  const deleteFund = useDeleteFund()
  const deleteAllocation = useDeleteAllocation()

  // Per-token balances
  const tokenBalances = React.useMemo(() => {
    const deposited: Record<TreasuryToken, number> = { cUSD: 0, cEUR: 0, cNPR: 0 }
    const allocated: Record<TreasuryToken, number> = { cUSD: 0, cEUR: 0, cNPR: 0 }
    for (const f of funds) {
      if (isTreasuryToken(f.token)) deposited[f.token] += f.amount
    }
    for (const a of allocations) {
      if (isTreasuryToken(a.token)) allocated[a.token] += a.amount
    }
    return TREASURY_TOKENS.map((token) => ({
      token,
      deposited: deposited[token],
      allocated: allocated[token],
      available: deposited[token] - allocated[token],
    }))
  }, [funds, allocations])

  // Build allocation rows with project names
  const allocationRows = allocations.map((a) => {
    const project = projects.find((p) => p.id === a.projectId)
    return { ...a, projectName: project?.name ?? a.projectId }
  })

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1a1a1a]">Fund Management</h1>
          <p className="text-sm text-gray-400 mt-1">Manage treasury funds and allocate to projects.</p>
        </div>
        <button
          onClick={() => navigate({ to: '/funds/allocate' })}
          className="flex items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#333] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={14} />
          Allocate Funds
        </button>
      </div>

      <div className="flex-1 px-8 py-6 space-y-6">
        {/* Token balances */}
        <div className="grid grid-cols-3 gap-4">
          {tokenBalances.map(({ token, deposited, allocated, available }) => {
            const colors = getTokenColors(token)
            const pctAllocated = deposited > 0 ? Math.min((allocated / deposited) * 100, 100) : 0
            return (
              <div key={token} className="bg-gray-50 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">{token}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                    token
                  </span>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{fmtAmount(deposited)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">total deposited</p>
                </div>
                {/* Allocation bar */}
                <div className="space-y-1.5">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${colors.bar}`}
                      style={{ width: `${pctAllocated}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Send size={10} />
                      {fmtAmount(allocated)} allocated
                    </span>
                    <span className={`font-medium ${colors.text}`}>
                      {fmtAmount(available)} avail.
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Allocations table */}
          <div className="col-span-3 bg-gray-50 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Project Allocations</h2>
            {allocationRows.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">
                No allocations yet.{' '}
                <button
                  onClick={() => navigate({ to: '/funds/allocate' })}
                  className="text-orange-500 hover:underline"
                >
                  Allocate funds
                </button>
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                    <th className="pb-2 font-medium">Project</th>
                    <th className="pb-2 font-medium">Token</th>
                    <th className="pb-2 font-medium text-right">Amount</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allocationRows.map((a) => {
                    const colors = getTokenColors(a.token)
                    return (
                      <tr key={a.id} className="hover:bg-white/60 transition-colors group">
                        <td className="py-2.5 font-medium text-gray-800 text-xs">{a.projectName}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                            {a.token}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-gray-600 text-xs font-semibold">
                          {fmtToken(a.amount, a.token)}
                        </td>
                        <td className="py-2.5 text-gray-400 text-xs">{fmtDate(a.allocatedAt)}</td>
                        <td className="py-2.5">
                          <button
                            onClick={() => {
                              if (confirm('Remove this allocation?')) deleteAllocation.mutate(a.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Logs */}
          <div className="col-span-2 bg-gray-50 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Activity Log</h2>
            {logs.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No activity yet.</p>
            ) : (
              <div className="space-y-3">
                {logs.slice(0, 10).map((l) => (
                  <div key={l.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        l.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'
                      }`}
                    >
                      {l.type === 'deposit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{l.label}</p>
                      <p className="text-xs text-gray-400">{fmtDate(l.createdAt)}</p>
                    </div>
                    <p
                      className={`text-xs font-semibold flex-shrink-0 ${
                        l.type === 'deposit' ? 'text-green-600' : 'text-gray-700'
                      }`}
                    >
                      {l.type === 'deposit' ? '+' : '-'}{fmtToken(l.amount, l.token)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fund sources */}
        <div className="bg-gray-50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Fund Sources</h2>
            <button
              onClick={() => navigate({ to: '/funds/allocate' })}
              className="text-xs text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus size={12} />
              Add deposit
            </button>
          </div>
          {funds.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No fund deposits recorded.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Source</th>
                  <th className="pb-2 font-medium">Token</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {funds.map((f) => {
                  const colors = getTokenColors(f.token)
                  return (
                    <tr key={f.id} className="hover:bg-white/60 transition-colors group">
                      <td className="py-2.5 font-medium text-gray-800 text-xs">{f.name}</td>
                      <td className="py-2.5 text-gray-500 text-xs">{f.source}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                          {f.token}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-gray-800 text-xs font-semibold">
                        {fmtToken(f.amount, f.token)}
                      </td>
                      <td className="py-2.5 text-gray-400 text-xs">{f.date}</td>
                      <td className="py-2.5">
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${f.name}"?`)) deleteFund.mutate(f.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
