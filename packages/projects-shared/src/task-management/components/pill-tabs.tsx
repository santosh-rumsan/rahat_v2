import * as React from 'react'
import { cn } from '@rs/ui'
import { Info, ScrollText, FolderOpen } from 'lucide-react'

export const PREVIEW_TABS = [
  { key: 'Info', icon: Info },
  { key: 'Logs', icon: ScrollText },
  { key: 'Documents', icon: FolderOpen },
] as const

export type PreviewTab = (typeof PREVIEW_TABS)[number]['key']

export function PillTabs({ children }: { children: (activeTab: PreviewTab) => React.ReactNode }) {
  const [active, setActive] = React.useState<PreviewTab>('Info')
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 py-2 border-t shrink-0">
        <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
          {PREVIEW_TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors',
                active === key ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <Icon className="size-3.5" />
              {key}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">{children(active)}</div>
    </div>
  )
}
