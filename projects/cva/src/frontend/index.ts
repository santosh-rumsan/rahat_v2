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
    { type: 'link', label: 'Vouchers', href: '#vouchers' },
    { type: 'link', label: 'Reports', href: '#reports' },
  ],
  SetupPage: CvaSetupPage,
  DashboardPage: CvaDashboardPage,
}
