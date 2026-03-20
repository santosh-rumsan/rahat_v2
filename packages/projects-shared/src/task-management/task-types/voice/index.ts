import { registerTaskType } from '../registry.js'
import { VoiceDesigner } from './voice-designer.js'

registerTaskType({
  type: 'voice',
  label: 'Voice Message',
  designerTabLabel: 'Voice Message',
  designer: VoiceDesigner,
})
