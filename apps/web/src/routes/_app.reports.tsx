import { createFileRoute } from '@tanstack/react-router'
import { PluginGate } from '../components/plugin-gate'

export const Route = createFileRoute('/_app/reports')({ component: () => <PluginGate pluginId="reports" /> })
