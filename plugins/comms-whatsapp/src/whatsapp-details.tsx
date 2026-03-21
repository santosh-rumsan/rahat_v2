import * as React from 'react'
import type { CommDetailsProps } from '@rahataid/projects-shared/communication'

interface WhatsappData {
  message: string
  templateId: string
}

function getWhatsappData(data: Record<string, unknown>): WhatsappData {
  return {
    message: (data.message as string) ?? '',
    templateId: (data.templateId as string) ?? '',
  }
}

export function WhatsappDetails({ data, onChange }: CommDetailsProps) {
  const wa = getWhatsappData(data)

  function update(patch: Partial<WhatsappData>) {
    onChange({ ...wa, ...patch })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">WhatsApp details</h2>
        <p className="text-sm text-slate-500 mt-1">Write the WhatsApp message to send to beneficiaries.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Message <span className="text-rose-500">*</span>
          </label>
          <textarea
            placeholder="Enter the WhatsApp message…"
            value={wa.message}
            onChange={(e) => update({ message: e.currentTarget.value })}
            rows={5}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
            autoFocus
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Template ID</label>
          <input
            type="text"
            placeholder="WhatsApp template ID (optional)"
            value={wa.templateId}
            onChange={(e) => update({ templateId: e.currentTarget.value })}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )
}
