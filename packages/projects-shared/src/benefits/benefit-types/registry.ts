import * as React from 'react'

export interface BenefitTypeDefinition {
  type: string
  label: string
  description?: string
  group: 'benefits'
  IconComponent?: React.ComponentType<{ className?: string; size?: number }>
  color: string
  bg: string
}

/** Alias used by benefit type plugins */
export type BenefitFrontendPlugin = BenefitTypeDefinition

const registry = new Map<string, BenefitTypeDefinition>()

export function registerBenefitType(def: BenefitTypeDefinition): void {
  registry.set(def.type, def)
}

export function getBenefitTypeDefinition(type: string): BenefitTypeDefinition | undefined {
  return registry.get(type)
}

export function getRegisteredBenefitTypes(): BenefitTypeDefinition[] {
  return Array.from(registry.values())
}
