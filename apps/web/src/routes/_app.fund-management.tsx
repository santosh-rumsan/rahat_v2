import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { getAppPlugin } from '../plugins'

export const Route = createFileRoute('/_app/fund-management')({
  component: () => {
    const plugin = getAppPlugin('fund-management')
    if (!plugin) return null
    const Page = plugin.PageComponent as React.ComponentType
    return <Page />
  },
})
