import { registerTaskType } from '@rahataid/projects-shared/task-management'
import type { TaskFrontendPlugin } from '@rahataid/projects-shared/task-management'
import { SmsDesigner } from './sms-designer.js'

export const taskSmsPlugin: TaskFrontendPlugin = {
  type: 'sms',
  label: 'SMS Message',
  description: 'Send automated SMS notifications to beneficiaries.',
  icon: 'MessageSquare',
  group: 'task',
  designerTabLabel: 'SMS Message',
  designer: SmsDesigner,
}

registerTaskType(taskSmsPlugin)
