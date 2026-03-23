import { useQuery } from '@tanstack/react-query'
import {
  createProjectService,
  createFundService,
  getSDKApiUrl,
} from '@rahataid/sdk'
import {
  FolderKanban,
  Users,
  CircleDollarSign,
  Wallet,
} from 'lucide-react'
import * as React from 'react'
import * as mapboxglModule from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapboxgl = ((mapboxglModule as any).default ?? mapboxglModule) as typeof import('mapbox-gl').default

function projectService() {
  return createProjectService(getSDKApiUrl())
}

function fundService() {
  return createFundService(getSDKApiUrl())
}

function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService().list(),
  })
}

function useFunds() {
  return useQuery({
    queryKey: ['funds'],
    queryFn: () => fundService().listFunds(),
  })
}

function useFundAllocations() {
  return useQuery({
    queryKey: ['fund-allocations'],
    queryFn: () => fundService().listAllocations(),
  })
}

function useAllocationLogs() {
  return useQuery({
    queryKey: ['allocation-logs'],
    queryFn: () => fundService().listLogs(),
  })
}

function fmtCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n.toLocaleString()}`
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const min = Math.floor(diffMs / 60_000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const days = Math.floor(hr / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Planning: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-gray-100 text-gray-600',
  Inactive: 'bg-red-100 text-red-600',
}

const TOKEN = (import.meta as any).env?.VITE_MAPBOX_TOKEN ?? ''

interface MapMarker {
  longitude: number
  latitude: number
}

interface ProjectLocationsMapProps {
  markers: MapMarker[]
}

function ProjectLocationsMap({ markers }: ProjectLocationsMapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const mapRef = React.useRef<mapboxgl.Map | null>(null)

  React.useEffect(() => {
    if (!containerRef.current || markers.length === 0) return

    mapboxgl.accessToken = TOKEN

    const center: [number, number] = [markers[0].longitude, markers[0].latitude]

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center,
      zoom: 5,
      attributionControl: false,
    })

    for (const m of markers) {
      new mapboxgl.Marker({ color: '#2563eb' })
        .setLngLat([m.longitude, m.latitude])
        .addTo(map)
    }

    if (markers.length > 1) {
      const bounds = markers.reduce(
        (b, m) => b.extend([m.longitude, m.latitude] as [number, number]),
        new mapboxgl.LngLatBounds(
          [markers[0].longitude, markers[0].latitude],
          [markers[0].longitude, markers[0].latitude],
        ),
      )
      map.fitBounds(bounds, { padding: 60 })
    }

    map.on('load', () => {
      const logo = containerRef.current?.querySelector('.mapboxgl-ctrl-logo') as HTMLElement | null
      if (logo) logo.style.display = 'none'
      const attr = containerRef.current?.querySelector('.mapboxgl-ctrl-attrib') as HTMLElement | null
      if (attr) attr.style.display = 'none'
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [markers])

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-64">
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, pointerEvents: 'none' }} className="bg-white rounded-lg shadow-md px-3 py-1.5 flex items-center gap-2 text-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
        <span className="text-gray-700 font-medium">Project Locations</span>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { data: projects = [] } = useProjects()
  const { data: funds = [] } = useFunds()
  const { data: allocations = [] } = useFundAllocations()
  const { data: logs = [] } = useAllocationLogs()

  const totalProjects = projects.length
  const totalBeneficiaries = projects.reduce((s, p) => s + (p.beneficiaries ?? 0), 0)
  const totalFunds = funds.reduce((s, f) => s + f.amount, 0)
  const totalAllocated = allocations.reduce((s, a) => s + a.amount, 0)
  const pctAllocated = totalFunds > 0 ? Math.round((totalAllocated / totalFunds) * 100) : 0
  const remaining = totalFunds - totalAllocated

  const recentProjects = [...projects].reverse().slice(0, 5)
  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const projectMarkers = projects
    .filter((p) => p.longitude != null && p.latitude != null)
    .map((p) => ({ longitude: p.longitude!, latitude: p.latitude! }))

  const stats = [
    {
      label: 'Total Projects',
      value: totalProjects.toString(),
      icon: FolderKanban,
      color: 'bg-orange-50 text-orange-500',
    },
    {
      label: 'Beneficiaries',
      value: totalBeneficiaries.toLocaleString(),
      icon: Users,
      color: 'bg-blue-50 text-blue-500',
    },
    {
      label: 'Total Funds',
      value: fmtCurrency(totalFunds),
      icon: CircleDollarSign,
      color: 'bg-green-50 text-green-500',
    },
    {
      label: 'Allocated',
      value: fmtCurrency(totalAllocated),
      icon: Wallet,
      color: 'bg-purple-50 text-purple-500',
    },
  ]

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <div className="px-8 pt-8 pb-6 border-b border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back — here's what's happening today.</p>
      </div>

      <div className="flex-1 px-8 py-6 space-y-8">
        {/* Stats + Map side by side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Stat cards — 2 rows × 2 cols */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {stats.slice(0, 2).map((s) => (
                <div key={s.label} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 flex flex-col gap-3">
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
            <div className="grid grid-cols-2 gap-4">
              {stats.slice(2).map((s) => (
                <div key={s.label} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 flex flex-col gap-3">
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
          </div>

          {/* Map */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <ProjectLocationsMap markers={projectMarkers} />
          </div>
        </div>

        {/* Recent Projects + Activity */}
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 bg-gray-50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Recent Projects</h2>
              <a href="/projects" className="text-xs text-orange-500 hover:underline">View all →</a>
            </div>
            {recentProjects.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No projects yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                    <th className="pb-2 font-medium">Project</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium text-right">Beneficiaries</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-white/60 transition-colors">
                      <td className="py-2.5 font-medium text-gray-800">{p.name}</td>
                      <td className="py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-500 text-xs">{p.projectType}</td>
                      <td className="py-2.5 text-right text-gray-600">{(p.beneficiaries ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="col-span-2 bg-gray-50 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Recent Activity</h2>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No activity yet.</p>
            ) : (
              <div className="space-y-4">
                {recentLogs.map((l) => (
                  <div key={l.id} className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${l.type === 'deposit' ? 'bg-green-400' : 'bg-orange-400'}`} />
                    <div>
                      <p className="text-sm text-gray-800">{l.label}</p>
                      <p className="text-xs text-gray-400">
                        {l.token} · {fmtCurrency(l.amount)} · {fmtTime(l.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Budget Utilisation */}
        <div className="bg-gray-50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Budget Utilisation</h2>
            <span className="text-xs text-gray-400">
              {fmtCurrency(totalAllocated)} of {fmtCurrency(totalFunds)} allocated
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${pctAllocated}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{pctAllocated}% allocated</span>
            <span>{fmtCurrency(remaining)} remaining</span>
          </div>
        </div>
      </div>
    </div>
  )
}
