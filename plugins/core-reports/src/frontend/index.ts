import type { AppFrontendPlugin } from '@rahataid/plugin-sdk'
import { ReportsPage } from './reports-page.js'

export const ReportsFrontendPlugin: AppFrontendPlugin = {
  id: 'reports',
  label: 'Reports',
  description: 'Generate and export reports on project outcomes and impact.',
  icon: 'BarChart3',
  group: 'core',
  route: '/reports',
  PageComponent: ReportsPage,
}

export { ReportsPage } from './reports-page.js'
