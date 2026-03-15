import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowUpRight, ArrowDownLeft, Send, TrendingUp, Plus, Trash2 } from 'lucide-react'
import * as React from 'react'
import { useProjects } from '@rahataid/projects-shared/project'
import { useFunds, useFundAllocations, useAllocationLogs, useDeleteFund, useDeleteAllocation } from '../lib/fund/queries.js'

export const Route = createFileRoute('/_app/fund-management/')({ component: FundManagementPage })

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Math.abs(n))
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function FundManagementPage() {
  const navigate = useNavigate()
  const { data: funds = [] } = useFunds()
  const { data: allocations = [] } = useFundAllocations()
  const { data: logs = [] } = useAllocationLogs()
  const { data: projects = [] } = useProjects()
  const deleteFund = useDeleteFund()
  const deleteAllocation = useDeleteAllocation()

  const totalFunds = funds.reduce((s, f) => s + f.amount, 0)
  const totalAllocated = allocations.reduce((s, a) => s + a.amount, 0)
  const unallocated = totalFunds - totalAllocated

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
          onClick={() => navigate({ to: '/fund-management/allocate' })}
          className="flex items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#333] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={14} />
          Allocate Funds
        </button>
      </div>

      <div className="flex-1 px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Treasury Balance', value: fmt(totalFunds), icon: TrendingUp, color: 'bg-orange-50 text-orange-500' },
            { label: 'Total Allocated', value: fmt(totalAllocated), icon: Send, color: 'bg-blue-50 text-blue-500' },
            { label: 'Unallocated', value: fmt(unallocated), icon: ArrowDownLeft, color: 'bg-green-50 text-green-500' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{s.label}</span>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                  <s.icon size={16} />
                </span>
              </div>
              <p className="text-xl font-semibold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Allocations table */}
          <div className="col-span-3 bg-gray-50 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Project Allocations</h2>
            {allocationRows.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">
                No allocations yet.{' '}
                <button
                  onClick={() => navigate({ to: '/fund-management/allocate' })}
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
                    <th className="pb-2 font-medium text-right">Amount</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allocationRows.map((a) => (
                    <tr key={a.id} className="hover:bg-white/60 transition-colors group">
                      <td className="py-2.5 font-medium text-gray-800 text-xs">{a.projectName}</td>
                      <td className="py-2.5 text-right text-gray-600 text-xs font-semibold">
                        {fmt(a.amount, a.currency)}
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
                  ))}
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
                      {l.type === 'deposit' ? '+' : '-'}{fmt(l.amount, l.currency)}
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
              onClick={() => navigate({ to: '/fund-management/allocate' })}
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
                  <th className="pb-2 font-medium text-right">Amount</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {funds.map((f) => (
                  <tr key={f.id} className="hover:bg-white/60 transition-colors group">
                    <td className="py-2.5 font-medium text-gray-800 text-xs">{f.name}</td>
                    <td className="py-2.5 text-gray-500 text-xs">{f.source}</td>
                    <td className="py-2.5 text-right text-gray-800 text-xs font-semibold">
                      {fmt(f.amount, f.currency)}
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
