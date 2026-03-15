import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { Check } from 'lucide-react'
import { getRegisteredPlugins } from '../plugins'
import {
  ALL_BLOCKCHAINS,
  AppSettings,
  loadSettings,
  saveSettings,
} from '../lib/settings-store'
import {
  COLOR_THEMES,
  ColorTheme,
  loadColorTheme,
  saveColorTheme,
} from '../lib/color-theme-store'

export const Route = createFileRoute('/_app/settings')({ component: SettingsPage })

type Tab = 'general' | 'project'

function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>('general')
  const [settings, setSettings] = React.useState<AppSettings>(loadSettings)
  const plugins = getRegisteredPlugins()

  function update(next: AppSettings) {
    setSettings(next)
    saveSettings(next)
  }

  function toggleProjectType(projectType: string) {
    const current = settings.enabledProjectTypes ?? plugins.map((p) => p.projectType)
    const next = current.includes(projectType)
      ? current.filter((t) => t !== projectType)
      : [...current, projectType]
    update({
      ...settings,
      enabledProjectTypes: next.length === plugins.length ? null : next,
    })
  }

  function toggleBlockchain(chain: string) {
    const next = settings.enabledBlockchains.includes(chain)
      ? settings.enabledBlockchains.filter((c) => c !== chain)
      : [...settings.enabledBlockchains, chain]
    update({ ...settings, enabledBlockchains: next })
  }

  function isProjectTypeEnabled(projectType: string) {
    return settings.enabledProjectTypes === null || settings.enabledProjectTypes.includes(projectType)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your application preferences.</p>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Tab sidebar */}
        <div className="w-48 border-r border-gray-100 py-6 px-3 flex flex-col gap-1 flex-shrink-0">
          <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')}>
            General
          </TabButton>
          <TabButton active={activeTab === 'project'} onClick={() => setActiveTab('project')}>
            Project Settings
          </TabButton>
        </div>

        {/* Tab content */}
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          {activeTab === 'general' && <GeneralTab />}
          {activeTab === 'project' && (
            <ProjectSettingsTab
              plugins={plugins}
              settings={settings}
              isProjectTypeEnabled={isProjectTypeEnabled}
              onToggleProjectType={toggleProjectType}
              onToggleBlockchain={toggleBlockchain}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-brand-50 text-brand-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}

function GeneralTab() {
  const [colorTheme, setColorThemeState] = React.useState<ColorTheme>(loadColorTheme)

  function handleThemeChange(theme: ColorTheme) {
    setColorThemeState(theme)
    saveColorTheme(theme)
  }

  return (
    <div className="max-w-lg flex flex-col gap-8">
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">Appearance</h2>
        <p className="text-sm text-gray-500 mb-4">Choose an accent color for the interface.</p>
        <div className="flex flex-wrap gap-3">
          {COLOR_THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              title={t.label}
              className="flex flex-col items-center gap-1.5 group"
            >
              <span
                className="relative w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: t.swatch }}
              >
                {colorTheme === t.id && (
                  <Check size={16} className="text-white" strokeWidth={3} />
                )}
              </span>
              <span
                className={`text-xs font-medium ${
                  colorTheme === t.id ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function ProjectSettingsTab({
  plugins,
  settings,
  isProjectTypeEnabled,
  onToggleProjectType,
  onToggleBlockchain,
}: {
  plugins: ReturnType<typeof getRegisteredPlugins>
  settings: AppSettings
  isProjectTypeEnabled: (t: string) => boolean
  onToggleProjectType: (t: string) => void
  onToggleBlockchain: (c: string) => void
}) {
  return (
    <div className="max-w-lg flex flex-col gap-8">
      {/* Project types */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">Enabled Project Types</h2>
        <p className="text-sm text-gray-500 mb-4">
          Only enabled project types will be available when creating a new project.
        </p>
        <div className="flex flex-col gap-2">
          {plugins.map((p) => (
            <label
              key={p.projectType}
              className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors"
            >
              <input
                type="checkbox"
                className="mt-0.5 accent-brand-500"
                checked={isProjectTypeEnabled(p.projectType)}
                onChange={() => onToggleProjectType(p.projectType)}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{p.label}</p>
                {p.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
                )}
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Blockchains */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">Allowed Blockchains</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select the blockchain networks available in this deployment.
        </p>
        <div className="flex flex-col gap-2">
          {ALL_BLOCKCHAINS.map((chain) => (
            <label
              key={chain}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors"
            >
              <input
                type="checkbox"
                className="accent-brand-500"
                checked={settings.enabledBlockchains.includes(chain)}
                onChange={() => onToggleBlockchain(chain)}
              />
              <span className="text-sm font-medium text-gray-900">{chain}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  )
}
