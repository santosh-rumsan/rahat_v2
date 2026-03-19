import type { ProjectFrontendPlugin } from '@rahataid/plugin-sdk'
import { PROJECT_TYPES } from '@rahataid/plugin-sdk'
import { AaSetupPage } from './setup-page.js'
import { AaDashboardPage } from './dashboard.js'

export const AaFrontendPlugin: ProjectFrontendPlugin = {
  projectType: PROJECT_TYPES.ANTICIPATORY_ACTION,
  label: 'Anticipatory Action',
  description: 'Take anticipatory actions before disasters strike',
  icon: 'Shield',
  menuItems: [
    { type: 'link', label: 'Tasks', href: '/projects/:projectId/project-management' },
  ],
  SetupPage: AaSetupPage,
  DashboardPage: AaDashboardPage,
}
