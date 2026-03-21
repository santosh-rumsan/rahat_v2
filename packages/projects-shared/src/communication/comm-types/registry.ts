import * as React from 'react'

export interface CommDetailsProps {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}

export interface CommTypeDefinition {
  type: string
  label: string
  description?: string
  group: 'comms'
  IconComponent?: React.ComponentType<{ className?: string }>
  DetailsComponent?: React.ComponentType<CommDetailsProps>
  /** Return true if the details are complete enough to advance to the next step */
  canAdvance?: (data: Record<string, unknown>) => boolean
}

/** Alias used by communication plugins */
export type CommFrontendPlugin = CommTypeDefinition

const registry = new Map<string, CommTypeDefinition>()

export function registerCommType(def: CommTypeDefinition): void {
  registry.set(def.type, def)
}

export function getCommTypeDefinition(type: string): CommTypeDefinition | undefined {
  return registry.get(type)
}

export function getRegisteredCommTypes(): CommTypeDefinition[] {
  return Array.from(registry.values())
}
