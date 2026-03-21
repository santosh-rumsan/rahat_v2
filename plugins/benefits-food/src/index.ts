import { Package } from 'lucide-react'
import { registerBenefitType } from '@rahataid/projects-shared/benefits'
import type { BenefitFrontendPlugin } from '@rahataid/projects-shared/benefits'

export const benefitsFoodPlugin: BenefitFrontendPlugin = {
  type: 'Food',
  label: 'Food',
  description: 'Food packages and nutritional supplies',
  group: 'benefits',
  IconComponent: Package,
  color: 'text-orange-500',
  bg: 'bg-orange-100',
}

registerBenefitType(benefitsFoodPlugin)
