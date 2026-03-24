import * as React from 'react'
import { Button } from '@rs/ui/button'
import { Card, CardContent } from '@rs/ui/card'
import type { TriggerStatement } from '@rahataid/sdk'
import { useUpdateTriggerStatement } from './queries.js'

interface TriggerConfigureProps {
  statement: TriggerStatement
  projectId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function TriggerConfigure({ statement, projectId, onSuccess, onCancel }: TriggerConfigureProps) {
  const [mandatory, setMandatory] = React.useState(statement.mandatoryThreshold)
  const [optional, setOptional] = React.useState(statement.optionalThreshold)
  const updateStatement = useUpdateTriggerStatement(projectId)

  function handleReset() {
    setMandatory(statement.mandatoryThreshold)
    setOptional(statement.optionalThreshold)
  }

  function handleConfigure() {
    updateStatement.mutate(
      { id: statement.id, data: { mandatoryThreshold: mandatory, optionalThreshold: optional } },
      { onSuccess: () => onSuccess?.() },
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Configure {statement.phase.charAt(0) + statement.phase.slice(1).toLowerCase()} Phase
        </h1>
        <p className="text-sm text-slate-500">Set up your trigger statement</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-5 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Mandatory</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                value={mandatory}
                onChange={(e) => setMandatory(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Optional</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                value={optional}
                onChange={(e) => setOptional(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { handleReset(); onCancel?.() }}>
              Reset
            </Button>
            <Button onClick={handleConfigure} disabled={updateStatement.isPending}>
              {updateStatement.isPending ? 'Saving…' : 'Configure'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
