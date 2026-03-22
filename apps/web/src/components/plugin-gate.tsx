import * as React from 'react'
import { Outlet, Link } from '@tanstack/react-router'
import { Puzzle } from 'lucide-react'
import { isPluginEnabled } from '../plugins/plugin-state'

function PluginDisabledScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Puzzle size={20} className="text-gray-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">Plugin not enabled</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Enable this plugin from the{' '}
          <Link to="/plugins" className="text-brand-500 hover:underline">
            Plugins
          </Link>{' '}
          page.
        </p>
      </div>
    </div>
  )
}

export function PluginGate({ pluginId, children }: { pluginId: string; children?: React.ReactNode }) {
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0)

  React.useEffect(() => {
    const handler = () => forceUpdate()
    window.addEventListener('rahat:plugin-state-change', handler)
    return () => window.removeEventListener('rahat:plugin-state-change', handler)
  }, [])

  if (!isPluginEnabled(pluginId)) return <PluginDisabledScreen />

  return children != null ? <>{children}</> : <Outlet />
}
