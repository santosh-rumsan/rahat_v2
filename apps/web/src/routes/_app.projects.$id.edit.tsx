import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, MapPin, X } from 'lucide-react'
import { useProject, useUpdateProject } from '@rahataid/projects-shared'
import { LocationPicker } from '../components/location-picker'

export const Route = createFileRoute('/_app/projects/$id/edit')({ component: EditProject })

function EditProject() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject(id)
  const updateProject = useUpdateProject()

  const [name, setName] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [image, setImage] = React.useState('')
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')
  const [projectOwner, setProjectOwner] = React.useState('')
  const [longitude, setLongitude] = React.useState<number | undefined>(undefined)
  const [latitude, setLatitude] = React.useState<number | undefined>(undefined)
  const [showPicker, setShowPicker] = React.useState(false)

  React.useEffect(() => {
    if (project) {
      setName(project.name ?? '')
      setLocation(project.location ?? '')
      setImage(project.image ?? '')
      setStartDate(project.startDate ?? '')
      setEndDate(project.endDate ?? '')
      setProjectOwner(project.projectOwner ?? '')
      setLongitude(project.longitude)
      setLatitude(project.latitude)
      if (project.longitude != null && project.latitude != null) {
        setShowPicker(true)
      }
    }
  }, [project])

  function handleSubmit() {
    updateProject.mutate(
      {
        id,
        data: {
          name,
          location,
          image,
          startDate,
          endDate,
          projectOwner,
          longitude,
          latitude,
        },
      },
      { onSuccess: () => navigate({ to: '/projects/$id', params: { id } }) }
    )
  }

  const onBack = () => navigate({ to: '/projects/$id', params: { id } })

  function handleClearCoords() {
    setLongitude(undefined)
    setLatitude(undefined)
    setShowPicker(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Loading…
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Project not found.
      </div>
    )
  }

  const isValid = name.trim() && location.trim() && image.trim() && startDate && endDate && projectOwner.trim()

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Project</h1>
          <p className="text-sm text-gray-500 mt-0.5">{project.name}</p>
        </div>
      </div>

      <div className="flex-1 px-8 py-8 max-w-2xl">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-project-name" className="text-sm font-medium text-gray-700">
              Project Name
            </label>
            <input
              id="edit-project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-location" className="text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              id="edit-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50"
            />
          </div>

          {/* Map location picker */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Map Location <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="flex items-center gap-2">
                {longitude != null && latitude != null && (
                  <button
                    type="button"
                    onClick={handleClearCoords}
                    className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <X size={12} />
                    Clear
                  </button>
                )}
                {!showPicker && (
                  <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1 transition-colors"
                  >
                    <MapPin size={12} />
                    Set on map
                  </button>
                )}
              </div>
            </div>

            {longitude != null && latitude != null && (
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs text-gray-500">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 bg-gray-50"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs text-gray-500">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 bg-gray-50"
                  />
                </div>
              </div>
            )}

            {showPicker && (
              <LocationPicker
                longitude={longitude}
                latitude={latitude}
                onChange={({ longitude: lng, latitude: lat }) => {
                  setLongitude(parseFloat(lng.toFixed(6)))
                  setLatitude(parseFloat(lat.toFixed(6)))
                }}
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-image" className="text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              id="edit-image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-start-date" className="text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              id="edit-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-end-date" className="text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              id="edit-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-project-owner" className="text-sm font-medium text-gray-700">
              Project Owner
            </label>
            <input
              id="edit-project-owner"
              type="text"
              value={projectOwner}
              onChange={(e) => setProjectOwner(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || updateProject.isPending}
              className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {updateProject.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
