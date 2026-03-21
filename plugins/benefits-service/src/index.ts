import { Briefcase } from 'lucide-react'
import { registerBenefitType } from '@rahataid/projects-shared/benefits'
import type { BenefitFrontendPlugin } from '@rahataid/projects-shared/benefits'

export const benefitsServicePlugin: BenefitFrontendPlugin = {
  type: 'Service',
  label: 'Service',
  description: 'Service vouchers and skill-based assistance',
  group: 'benefits',
  IconComponent: Briefcase,
  color: 'text-rose-500',
  bg: 'bg-rose-100',
}

registerBenefitType(benefitsServicePlugin)
