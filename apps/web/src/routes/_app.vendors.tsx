import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { getAppPlugin } from '../plugins'

export const Route = createFileRoute('/_app/vendors')({
  component: () => {
    const plugin = getAppPlugin('vendors')
    if (!plugin) return null
    const Page = plugin.PageComponent as React.ComponentType
    return <Page />
  },
})
