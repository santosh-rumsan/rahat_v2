import type { ProjectFrontendPlugin } from '@rahataid/plugin-sdk'
import { PROJECT_TYPES } from '@rahataid/plugin-sdk'
import { BeneficiarySetupPage } from './setup-page.js'
import { BeneficiaryDashboardPage } from './dashboard.js'

export const BeneficiaryFrontendPlugin: ProjectFrontendPlugin = {
  projectType: PROJECT_TYPES.BENEFICIARY_MANAGEMENT,
  label: 'Beneficiary Management',
  description: 'Manage and track project beneficiaries',
  icon: 'Users',
  SetupPage: BeneficiarySetupPage,
  DashboardPage: BeneficiaryDashboardPage,
}
