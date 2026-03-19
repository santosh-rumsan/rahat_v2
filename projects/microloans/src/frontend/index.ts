import type { ProjectFrontendPlugin } from '@rahataid/plugin-sdk'
import { PROJECT_TYPES } from '@rahataid/plugin-sdk'
import { MicroloansSetupPage } from './setup-page.js'
import { MicroloansDashboardPage } from './dashboard.js'

export const MicroloansFrontendPlugin: ProjectFrontendPlugin = {
  projectType: PROJECT_TYPES.MICROLOANS,
  label: 'Microloans',
  description: 'Provide small loans to beneficiaries',
  icon: 'CreditCard',
  menuItems: [
    { type: 'link', label: 'Tasks', href: '/projects/:projectId/project-management' },
  ],
  SetupPage: MicroloansSetupPage,
  DashboardPage: MicroloansDashboardPage,
}
