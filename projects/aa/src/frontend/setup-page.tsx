import * as React from 'react'
import type { SetupPageProps } from '@rahataid/plugin-sdk'

export function AaSetupPage({ onSubmit }: SetupPageProps) {
  const [name, setName] = React.useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim()) onSubmit({ name: name.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="aa-project-name" className="text-sm font-medium text-gray-700">
          Project Name
        </label>
        <input
          id="aa-project-name"
          type="text"
          placeholder="e.g. Flood Early Warning Response"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
          autoFocus
        />
      </div>
      <button
        type="submit"
        disabled={!name.trim()}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        Create Project
      </button>
    </form>
  )
}
