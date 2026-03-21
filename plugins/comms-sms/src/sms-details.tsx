import * as React from 'react'
import type { CommDetailsProps } from '@rahataid/projects-shared/communication'

interface SmsData {
  message: string
  senderId: string
}

function getSmsData(data: Record<string, unknown>): SmsData {
  return {
    message: (data.message as string) ?? '',
    senderId: (data.senderId as string) ?? '',
  }
}

export function SmsDetails({ data, onChange }: CommDetailsProps) {
  const sms = getSmsData(data)

  function update(patch: Partial<SmsData>) {
    onChange({ ...sms, ...patch })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">SMS details</h2>
        <p className="text-sm text-slate-500 mt-1">Write the SMS message to send to beneficiaries.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Message <span className="text-rose-500">*</span>
          </label>
          <textarea
            placeholder="Enter the SMS message…"
            value={sms.message}
            onChange={(e) => update({ message: e.currentTarget.value })}
            rows={5}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
            autoFocus
          />
          <p className="text-xs text-slate-400 mt-1">{sms.message.length} characters</p>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Sender ID</label>
          <input
            type="text"
            placeholder="e.g. RAHAT or leave blank for default"
            value={sms.senderId}
            onChange={(e) => update({ senderId: e.currentTarget.value })}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )
}
