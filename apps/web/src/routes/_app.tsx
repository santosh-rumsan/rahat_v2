import * as React from 'react'
import * as LucideIcons from 'lucide-react'
import { FolderKanban, Users, Database } from 'lucide-react'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppShell, IconSidebar } from '../components/layout'
import type { SidebarNavItem } from '../components/layout/icon-sidebar'
import '../plugins/index'
import { getRegisteredAppPlugins } from '../plugins/app-registry'
import { isPluginEnabled } from '../plugins/plugin-state'
import { SampleDataDialog } from '../components/sample-data-import.js'
import {
  Dialog,
  DialogContent,
} from '@rs/ui/dialog'

const FIRST_RUN_KEY = 'rahat-first-run-seen'

function useFirstRun() {
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    if (!import.meta.env.DEV) return
    if (!localStorage.getItem(FIRST_RUN_KEY)) {
      setShow(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(FIRST_RUN_KEY, '1')
    setShow(false)
  }

  return { show, setShow, dismiss }
}

function FirstRunDialog() {
  const { show, setShow, dismiss } = useFirstRun()
  const [importOpen, setImportOpen] = React.useState(false)

  function handleYes() {
    setShow(false)
    setImportOpen(true)
  }

  return (
    <>
      <Dialog open={show} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">
              <Database size={26} className="text-brand-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">Welcome to Rahat</p>
              <p className="text-sm text-gray-500 mt-1">
                Would you like to import sample data to get started quickly?
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={dismiss}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                No thanks
              </button>
              <button
                onClick={handleYes}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors"
              >
                Yes, import data
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <SampleDataDialog open={importOpen} onOpenChange={setImportOpen} onImported={dismiss} />
    </>
  )
}

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
    <>
      <FirstRunDialog />
      <AppShell
        sidebar={
          <IconSidebar
            navItems={navItems}
            avatar="https://lh3.googleusercontent.com/ogw/AF2bZygFUC8MHEPTtNKErMu2uiiipsDRlxrUDnFvkMpOtES_RQDi=s64-c-mo"
            footerLabel=""
          />
        }
      >
        <Outlet />
      </AppShell>
    </>
  )
}
