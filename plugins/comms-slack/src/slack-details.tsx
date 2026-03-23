import * as React from 'react'
import type { CommDetailsProps } from '@rahataid/projects-shared/communication'

interface SlackData {
  message: string
  channel: string
}

function getSlackData(data: Record<string, unknown>): SlackData {
  return {
    message: (data.message as string) ?? '',
    channel: (data.channel as string) ?? '',
  }
}

export function SlackDetails({ data, onChange }: CommDetailsProps) {
  const slack = getSlackData(data)

  function update(patch: Partial<SlackData>) {
    onChange({ ...slack, ...patch })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Slack details</h2>
        <p className="text-sm text-slate-500 mt-1">Write the Slack message to send to beneficiaries.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Message <span className="text-rose-500">*</span>
          </label>
          <textarea
            placeholder="Enter the Slack message…"
            value={slack.message}
            onChange={(e) => update({ message: e.currentTarget.value })}
            rows={5}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
            autoFocus
          />
          <p className="text-xs text-slate-400 mt-1">{slack.message.length} characters</p>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Channel</label>
          <input
            type="text"
            placeholder="e.g. #general or leave blank for default"
            value={slack.channel}
            onChange={(e) => update({ channel: e.currentTarget.value })}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )
}
