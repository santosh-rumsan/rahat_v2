import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { getAppPlugin } from '../plugins'

export const Route = createFileRoute('/_app/')({
  component: () => {
    const plugin = getAppPlugin('dashboard')
    if (!plugin) return null
    const Page = plugin.PageComponent as React.ComponentType
    return <Page />
  },
})
