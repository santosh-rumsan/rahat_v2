import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import * as React from 'react'
import { getRegisteredPlugins, getPlugin } from '../plugins'
import { loadSettings } from '../lib/settings-store'

export const Route = createFileRoute('/_app/projects/new')({ component: NewProject })

type Step = 'select-type' | 'setup'

function NewProject() {
  const navigate = useNavigate()
  const [step, setStep] = React.useState<Step>('select-type')
  const [selectedType, setSelectedType] = React.useState<string | null>(null)
  const { enabledProjectTypes } = loadSettings()
  const allPlugins = getRegisteredPlugins()
  const plugins = enabledProjectTypes === null
    ? allPlugins
    : allPlugins.filter((p) => enabledProjectTypes.includes(p.projectType))

  function handleSelectType(projectType: string) {
    setSelectedType(projectType)
    setStep('setup')
  }

  function handleSetupSubmit(data: Record<string, unknown>) {
    // TODO: call API to create project
    console.log('Create project', { type: selectedType, ...data })
    navigate({ to: '/projects' })
  }

  const plugin = selectedType ? getPlugin(selectedType) : null

  const title = step === 'select-type' ? 'New Project' : (plugin?.label ?? 'New Project')

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={() =>
            step === 'setup' ? setStep('select-type') : navigate({ to: '/projects' })
          }
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {step === 'select-type' && (
            <p className="text-sm text-gray-500 mt-0.5">Choose the type of project to create.</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-8 max-w-lg">
        {step === 'select-type' && (
          <div className="flex flex-col gap-3">
            {plugins.map((p) => (
              <button
                key={p.projectType}
                onClick={() => handleSelectType(p.projectType)}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-colors text-left group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-orange-700">
                    {p.label}
                  </p>
                  {p.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
                  )}
                </div>
              </button>
            ))}
            {plugins.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-12">
                No project types registered.
              </p>
            )}
          </div>
        )}

        {step === 'setup' && plugin && (
          <plugin.SetupPage onSubmit={handleSetupSubmit} />
        )}
      </div>
    </div>
  )
}
