import type { AppFrontendPlugin } from '@rahataid/plugin-sdk'
import { ReportsPage } from './reports-page.js'

export const ReportsFrontendPlugin: AppFrontendPlugin = {
  id: 'reports',
  label: 'Reports',
  route: '/reports',
  PageComponent: ReportsPage,
}

export { ReportsPage } from './reports-page.js'
