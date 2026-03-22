import type { ProjectFrontendPlugin } from '@rahataid/plugin-sdk'
import { PROJECT_TYPES } from '@rahataid/plugin-sdk'
import { MicrolearningSetupPage } from './setup-page.js'
import { MicrolearningDashboardPage } from './dashboard.js'

export const MicrolearningFrontendPlugin: ProjectFrontendPlugin = {
  projectType: PROJECT_TYPES.MICROLEARNING,
  label: 'Microlearning',
  description: 'Deliver learning content to beneficiaries',
  icon: 'BookOpen',
  menuItems: [
    { type: 'link', label: 'Tasks', href: '/projects/:projectId/tasks' },
    { type: 'link', label: 'Communication', href: '/projects/:projectId/communication' },
    { type: 'link', label: 'Reports', href: '/projects/:projectId/reports' },
  ],
  SetupPage: MicrolearningSetupPage,
  DashboardPage: MicrolearningDashboardPage,
}
