import type { ProjectFrontendPlugin } from '@rahataid/plugin-sdk'
import { PROJECT_TYPES } from '@rahataid/plugin-sdk'
import { CvaSetupPage } from './setup-page.js'
import { CvaDashboardPage } from './dashboard.js'

export const CvaFrontendPlugin: ProjectFrontendPlugin = {
  projectType: PROJECT_TYPES.CVA,
  label: 'Cash Voucher Assistance',
  description: 'Distribute cash vouchers to beneficiaries',
  icon: 'Wallet',
  menuItems: [
    { type: 'link', label: 'Benefits', href: '/projects/:projectId/benefits', requiredPluginGroup: 'benefits' },
    { type: 'link', label: 'Tasks', href: '/projects/:projectId/tasks' },
    { type: 'link', label: 'Funds', href: '/projects/:projectId/funds' },
    { type: 'link', label: 'Communication', href: '/projects/:projectId/communication' },
    { type: 'link', label: 'Reports', href: '/projects/:projectId/reports' },
  ],
  SetupPage: CvaSetupPage,
  DashboardPage: CvaDashboardPage,
}
