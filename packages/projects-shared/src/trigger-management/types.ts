export type { TriggerStatement, Trigger, TriggerExecution, TriggerOperator, TriggerItemType, TriggerStatus } from '@rahataid/sdk'
export type { CreateTriggerStatementInput, UpdateTriggerStatementInput, CreateTriggerInput, UpdateTriggerInput } from '@rahataid/sdk'

// A trigger source defines an external data provider (e.g. GLOFAS, DHM)
// Projects configure which sources are available
export interface TriggerSource {
  id: string
  label: string
  unit: string
  // What dynamic fields this source exposes for configuration
  fields: TriggerSourceField[]
}

export interface TriggerSourceField {
  key: string
  label: string
  type: 'select' | 'number' | 'text'
  options?: { value: string; label: string }[]
  placeholder?: string
}

export const TRIGGER_OPERATORS: { value: string; label: string }[] = [
  { value: '>', label: 'Greater than (>)' },
  { value: '>=', label: 'Greater than or equal (>=)' },
  { value: '<', label: 'Less than (<)' },
  { value: '<=', label: 'Less than or equal (<=)' },
  { value: '=', label: 'Equal to (=)' },
]

// Computed stats for a trigger statement (derived, not stored)
export interface TriggerStatementStats {
  total: number
  triggered: number
  mandatoryTotal: number
  mandatoryTriggered: number
  optionalTotal: number
  optionalTriggered: number
}

export interface TriggerManagementConfig {
  projectId: string
  // Ordered list of phases/statements (e.g. ["ACTIVATION", "READINESS"])
  phases: string[]
  // Optional: river basin name shown in read-only fields
  riverBasin?: string
  // Available sources for automated triggers
  sources?: TriggerSource[]
  // Optional: map phase -> task group id
  phaseTaskGroups?: Record<string, string>
  // Navigate to trigger detail for a phase
  onViewDetails?: (phase: string, statementId: string) => void
  // Navigate to add trigger for a phase
  onAddTrigger?: (phase: string, statementId: string) => void
  // Called after threshold is configured
  onConfigured?: (statementId: string) => void
}
