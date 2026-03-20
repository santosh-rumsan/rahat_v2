import { registerTaskType } from '../registry.js'
import { SmsDesigner } from './sms-designer.js'

registerTaskType({
  type: 'sms',
  label: 'SMS Message',
  designerTabLabel: 'SMS Message',
  designer: SmsDesigner,
})
