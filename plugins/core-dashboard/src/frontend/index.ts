import type { AppFrontendPlugin } from '@rahataid/plugin-sdk'
import { DashboardPage } from './dashboard-page.js'

export const DashboardFrontendPlugin: AppFrontendPlugin = {
  id: 'dashboard',
  label: 'Dashboard',
  description: 'Overview of key metrics, recent activity, and system health.',
  icon: 'LayoutDashboard',
  group: 'core',
  route: '/',
  PageComponent: DashboardPage,
}
