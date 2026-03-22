import { createFileRoute } from '@tanstack/react-router'
import { PluginGate } from '../components/plugin-gate'

export const Route = createFileRoute('/_app/funds')({ component: () => <PluginGate pluginId="fund-management" /> })
