import * as React from 'react'
import type { ProjectSummary } from '@rahataid/plugin-sdk'
import type { ProjectTask } from '../types.js'

export interface DesignerProps {
  project: ProjectSummary
  task: ProjectTask
  onUpdate: (designerData: Record<string, unknown>) => void
}

export interface TaskTypeDefinition {
  type: string
  label: string
  description?: string
  icon?: string
  group: 'task'
  designerTabLabel?: string
  designer?: React.ComponentType<DesignerProps>
}

/** Alias used by task plugins */
export type TaskFrontendPlugin = TaskTypeDefinition

const registry = new Map<string, TaskTypeDefinition>()

export function registerTaskType(def: TaskTypeDefinition): void {
  registry.set(def.type, def)
}

export function getTaskTypeDefinition(type: string): TaskTypeDefinition | undefined {
  return registry.get(type)
}

export function getRegisteredTaskTypes(): TaskTypeDefinition[] {
  return Array.from(registry.values())
}
