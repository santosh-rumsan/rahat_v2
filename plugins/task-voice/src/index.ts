import { registerTaskType } from '@rahataid/projects-shared/task-management'
import type { TaskFrontendPlugin } from '@rahataid/projects-shared/task-management'
import { VoiceDesigner } from './voice-designer.js'

export const taskVoicePlugin: TaskFrontendPlugin = {
  type: 'voice',
  label: 'Voice Message',
  description: 'Deliver automated voice call messages to beneficiaries.',
  icon: 'PhoneCall',
  group: 'task',
  designerTabLabel: 'Voice Message',
  designer: VoiceDesigner,
}

registerTaskType(taskVoicePlugin)
