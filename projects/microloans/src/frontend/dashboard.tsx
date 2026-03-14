import * as React from 'react'
import type { DashboardPageProps } from '@rahataid/plugin-sdk'
import { ProjectDashboardHero } from '@rahataid/projects-shared'
import { CreditCard, Users, TrendingUp, AlertCircle } from 'lucide-react'

const loans = [
  { borrower: 'Anita Shrestha', amount: '$150', disbursed: '2026-01-15', due: '2026-07-15', repaid: '$50', status: 'On Track' },
  { borrower: 'Bikash Lama', amount: '$200', disbursed: '2026-01-20', due: '2026-07-20', repaid: '$80', status: 'On Track' },
  { borrower: 'Chandra Bista', amount: '$100', disbursed: '2025-12-10', due: '2026-06-10', repaid: '$100', status: 'Repaid' },
  { borrower: 'Devi Pun', amount: '$150', disbursed: '2026-02-01', due: '2026-08-01', repaid: '$0', status: 'Overdue' },
  { borrower: 'Ek Raj Oli', amount: '$250', disbursed: '2026-02-10', due: '2026-08-10', repaid: '$50', status: 'On Track' },
]

const statusColors: Record<string, string> = {
  'On Track': 'bg-green-100 text-green-700',
  'Repaid': 'bg-gray-100 text-gray-600',
  'Overdue': 'bg-red-100 text-red-600',
}

const statCardClassName =
  'rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_12px_26px_-22px_rgba(15,23,42,0.4)] transition-shadow hover:shadow-[0_20px_40px_-28px_rgba(15,23,42,0.5)]'
const panelCardClassName =
  'rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.45)]'

export function MicroloansDashboardPage({ project, onEdit }: DashboardPageProps) {
  const totalLoans = project.beneficiaries
  const activeBorrowers = Math.round(totalLoans * 0.72)
  const repaymentRate = 84
  const defaultRate = 3

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <ProjectDashboardHero
        project={project}
        projectTypeLabel="Microloans"
        accentClassName="bg-emerald-500 text-white"
        onEdit={onEdit}
      />

      <div className="flex-1 px-8 py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Loans', value: totalLoans.toLocaleString(), icon: CreditCard, color: 'bg-emerald-50 text-emerald-500' },
            { label: 'Active Borrowers', value: activeBorrowers.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-500' },
            { label: 'Repayment Rate', value: `${repaymentRate}%`, icon: TrendingUp, color: 'bg-green-50 text-green-500' },
            { label: 'Default Rate', value: `${defaultRate}%`, icon: AlertCircle, color: 'bg-red-50 text-red-400' },
          ].map((s) => (
            <div key={s.label} className={`${statCardClassName} flex flex-col gap-3`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{s.label}</span>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                  <s.icon size={16} />
                </span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          <div className={`${panelCardClassName} xl:col-span-3`}>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Loan Portfolio</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                  <th className="pb-2 font-medium">Borrower</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                  <th className="pb-2 font-medium text-right">Repaid</th>
                  <th className="pb-2 font-medium">Due</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loans.map((l) => (
                  <tr key={l.borrower} className="hover:bg-white/60 transition-colors">
                    <td className="py-2.5 font-medium text-gray-800">{l.borrower}</td>
                    <td className="py-2.5 text-right text-gray-700">{l.amount}</td>
                    <td className="py-2.5 text-right text-gray-500">{l.repaid}</td>
                    <td className="py-2.5 text-gray-500 text-xs">{l.due}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[l.status]}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 xl:col-span-2">
            <div className={panelCardClassName}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-800">Repayment Progress</h2>
                <span className="text-xs text-gray-400">{repaymentRate}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: `${repaymentRate}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-2">On-time repayment rate</p>
            </div>
            <div className={panelCardClassName}>
              <h2 className="text-sm font-semibold text-gray-800 mb-2">Portfolio Value</h2>
              <p className="text-2xl font-semibold text-gray-900">{project.budget}</p>
              <p className="text-xs text-gray-400 mt-1">Total loan portfolio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
