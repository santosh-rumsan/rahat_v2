import * as React from 'react'
import type { SetupPageProps } from '@rahataid/plugin-sdk'

const TOKENS = ['cUSD', 'cEUR', 'cNPR'] as const

export function CvaSetupPage({ onSubmit }: SetupPageProps) {
  const [name, setName] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [image, setImage] = React.useState('')
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')
  const [projectOwner, setProjectOwner] = React.useState('')
  const [primaryToken, setPrimaryToken] = React.useState<string>('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim() && location.trim() && image.trim() && startDate && endDate && projectOwner.trim() && primaryToken) {
      onSubmit({ name: name.trim(), location: location.trim(), image: image.trim(), startDate, endDate, projectOwner: projectOwner.trim(), primaryToken })
    }
  }

  const isValid = name.trim() && location.trim() && image.trim() && startDate && endDate && projectOwner.trim() && primaryToken

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cva-project-name" className="text-sm font-medium text-gray-700">
          Project Name
        </label>
        <input
          id="cva-project-name"
          type="text"
          placeholder="e.g. Nepal Earthquake Relief"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cva-location" className="text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          id="cva-location"
          type="text"
          placeholder="e.g. Kathmandu, Nepal"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cva-image" className="text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          id="cva-image"
          type="url"
          placeholder="https://..."
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cva-start-date" className="text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          id="cva-start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cva-end-date" className="text-sm font-medium text-gray-700">
          End Date
        </label>
        <input
          id="cva-end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cva-project-owner" className="text-sm font-medium text-gray-700">
          Project Owner
        </label>
        <input
          id="cva-project-owner"
          type="text"
          placeholder="e.g. Jane Doe"
          value={projectOwner}
          onChange={(e) => setProjectOwner(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Primary Token *
        </label>
        <p className="text-xs text-gray-400 -mt-1">Used to calculate rates for non-cash benefits.</p>
        <div className="flex gap-2">
          {TOKENS.map((token) => (
            <button
              key={token}
              type="button"
              onClick={() => setPrimaryToken(token)}
              className={
                primaryToken === token
                  ? 'flex-1 py-2 text-sm font-semibold rounded-lg border border-orange-400 bg-orange-50 text-orange-600 transition-colors'
                  : 'flex-1 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors'
              }
            >
              {token}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={!isValid}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        Create Project
      </button>
    </form>
  )
}
