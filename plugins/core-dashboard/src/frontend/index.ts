import type { AppFrontendPlugin } from '@rahataid/plugin-sdk'
import { DashboardPage } from './dashboard-page.js'

export const DashboardFrontendPlugin: AppFrontendPlugin = {
  id: 'dashboard',
  label: 'Dashboard',
  route: '/',
  PageComponent: DashboardPage,
}
