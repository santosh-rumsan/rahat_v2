import type { DashboardPageProps } from '@rahataid/plugin-sdk'
import { ProjectDashboardHero } from '@rahataid/projects-shared'
import { Wallet, Users, ArrowUpRight, CheckCircle, Clock } from 'lucide-react'

const recentDistributions = [
  { beneficiary: 'Ram Bahadur', voucher: 'VCH-1042', amount: '$45', redeemedAt: 'Kathmandu Market', status: 'Redeemed' },
  { beneficiary: 'Sita Devi', voucher: 'VCH-1043', amount: '$45', redeemedAt: '—', status: 'Pending' },
  { beneficiary: 'Hari Prasad', voucher: 'VCH-1044', amount: '$45', redeemedAt: 'Thamel Store', status: 'Redeemed' },
  { beneficiary: 'Maya Gurung', voucher: 'VCH-1045', amount: '$45', redeemedAt: '—', status: 'Pending' },
  { beneficiary: 'Bikram KC', voucher: 'VCH-1046', amount: '$45', redeemedAt: 'Patan Bazaar', status: 'Redeemed' },
]

const statCardClassName =
  'rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_12px_26px_-22px_rgba(15,23,42,0.4)] transition-shadow hover:shadow-[0_20px_40px_-28px_rgba(15,23,42,0.5)]'
const panelCardClassName =
  'rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.45)]'

export function CvaDashboardPage({ project }: DashboardPageProps) {
  const totalVouchers = Math.round(project.beneficiaries * 1.2)
  const redeemed = Math.round(totalVouchers * 0.73)
  const redemptionRate = Math.round((redeemed / totalVouchers) * 100)

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <ProjectDashboardHero
        project={project}
        projectTypeLabel="Cash Voucher Assistance"
        accentClassName="bg-orange-500 text-white"
      />

      <div className="flex-1 px-8 py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Vouchers', value: totalVouchers.toLocaleString(), icon: Wallet, color: 'bg-orange-50 text-orange-500' },
            { label: 'Beneficiaries', value: project.beneficiaries.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-500' },
            { label: 'Redeemed', value: redeemed.toLocaleString(), icon: CheckCircle, color: 'bg-green-50 text-green-500' },
            { label: 'Pending', value: (totalVouchers - redeemed).toLocaleString(), icon: Clock, color: 'bg-yellow-50 text-yellow-500' },
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
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Recent Distributions</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                  <th className="pb-2 font-medium">Beneficiary</th>
                  <th className="pb-2 font-medium">Voucher</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Redeemed At</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentDistributions.map((d) => (
                  <tr key={d.voucher} className="hover:bg-white/60 transition-colors">
                    <td className="py-2.5 font-medium text-gray-800">{d.beneficiary}</td>
                    <td className="py-2.5 text-gray-500 font-mono text-xs">{d.voucher}</td>
                    <td className="py-2.5 text-gray-700">{d.amount}</td>
                    <td className="py-2.5 text-gray-500">{d.redeemedAt}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === 'Redeemed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {d.status}
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
                <h2 className="text-sm font-semibold text-gray-800">Redemption Rate</h2>
                <span className="text-xs text-gray-400">{redeemed.toLocaleString()} of {totalVouchers.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" style={{ width: `${redemptionRate}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>{redemptionRate}% redeemed</span>
                <span className="flex items-center gap-1 text-green-600"><ArrowUpRight size={12} />+4% this week</span>
              </div>
            </div>

            <div className={panelCardClassName}>
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Budget</h2>
              <p className="text-2xl font-semibold text-gray-900">{project.budget}</p>
              <p className="text-xs text-gray-400 mt-1">Total allocated budget</p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" style={{ width: '67%' }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">67% disbursed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
