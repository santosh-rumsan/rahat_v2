import { registerTaskType } from '../registry.js'
import { BenefitDistributionDesigner } from './benefit-distribution-designer.js'

registerTaskType({
  type: 'benefit-distribution',
  label: 'Benefit Distribution',
  designerTabLabel: 'Benefit Selection',
  designer: BenefitDistributionDesigner,
})
