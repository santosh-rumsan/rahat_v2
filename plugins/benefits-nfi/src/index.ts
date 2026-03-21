import { Box } from 'lucide-react'
import { registerBenefitType } from '@rahataid/projects-shared/benefits'
import type { BenefitFrontendPlugin } from '@rahataid/projects-shared/benefits'

export const benefitsNfiPlugin: BenefitFrontendPlugin = {
  type: 'NFI',
  label: 'NFI',
  description: 'Non-food items and household essentials',
  group: 'benefits',
  IconComponent: Box,
  color: 'text-purple-500',
  bg: 'bg-purple-100',
}

registerBenefitType(benefitsNfiPlugin)
