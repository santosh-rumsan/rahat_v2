import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { getAppPlugin } from '../plugins'
import { PluginGate } from '../components/plugin-gate'

export const Route = createFileRoute('/_app/')({
  component: () => {
    const plugin = getAppPlugin('dashboard')
    const Page = plugin?.PageComponent as React.ComponentType | undefined
    return (
      <PluginGate pluginId="dashboard">
        {Page ? <Page /> : null}
      </PluginGate>
    )
  },
})
