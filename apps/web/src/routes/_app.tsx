import { createFileRoute, Outlet } from '@tanstack/react-router'
import {
  LayoutDashboard,
  FolderKanban,
  Layers,
  Wallet,
  Building2,
  Users,
  CloudSun,
  BarChart3,
} from 'lucide-react'
import { AppShell, IconSidebar } from '../components/layout'
import '../plugins/index'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={18} />, to: '/' },
  { icon: <FolderKanban size={18} />, to: '/projects' },
  { icon: <Wallet size={18} />, to: '/funds' },
  { icon: <Building2 size={18} />, to: '/vendors' },
  { icon: <Users size={18} />, to: '/users' },
  { icon: <CloudSun size={18} />, to: '/forecast' },
  { icon: <BarChart3 size={18} />, to: '/reports' },
]

function AppLayout() {
  return (
    <AppShell
      sidebar={
        <IconSidebar
          navItems={NAV_ITEMS}
          avatar="https://i.pravatar.cc/32?img=33"
          footerLabel=""
        />
      }
    >
      <Outlet />
    </AppShell>
  )
}
