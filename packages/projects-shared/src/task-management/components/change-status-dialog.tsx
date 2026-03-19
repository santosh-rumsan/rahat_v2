import * as React from 'react'
import { Button } from '@rs/ui/button'
import { Textarea } from '@rs/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@rs/ui/dialog'
import { type TaskStatus, TASK_STATUSES } from '../types.js'
import { FormSelect } from './form-select.js'

export function ChangeStatusDialog({
  open,
  onOpenChange,
  taskTitle,
  currentStatus,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskTitle: string
  currentStatus: TaskStatus
  onSubmit: (status: TaskStatus, notes: string, fileName?: string) => void
}) {
  const [status, setStatus] = React.useState<TaskStatus>(currentStatus)
  const [notes, setNotes] = React.useState('')
  const [fileName, setFileName] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    if (open) {
      setStatus(currentStatus)
      setNotes('')
      setFileName(undefined)
    }
  }, [open, currentStatus])

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    onSubmit(status, notes, fileName)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
          <DialogDescription className="truncate">{taskTitle}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <FormSelect
            label="New Status"
            value={status}
            options={TASK_STATUSES}
            onChange={(v) => setStatus(v as TaskStatus)}
            required
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this status change..."
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Attach file</label>
            <input
              type="file"
              onChange={(e) => setFileName(e.target.files?.[0]?.name)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
            />
            {fileName && (
              <p className="text-xs text-slate-500">Selected: {fileName}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-orange-500 text-white hover:bg-orange-600">Update Status</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
