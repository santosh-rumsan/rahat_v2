import * as React from 'react'
import type { SetupPageProps } from '@rahataid/plugin-sdk'

export function BeneficiarySetupPage({ onSubmit }: SetupPageProps) {
  const [name, setName] = React.useState('')
  const [endDate, setEndDate] = React.useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim() && endDate) onSubmit({ name: name.trim(), endDate })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bm-project-name" className="text-sm font-medium text-gray-700">
          Project Name
        </label>
        <input
          id="bm-project-name"
          type="text"
          placeholder="e.g. Flood Recovery Program"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bm-end-date" className="text-sm font-medium text-gray-700">
          End Date
        </label>
        <input
          id="bm-end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
        />
      </div>
      <button
        type="submit"
        disabled={!name.trim() || !endDate}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        Create Project
      </button>
    </form>
  )
}
