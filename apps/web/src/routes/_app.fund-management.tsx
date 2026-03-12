import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, ArrowDownLeft, Send, TrendingUp } from 'lucide-react'

export const Route = createFileRoute('/_app/fund-management')({ component: FundManagement })

const allocations = [
  { project: 'Nepal Earthquake Relief', allocated: 320000, spent: 210000, currency: 'USD' },
  { project: 'Flood Recovery – Terai', allocated: 180000, spent: 95000, currency: 'USD' },
  { project: 'Urban Food Security', allocated: 95000, spent: 12000, currency: 'USD' },
  { project: 'Drought Response – Karnali', allocated: 210000, spent: 210000, currency: 'USD' },
  { project: 'Landslide Recovery – Sindhupalchok', allocated: 140000, spent: 88000, currency: 'USD' },
  { project: 'Winterisation Support', allocated: 75000, spent: 0, currency: 'USD' },
]

const transactions = [
  { type: 'deposit', label: 'Donor contribution – UNICEF', amount: 500000, date: 'Mar 10, 2025' },
  { type: 'transfer', label: 'Allocation → Nepal Earthquake Relief', amount: -80000, date: 'Mar 9, 2025' },
  { type: 'transfer', label: 'Allocation → Flood Recovery – Terai', amount: -45000, date: 'Mar 8, 2025' },
  { type: 'deposit', label: 'Donor contribution – WFP', amount: 200000, date: 'Mar 5, 2025' },
  { type: 'transfer', label: 'Allocation → Urban Food Security', amount: -12000, date: 'Mar 3, 2025' },
]

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(n))
}

function FundManagement() {
  const totalFund = 4_200_000
  const totalAllocated = allocations.reduce((s, a) => s + a.allocated, 0)
  const totalSpent = allocations.reduce((s, a) => s + a.spent, 0)
  const remaining = totalFund - totalAllocated

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-900">Fund Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and distribute treasury funds across projects.</p>
      </div>

      <div className="flex-1 px-8 py-6 space-y-6">
        {/* Treasury overview */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Treasury Balance', value: fmt(totalFund), icon: TrendingUp, color: 'bg-orange-50 text-orange-500' },
            { label: 'Total Allocated', value: fmt(totalAllocated), icon: Send, color: 'bg-blue-50 text-blue-500' },
            { label: 'Total Spent', value: fmt(totalSpent), icon: ArrowUpRight, color: 'bg-purple-50 text-purple-500' },
            { label: 'Unallocated', value: fmt(remaining), icon: ArrowDownLeft, color: 'bg-green-50 text-green-500' },
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Project Allocations</h2>
              <button className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                Distribute Funds
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                  <th className="pb-2 font-medium">Project</th>
                  <th className="pb-2 font-medium text-right">Allocated</th>
                  <th className="pb-2 font-medium text-right">Spent</th>
                  <th className="pb-2 font-medium w-28">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allocations.map((a) => {
                  const pct = a.allocated > 0 ? Math.round((a.spent / a.allocated) * 100) : 0
                  return (
                    <tr key={a.project} className="hover:bg-white/60 transition-colors">
                      <td className="py-2.5 font-medium text-gray-800 text-xs">{a.project}</td>
                      <td className="py-2.5 text-right text-gray-600 text-xs">{fmt(a.allocated)}</td>
                      <td className="py-2.5 text-right text-gray-600 text-xs">{fmt(a.spent)}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct === 100 ? 'bg-gray-400' : 'bg-orange-400'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Transactions */}
          <div className="col-span-2 bg-gray-50 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Recent Transactions</h2>
            <div className="space-y-3">
              {transactions.map((t, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      t.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'
                    }`}
                  >
                    {t.type === 'deposit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{t.label}</p>
                    <p className="text-xs text-gray-400">{t.date}</p>
                  </div>
                  <p
                    className={`text-xs font-semibold flex-shrink-0 ${
                      t.amount > 0 ? 'text-green-600' : 'text-gray-700'
                    }`}
                  >
                    {t.amount > 0 ? '+' : '-'}{fmt(t.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
