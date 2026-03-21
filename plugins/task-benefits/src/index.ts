import { registerTaskType } from '@rahataid/projects-shared/task-management'
import type { TaskFrontendPlugin } from '@rahataid/projects-shared/task-management'
import { BenefitDistributionDesigner } from './benefit-distribution-designer.js'

export const taskBenefitsPlugin: TaskFrontendPlugin = {
  type: 'benefit-distribution',
  label: 'Benefit Distribution',
  description: 'Distribute benefits and aid packages to selected beneficiaries.',
  icon: 'Gift',
  group: 'task',
  designerTabLabel: 'Benefit Selection',
  designer: BenefitDistributionDesigner,
}

registerTaskType(taskBenefitsPlugin)
