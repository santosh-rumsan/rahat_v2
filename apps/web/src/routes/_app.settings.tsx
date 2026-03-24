import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { Check, Trash2, Database } from 'lucide-react'
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
import {
  FONT_OPTIONS,
  AppFont,
  loadFont,
  saveFont,
} from '../lib/font-store'
import { getIsProd, setIsProd } from '@rahataid/sdk'
import { SampleDataDialog } from '../components/sample-data-import.js'

export const Route = createFileRoute('/_app/settings')({ component: SettingsPage })

type Tab = 'general' | 'project' | 'advanced'

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
          <TabButton active={activeTab === 'advanced'} onClick={() => setActiveTab('advanced')}>
            Advanced
          </TabButton>
        </div>

        {/* Tab content */}
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          {activeTab === 'general' && <GeneralTab />}
          {activeTab === 'advanced' && <AdvancedTab />}
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

async function clearAllCache() {
  localStorage.clear()
  const dbs = await indexedDB.databases?.()
  if (dbs) {
    await Promise.all(dbs.map((db) => db.name && indexedDB.deleteDatabase(db.name)))
  }
}

function GeneralTab() {
  const [colorTheme, setColorThemeState] = React.useState<ColorTheme>(loadColorTheme)
  const [font, setFontState] = React.useState<AppFont>(loadFont)

  function handleThemeChange(theme: ColorTheme) {
    setColorThemeState(theme)
    saveColorTheme(theme)
  }

  function handleFontChange(f: AppFont) {
    setFontState(f)
    saveFont(f)
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

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">Font</h2>
        <p className="text-sm text-gray-500 mb-4">Choose the interface font.</p>
        <div className="flex flex-col gap-2">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFontChange(f.id)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors text-left ${
                font === f.id
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 hover:border-brand-300 hover:bg-brand-50'
              }`}
            >
              <span
                className="text-sm text-gray-900"
                style={{ fontFamily: `'${f.family}', sans-serif` }}
              >
                {f.label}
              </span>
              {font === f.id && <Check size={16} className="text-brand-600" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </section>

    </div>
  )
}

function AdvancedTab() {
  const [isProd, setIsProdState] = React.useState<boolean>(getIsProd)
  const [pendingValue, setPendingValue] = React.useState<boolean | null>(null)
  const [showClearConfirm, setShowClearConfirm] = React.useState(false)
  const [cleared, setCleared] = React.useState(false)
  const [sampleDataOpen, setSampleDataOpen] = React.useState(false)

  async function handleConfirm() {
    if (pendingValue === null) return
    if (pendingValue === true) {
      // Turning prod ON: clear all local cache
      await clearAllCache()
    }
    setIsProd(pendingValue)
    setIsProdState(pendingValue)
    setPendingValue(null)
  }

  async function handleClearCache() {
    await clearAllCache()
    setShowClearConfirm(false)
    setCleared(true)
  }

  function handleToggle(value: boolean) {
    setPendingValue(value)
  }

  return (
    <div className="max-w-lg flex flex-col gap-8">
      <SampleDataDialog open={sampleDataOpen} onOpenChange={setSampleDataOpen} />

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">Environment</h2>
        <p className="text-sm text-gray-500 mb-4">
          Control whether this instance behaves as a production environment. When disabled,
          campaigns will be sent locally via the configured services in IndexedDB.
        </p>

        <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-900">Production mode</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {isProd
                ? 'Local campaign sending is disabled.'
                : 'Local campaign sending via idb services is active.'}
            </p>
          </div>
          <button
            role="switch"
            aria-checked={isProd}
            onClick={() => handleToggle(!isProd)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none ${
              isProd ? 'bg-brand-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                isProd ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </label>

        {pendingValue !== null && (
          <div className={`mt-3 flex flex-col gap-3 px-4 py-4 rounded-xl border ${
            pendingValue ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
          }`}>
            <p className={`text-sm font-medium ${pendingValue ? 'text-red-800' : 'text-yellow-800'}`}>
              {pendingValue
                ? 'Turning on production mode will clear all local cache (localStorage + IndexedDB). Are you sure?'
                : 'Turn off production mode? Local campaign sending via idb services will be re-enabled.'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                  pendingValue ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'
                }`}
              >
                {pendingValue ? 'Yes, enable production mode' : 'Yes, disable production mode'}
              </button>
              <button
                onClick={() => setPendingValue(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">Sample Data</h2>
        <p className="text-sm text-gray-500 mb-4">
          Quickly populate your local environment with sample vendors, users, services, forecast
          sources, and projects for development and testing.
        </p>
        <button
          onClick={() => setSampleDataOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Database size={15} />
          Import Sample Data
        </button>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Clearing the cache will remove all locally stored data including settings, preferences, and
          cached content. The page will need to be reloaded.
        </p>
        {cleared ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-green-200 bg-green-50 text-sm text-green-700">
            <Check size={16} strokeWidth={3} />
            Cache cleared. Please reload the page.
          </div>
        ) : showClearConfirm ? (
          <div className="flex flex-col gap-3 px-4 py-4 rounded-xl border border-red-200 bg-red-50">
            <p className="text-sm font-medium text-red-800">
              Are you sure? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClearCache}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Yes, clear cache
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-700 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} />
            Clear Cache
          </button>
        )}
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
