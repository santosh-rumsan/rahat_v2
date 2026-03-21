import * as React from 'react'
import type { CommDetailsProps } from '@rahataid/projects-shared/communication'

interface VoiceData {
  script: string
  audioUrl: string
  language: string
}

function getVoiceData(data: Record<string, unknown>): VoiceData {
  return {
    script: (data.script as string) ?? '',
    audioUrl: (data.audioUrl as string) ?? '',
    language: (data.language as string) ?? '',
  }
}

export function VoiceDetails({ data, onChange }: CommDetailsProps) {
  const voice = getVoiceData(data)

  function update(patch: Partial<VoiceData>) {
    onChange({ ...voice, ...patch })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Voice call details</h2>
        <p className="text-sm text-slate-500 mt-1">Provide a script or audio URL for the voice message.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Script <span className="text-rose-500">*</span>
          </label>
          <textarea
            placeholder="Write the voice message script…"
            value={voice.script}
            onChange={(e) => update({ script: e.currentTarget.value })}
            rows={5}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
            autoFocus
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Audio URL</label>
          <input
            type="text"
            placeholder="https://… (optional pre-recorded audio)"
            value={voice.audioUrl}
            onChange={(e) => update({ audioUrl: e.currentTarget.value })}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Language</label>
          <input
            type="text"
            placeholder="e.g. Nepali, English"
            value={voice.language}
            onChange={(e) => update({ language: e.currentTarget.value })}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )
}
