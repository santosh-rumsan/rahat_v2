import * as React from 'react'
import type { DashboardPageProps } from '@rahataid/plugin-sdk'
import { ProjectDashboardHero } from '@rahataid/projects-shared'
import { BookOpen, Users, Award, PlayCircle } from 'lucide-react'

const modules = [
  { title: 'Financial Literacy Basics', enrolled: 280, completed: 210, duration: '45 min' },
  { title: 'Disaster Preparedness', enrolled: 260, completed: 185, duration: '30 min' },
  { title: 'Safe Water & Sanitation', enrolled: 240, completed: 198, duration: '25 min' },
  { title: 'Crop Resilience Techniques', enrolled: 180, completed: 120, duration: '60 min' },
  { title: 'Digital Payments Guide', enrolled: 150, completed: 88, duration: '35 min' },
]

const statCardClassName =
  'rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_12px_26px_-22px_rgba(15,23,42,0.4)] transition-shadow hover:shadow-[0_20px_40px_-28px_rgba(15,23,42,0.5)]'
const panelCardClassName =
  'rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.45)]'

export function MicrolearningDashboardPage({ project, onEdit, mapSlot }: DashboardPageProps) {
  const totalEnrolled = project.beneficiaries
  const totalCompleted = Math.round(totalEnrolled * 0.64)
  const completionRate = Math.round((totalCompleted / totalEnrolled) * 100)
  const certifications = Math.round(totalCompleted * 0.55)

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <ProjectDashboardHero
        project={project}
        projectTypeLabel="Microlearning"
        accentClassName="bg-indigo-500 text-white"
        onEdit={onEdit}
        mapSlot={mapSlot}
      />

      <div className="flex-1 px-8 py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Enrolled Learners', value: totalEnrolled.toLocaleString(), icon: Users, color: 'bg-indigo-50 text-indigo-500' },
            { label: 'Modules Available', value: String(modules.length), icon: BookOpen, color: 'bg-blue-50 text-blue-500' },
            { label: 'Completions', value: totalCompleted.toLocaleString(), icon: PlayCircle, color: 'bg-green-50 text-green-500' },
            { label: 'Certifications', value: certifications.toLocaleString(), icon: Award, color: 'bg-orange-50 text-orange-500' },
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
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Learning Modules</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                  <th className="pb-2 font-medium">Module</th>
                  <th className="pb-2 font-medium text-right">Enrolled</th>
                  <th className="pb-2 font-medium text-right">Completed</th>
                  <th className="pb-2 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {modules.map((m) => (
                  <tr key={m.title} className="hover:bg-white/60 transition-colors">
                    <td className="py-2.5 font-medium text-gray-800 text-xs">{m.title}</td>
                    <td className="py-2.5 text-right text-gray-600">{m.enrolled}</td>
                    <td className="py-2.5 text-right text-gray-600">{m.completed}</td>
                    <td className="py-2.5 text-gray-500 text-xs">{m.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 xl:col-span-2">
            <div className={panelCardClassName}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-800">Completion Rate</h2>
                <span className="text-xs text-gray-400">{completionRate}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full" style={{ width: `${completionRate}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-2">{totalCompleted} of {totalEnrolled} learners completed at least one module</p>
            </div>
            <div className={panelCardClassName}>
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Module Progress</h2>
              <div className="space-y-3">
                {modules.slice(0, 3).map((m) => {
                  const pct = Math.round((m.completed / m.enrolled) * 100)
                  return (
                    <div key={m.title}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span className="truncate pr-2">{m.title}</span><span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
