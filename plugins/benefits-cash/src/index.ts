import { Banknote } from 'lucide-react'
import { registerBenefitType } from '@rahataid/projects-shared/benefits'
import type { BenefitFrontendPlugin } from '@rahataid/projects-shared/benefits'

export const benefitsCashPlugin: BenefitFrontendPlugin = {
  type: 'Cash',
  label: 'Cash',
  description: 'Cash transfers and monetary vouchers',
  group: 'benefits',
  IconComponent: Banknote,
  color: 'text-green-600',
  bg: 'bg-green-100',
}

registerBenefitType(benefitsCashPlugin)
