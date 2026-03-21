import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import * as LucideIcons from 'lucide-react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { getRegisteredAppPlugins } from '../plugins/app-registry'
import { getRegisteredPlugins } from '../plugins/registry'
import { getRegisteredTaskTypes } from '@rahataid/projects-shared/task-management'
import { isPluginEnabled, setPluginEnabled } from '../plugins/plugin-state'

export const Route = createFileRoute('/_app/plugins')({ component: PluginsPage })

type PluginEntry = {
  id: string
  label: string
  description?: string
  icon?: string
  group: string
}

function getLucideIcon(name?: string) {
  if (!name) return null
  const Icon = (LucideIcons as Record<string, unknown>)[name] as React.ComponentType<{ size?: number; className?: string }> | undefined
  return Icon ?? null
}

const GROUP_META: Record<string, { label: string; description: string }> = {
  core: { label: 'Core', description: 'Built-in application modules' },
  project: { label: 'Project', description: 'Project type plugins' },
  task: { label: 'Task', description: 'Task designer plugins for workflows' },
}

function PluginCard({ plugin, enabled, onToggle }: { plugin: PluginEntry; enabled: boolean; onToggle: (id: string, value: boolean) => void }) {
  const Icon = getLucideIcon(plugin.icon)

  return (
    <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 py-4">
      <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
        {Icon ? <Icon size={18} className="text-gray-600" /> : <LucideIcons.Puzzle size={18} className="text-gray-400" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-gray-900">{plugin.label}</span>
          <span
            className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${
              enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {enabled ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
            {enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        {plugin.description && <p className="text-xs text-gray-400 truncate">{plugin.description}</p>}
        {!plugin.description && <p className="text-xs text-gray-400">{plugin.id}</p>}
      </div>

      <button
        onClick={() => onToggle(plugin.id, !enabled)}
        className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 focus:outline-none ${
          enabled ? 'bg-brand-500' : 'bg-gray-200'
        }`}
        style={{ width: 40, height: 22 }}
        aria-label={enabled ? 'Disable plugin' : 'Enable plugin'}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            enabled ? 'translate-x-[18px]' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

function PluginsPage() {
  const appPlugins: PluginEntry[] = getRegisteredAppPlugins().map((p) => ({
    id: p.id,
    label: p.label,
    description: p.description,
    icon: p.icon,
    group: 'core',
  }))

  const projectPlugins: PluginEntry[] = getRegisteredPlugins().map((p) => ({
    id: p.projectType,
    label: p.label,
    description: p.description,
    icon: p.icon,
    group: 'project',
  }))

  const taskPlugins: PluginEntry[] = getRegisteredTaskTypes().map((p) => ({
    id: p.type,
    label: p.label,
    description: p.description,
    icon: p.icon,
    group: 'task',
  }))

  const allPlugins = [...appPlugins, ...projectPlugins, ...taskPlugins]

  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0)

  function handleToggle(id: string, value: boolean) {
    setPluginEnabled(id, value)
    forceUpdate()
  }

  const groups = ['core', 'project', 'task']

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <div className="px-8 pt-8 pb-6 border-b border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-900">Plugins</h1>
        <p className="text-sm text-gray-500 mt-1">Manage installed plugins and extensions.</p>
      </div>

      <div className="flex-1 px-8 py-6 space-y-8">
        {groups.map((group) => {
          const plugins = allPlugins.filter((p) => p.group === group)
          if (plugins.length === 0) return null
          const meta = GROUP_META[group]
          return (
            <section key={group}>
              <div className="mb-3">
                <h2 className="text-sm font-semibold text-gray-800">{meta.label}</h2>
                <p className="text-xs text-gray-400">{meta.description}</p>
              </div>
              <div className="space-y-2">
                {plugins.map((plugin) => (
                  <PluginCard
                    key={plugin.id}
                    plugin={plugin}
                    enabled={isPluginEnabled(plugin.id)}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
