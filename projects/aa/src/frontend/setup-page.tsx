import * as React from 'react'
import type { SetupPageProps } from '@rahataid/plugin-sdk'

export function AaSetupPage({ onSubmit }: SetupPageProps) {
  const [name, setName] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [image, setImage] = React.useState('')
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')
  const [projectOwner, setProjectOwner] = React.useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim() && location.trim() && image.trim() && startDate && endDate && projectOwner.trim()) {
      onSubmit({ name: name.trim(), location: location.trim(), image: image.trim(), startDate, endDate, projectOwner: projectOwner.trim() })
    }
  }

  const isValid = name.trim() && location.trim() && image.trim() && startDate && endDate && projectOwner.trim()

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
      <div className="flex flex-col gap-1.5">
        <label htmlFor="aa-location" className="text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          id="aa-location"
          type="text"
          placeholder="e.g. Terai Region, Nepal"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="aa-image" className="text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          id="aa-image"
          type="url"
          placeholder="https://..."
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="aa-start-date" className="text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          id="aa-start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="aa-end-date" className="text-sm font-medium text-gray-700">
          End Date
        </label>
        <input
          id="aa-end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="aa-project-owner" className="text-sm font-medium text-gray-700">
          Project Owner
        </label>
        <input
          id="aa-project-owner"
          type="text"
          placeholder="e.g. Jane Doe"
          value={projectOwner}
          onChange={(e) => setProjectOwner(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50"
        />
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
