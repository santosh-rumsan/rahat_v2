import * as React from 'react'
import * as LucideIcons from 'lucide-react'
import { FolderKanban, Users } from 'lucide-react'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppShell, IconSidebar } from '../components/layout'
import type { SidebarNavItem } from '../components/layout/icon-sidebar'
import '../plugins/index'
import { getRegisteredAppPlugins } from '../plugins/app-registry'
import { isPluginEnabled } from '../plugins/plugin-state'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

// Ordered nav slots — mix of plugin IDs and static keys
const NAV_SLOTS = [
  'dashboard',
  '__projects__',
  'fund-management',
  'vendors',
  '__users__',
  'forecast',
  'reports',
] as const

const STATIC_NAV: Record<string, SidebarNavItem> = {
  __projects__: { icon: <FolderKanban size={18} />, to: '/projects' },
  __users__: { icon: <Users size={18} />, to: '/users' },
}

function getLucideIcon(name: string) {
  return (LucideIcons as Record<string, unknown>)[name] as React.ComponentType<{ size?: number }> | undefined
}

function AppLayout() {
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0)

  React.useEffect(() => {
    const handler = () => forceUpdate()
    window.addEventListener('rahat:plugin-state-change', handler)
    return () => window.removeEventListener('rahat:plugin-state-change', handler)
  }, [])

  const pluginMap = Object.fromEntries(getRegisteredAppPlugins().map((p) => [p.id, p]))

  const navItems: SidebarNavItem[] = NAV_SLOTS.flatMap((slot) => {
    if (slot in STATIC_NAV) return [STATIC_NAV[slot]]
    const plugin = pluginMap[slot]
    if (!plugin || !isPluginEnabled(plugin.id)) return []
    const Icon = plugin.icon ? getLucideIcon(plugin.icon) : undefined
    return [{ icon: Icon ? <Icon size={18} /> : null, to: plugin.route }]
  })

  return (
    <AppShell
      sidebar={
        <IconSidebar
          navItems={navItems}
          avatar="https://i.pravatar.cc/32?img=33"
          footerLabel=""
        />
      }
    >
      <Outlet />
    </AppShell>
  )
}
