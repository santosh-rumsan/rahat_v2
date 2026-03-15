import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Search, Plus } from 'lucide-react'
import * as React from 'react'
import { getPlugin } from '../plugins'
import { useProjects } from '@rahataid/projects-shared'

export const Route = createFileRoute('/_app/projects/')({ component: Projects })

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Planning: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-gray-100 text-gray-600',
  Suspended: 'bg-red-100 text-red-600',
}

function Projects() {
  const [search, setSearch] = React.useState('')
  const navigate = useNavigate()
  const { data: projects = [], isLoading } = useProjects()
  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} projects total</p>
        </div>
        <button
          onClick={() => navigate({ to: '/projects/new' })}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} />
          Add New Project
        </button>
      </div>

      {/* Search */}
      <div className="px-8 pt-5">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 px-8 py-6 grid grid-cols-3 gap-5 content-start">
        {isLoading && (
          <div className="col-span-3 py-16 text-center text-gray-400 text-sm">
            Loading projects…
          </div>
        )}
        {!isLoading && filtered.map((p) => {
          const plugin = getPlugin(p.projectType)
          return (
            <div
              key={p.id}
              onClick={() => navigate({ to: '/projects/$id', params: { id: p.id } })}
              className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span
                  className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {p.status}
                </span>
              </div>
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{p.name}</h3>
                  {plugin && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0">
                      {plugin.label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{p.location}</p>
                <div className="flex items-center justify-between pt-2 text-xs text-gray-500 border-t border-gray-100">
                  <span>{p.beneficiaries.toLocaleString()} beneficiaries</span>
                  <span className="font-medium text-gray-700">{p.budget}</span>
                </div>
              </div>
            </div>
          )
        })}
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center text-gray-400 text-sm">
            {search ? `No projects found matching "${search}"` : 'No projects yet. Create your first project.'}
          </div>
        )}
      </div>
    </div>
  )
}
