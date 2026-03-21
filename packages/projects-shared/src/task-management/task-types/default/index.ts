import { registerTaskType } from '../registry.js'

registerTaskType({
  type: 'default',
  label: 'Default',
  description: 'A general-purpose task with no special workflow.',
  group: 'task',
})
