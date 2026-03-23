import type { ProjectFrontendPlugin } from '@rahataid/plugin-sdk'
import { PROJECT_TYPES } from '@rahataid/plugin-sdk'
import { AaSetupPage } from './setup-page.js'
import { AaDashboardPage } from './dashboard.js'

export const AaFrontendPlugin: ProjectFrontendPlugin = {
  projectType: PROJECT_TYPES.ANTICIPATORY_ACTION,
  label: 'Anticipatory Action',
  description: 'Take anticipatory actions before disasters strike',
  icon: 'Shield',
  taskGroups: ['General', 'Readiness', 'Preparedness', 'Activation'],
  menuItems: [
    { type: 'link', label: 'Benefits', href: '/projects/:projectId/benefits', requiredPluginGroup: 'benefits' },
    { type: 'link', label: 'Tasks', href: '/projects/:projectId/tasks' },
    { type: 'link', label: 'Funds', href: '/projects/:projectId/funds' },
    { type: 'link', label: 'Communication', href: '/projects/:projectId/communication' },
    { type: 'link', label: 'Reports', href: '/projects/:projectId/reports' },
  ],
  SetupPage: AaSetupPage,
  DashboardPage: AaDashboardPage,
}
