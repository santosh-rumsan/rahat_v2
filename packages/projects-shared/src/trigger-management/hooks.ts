import type { Trigger, TriggerStatement } from '@rahataid/sdk'
import type { TriggerStatementStats } from './types.js'

export function computeStats(statement: TriggerStatement, triggers: Trigger[]): TriggerStatementStats {
  const statementTriggers = triggers.filter((t) => t.statementId === statement.id)
  const mandatory = statementTriggers.filter((t) => !t.isOptional)
  const optional = statementTriggers.filter((t) => t.isOptional)

  return {
    total: statementTriggers.length,
    triggered: statementTriggers.filter((t) => t.status === 'triggered').length,
    mandatoryTotal: mandatory.length,
    mandatoryTriggered: mandatory.filter((t) => t.status === 'triggered').length,
    optionalTotal: optional.length,
    optionalTriggered: optional.filter((t) => t.status === 'triggered').length,
  }
}

export function isStatementMet(statement: TriggerStatement, stats: TriggerStatementStats): boolean {
  return (
    stats.mandatoryTriggered >= statement.mandatoryThreshold &&
    stats.optionalTriggered >= statement.optionalThreshold
  )
}
