import * as React from 'react'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { cn } from '@rs/ui'

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-0', className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'relative flex items-end gap-6 px-8',
        'after:absolute after:bottom-0 after:left-7 after:right-8 after:h-px after:bg-foreground/50',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'relative pb-2 text-sm text-muted-foreground cursor-pointer select-none',
        'hover:text-foreground transition-colors',
        'focus-visible:outline-none',
        'data-[state=active]:text-foreground data-[state=active]:font-medium',
        'data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-1/2',
        'data-[state=active]:after:-translate-x-1/2 data-[state=active]:after:translate-y-1/2 data-[state=active]:after:z-10',
        'data-[state=active]:after:w-[10px] data-[state=active]:after:h-[10px]',
        'data-[state=active]:after:bg-background',
        'data-[state=active]:after:border-b data-[state=active]:after:border-r data-[state=active]:after:border-foreground/50',
        'data-[state=active]:after:rotate-45',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('mt-4 focus-visible:outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
