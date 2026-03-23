import * as React from 'react'
import type { DashboardPageProps } from '@rahataid/plugin-sdk'
import { ProjectDashboardHero } from '@rahataid/projects-shared'
import { Shield, AlertTriangle, Home, Zap } from 'lucide-react'

const triggers = [
  { event: 'Flood Warning – Terai East', level: 'High', households: 340, triggered: '2026-03-01', response: 'Pre-positioned supplies' },
  { event: 'Drought Alert – Mid-Hills', level: 'Medium', households: 210, triggered: '2026-02-20', response: 'Water distribution' },
  { event: 'Landslide Risk – Sindhupalchok', level: 'High', households: 180, triggered: '2026-02-25', response: 'Early evacuation' },
  { event: 'Cold Wave – Humla', level: 'Low', households: 95, triggered: '2026-03-05', response: 'Blanket distribution' },
]

const levelColors: Record<string, string> = {
  High: 'bg-red-100 text-red-600',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-blue-100 text-blue-600',
}

const statCardClassName =
  'rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_12px_26px_-22px_rgba(15,23,42,0.4)] transition-shadow hover:shadow-[0_20px_40px_-28px_rgba(15,23,42,0.5)]'
const panelCardClassName =
  'rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.45)]'

export function AaDashboardPage({ project, onEdit, mapSlot }: DashboardPageProps) {
  const triggersActivated = triggers.length
  const householdsReached = project.beneficiaries
  const earlyWarnings = 7
  const responseTime = '4.2h'

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <ProjectDashboardHero
        project={project}
        projectTypeLabel="Anticipatory Action"
        accentClassName="bg-purple-500 text-white"
        onEdit={onEdit}
        mapSlot={mapSlot}
      />

      <div className="flex-1 px-8 py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Triggers Activated', value: String(triggersActivated), icon: Zap, color: 'bg-red-50 text-red-500' },
            { label: 'Households Reached', value: householdsReached.toLocaleString(), icon: Home, color: 'bg-blue-50 text-blue-500' },
            { label: 'Early Warnings', value: String(earlyWarnings), icon: AlertTriangle, color: 'bg-yellow-50 text-yellow-500' },
            { label: 'Avg Response Time', value: responseTime, icon: Shield, color: 'bg-purple-50 text-purple-500' },
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
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Active Triggers</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                  <th className="pb-2 font-medium">Event</th>
                  <th className="pb-2 font-medium">Level</th>
                  <th className="pb-2 font-medium text-right">Households</th>
                  <th className="pb-2 font-medium">Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {triggers.map((t) => (
                  <tr key={t.event} className="hover:bg-white/60 transition-colors">
                    <td className="py-2.5 font-medium text-gray-800 text-xs">{t.event}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[t.level]}`}>{t.level}</span>
                    </td>
                    <td className="py-2.5 text-right text-gray-600">{t.households}</td>
                    <td className="py-2.5 text-gray-500 text-xs">{t.response}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 xl:col-span-2">
            <div className={panelCardClassName}>
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Risk Level Distribution</h2>
              <div className="space-y-3">
                {[
                  { label: 'High Risk', count: 2, pct: 50, color: 'bg-red-400' },
                  { label: 'Medium Risk', count: 1, pct: 25, color: 'bg-yellow-400' },
                  { label: 'Low Risk', count: 1, pct: 25, color: 'bg-blue-400' },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{bar.label}</span><span>{bar.count} triggers</span>
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
