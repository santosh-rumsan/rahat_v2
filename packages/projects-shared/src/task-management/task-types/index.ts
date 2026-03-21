export * from './registry.js'

// Register the built-in default task type.
// Plugin task types (sms, voice, benefit-distribution) are registered by their
// respective plugin packages in /plugins/task-*.
import './default/index.js'
