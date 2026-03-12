import * as React from 'react'
import type { DashboardPageProps } from '@rahataid/plugin-sdk'
import { ProjectDashboardHero } from '@rahataid/projects-shared'
import { Users, UserCheck, UserX, Clock } from 'lucide-react'

const recentBeneficiaries = [
  { name: 'Gita Sharma', age: 34, location: 'Ward 5', enrolled: '2026-02-10', status: 'Verified' },
  { name: 'Raju Tamang', age: 45, location: 'Ward 2', enrolled: '2026-02-12', status: 'Pending' },
  { name: 'Sunita Rai', age: 28, location: 'Ward 8', enrolled: '2026-02-14', status: 'Verified' },
  { name: 'Dipak Magar', age: 52, location: 'Ward 1', enrolled: '2026-02-15', status: 'Inactive' },
  { name: 'Kamala Thapa', age: 39, location: 'Ward 3', enrolled: '2026-02-18', status: 'Verified' },
]

const statCardClassName =
  'rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_12px_26px_-22px_rgba(15,23,42,0.4)] transition-shadow hover:shadow-[0_20px_40px_-28px_rgba(15,23,42,0.5)]'
const panelCardClassName =
  'rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.45)]'

export function BeneficiaryDashboardPage({ project }: DashboardPageProps) {
  const total = project.beneficiaries
  const verified = Math.round(total * 0.68)
  const pending = Math.round(total * 0.22)
  const inactive = total - verified - pending

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <ProjectDashboardHero
        project={project}
        projectTypeLabel="Beneficiary Management"
        accentClassName="bg-sky-500 text-white"
      />

      <div className="flex-1 px-8 py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Enrolled', value: total.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-500' },
            { label: 'Verified', value: verified.toLocaleString(), icon: UserCheck, color: 'bg-green-50 text-green-500' },
            { label: 'Pending Review', value: pending.toLocaleString(), icon: Clock, color: 'bg-yellow-50 text-yellow-500' },
            { label: 'Inactive', value: inactive.toLocaleString(), icon: UserX, color: 'bg-red-50 text-red-400' },
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
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Recent Enrollments</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Age</th>
                  <th className="pb-2 font-medium">Location</th>
                  <th className="pb-2 font-medium">Enrolled</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBeneficiaries.map((b) => (
                  <tr key={b.name} className="hover:bg-white/60 transition-colors">
                    <td className="py-2.5 font-medium text-gray-800">{b.name}</td>
                    <td className="py-2.5 text-gray-500">{b.age}</td>
                    <td className="py-2.5 text-gray-500">{b.location}</td>
                    <td className="py-2.5 text-gray-500">{b.enrolled}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.status === 'Verified' ? 'bg-green-100 text-green-700' : b.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 xl:col-span-2">
            <div className={panelCardClassName}>
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Verification Progress</h2>
              <div className="space-y-3">
                {[
                  { label: 'Verified', pct: Math.round((verified / total) * 100), color: 'bg-green-400' },
                  { label: 'Pending', pct: Math.round((pending / total) * 100), color: 'bg-yellow-400' },
                  { label: 'Inactive', pct: Math.round((inactive / total) * 100), color: 'bg-gray-300' },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{bar.label}</span><span>{bar.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={panelCardClassName}>
              <h2 className="text-sm font-semibold text-gray-800 mb-2">Budget</h2>
              <p className="text-2xl font-semibold text-gray-900">{project.budget}</p>
              <p className="text-xs text-gray-400 mt-1">Total allocated budget</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
