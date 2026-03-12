import type { ProjectFrontendPlugin } from '@rahataid/plugin-sdk'
import { PROJECT_TYPES } from '@rahataid/plugin-sdk'
import { BeneficiarySetupPage } from './setup-page.js'

export const BeneficiaryWebPlugin: ProjectFrontendPlugin = {
  projectType: PROJECT_TYPES.BENEFICIARY_MANAGEMENT,
  label: 'Beneficiary Management',
  description: 'Manage and track project beneficiaries',
  icon: 'Users',
  SetupPage: BeneficiarySetupPage,
}
