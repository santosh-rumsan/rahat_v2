import { Droplets } from 'lucide-react'
import { registerBenefitType } from '@rahataid/projects-shared/benefits'
import type { BenefitFrontendPlugin } from '@rahataid/projects-shared/benefits'

export const benefitsWashPlugin: BenefitFrontendPlugin = {
  type: 'WASH',
  label: 'WASH',
  description: 'Water, sanitation and hygiene supplies',
  group: 'benefits',
  IconComponent: Droplets,
  color: 'text-blue-500',
  bg: 'bg-blue-100',
}

registerBenefitType(benefitsWashPlugin)
