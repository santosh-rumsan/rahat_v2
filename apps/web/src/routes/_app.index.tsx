import { createFileRoute } from '@tanstack/react-router'
import {
  FolderKanban,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CircleDollarSign,
} from 'lucide-react'

export const Route = createFileRoute('/_app/')({ component: Dashboard })

const stats = [
  {
    label: 'Total Projects',
    value: '24',
    change: '+3 this month',
    up: true,
    icon: FolderKanban,
    color: 'bg-orange-50 text-orange-500',
  },
  {
    label: 'Beneficiaries',
    value: '12,480',
    change: '+840 this month',
    up: true,
    icon: Users,
    color: 'bg-blue-50 text-blue-500',
  },
  {
    label: 'Total Budget',
    value: '$4.2M',
    change: '-$120K allocated',
    up: false,
    icon: CircleDollarSign,
    color: 'bg-green-50 text-green-500',
  },
  {
    label: 'Distributions',
    value: '8,932',
    change: '+210 today',
    up: true,
    icon: Activity,
    color: 'bg-purple-50 text-purple-500',
  },
]

const recentProjects = [
  { name: 'Nepal Earthquake Relief', status: 'Active', budget: '$320,000', beneficiaries: 1240 },
  { name: 'Flood Recovery – Terai', status: 'Active', budget: '$180,000', beneficiaries: 890 },
  { name: 'Urban Food Security', status: 'Planning', budget: '$95,000', beneficiaries: 420 },
  { name: 'Drought Response – Karnali', status: 'Completed', budget: '$210,000', beneficiaries: 1670 },
  { name: 'Landslide Recovery – Sindhupalchok', status: 'Active', budget: '$140,000', beneficiaries: 610 },
]

const activity = [
  { action: 'New beneficiary registered', project: 'Nepal Earthquake Relief', time: '2m ago' },
  { action: 'Fund transfer approved', project: 'Flood Recovery – Terai', time: '18m ago' },
  { action: 'Vendor payment processed', project: 'Urban Food Security', time: '1h ago' },
  { action: 'Project status updated', project: 'Drought Response – Karnali', time: '3h ago' },
  { action: 'New project created', project: 'Landslide Recovery – Sindhupalchok', time: '5h ago' },
]

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Planning: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-gray-100 text-gray-600',
}

function Dashboard() {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back — here's what's happening today.</p>
      </div>

      <div className="flex-1 px-8 py-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{s.label}</span>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                  <s.icon size={16} />
                </span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
              <p className={`text-xs flex items-center gap-1 ${s.up ? 'text-green-600' : 'text-red-500'}`}>
                {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {s.change}
              </p>
            </div>
          ))}
        </div>

        {/* Recent projects + Activity */}
        <div className="grid grid-cols-5 gap-6">
          {/* Projects table */}
          <div className="col-span-3 bg-gray-50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Recent Projects</h2>
              <a href="/projects" className="text-xs text-orange-500 hover:underline">View all →</a>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                  <th className="pb-2 font-medium">Project</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Budget</th>
                  <th className="pb-2 font-medium text-right">Beneficiaries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentProjects.map((p) => (
                  <tr key={p.name} className="hover:bg-white/60 transition-colors">
                    <td className="py-2.5 font-medium text-gray-800">{p.name}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-gray-600">{p.budget}</td>
                    <td className="py-2.5 text-right text-gray-600">{p.beneficiaries.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Activity feed */}
          <div className="col-span-2 bg-gray-50 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {activity.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-800">{a.action}</p>
                    <p className="text-xs text-gray-400">{a.project} · {a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget overview bar */}
        <div className="bg-gray-50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Budget Utilisation</h2>
            <span className="text-xs text-gray-400">$2.8M of $4.2M used</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" style={{ width: '67%' }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>67% allocated</span>
            <span>$1.4M remaining</span>
          </div>
        </div>
      </div>
    </div>
  )
}
