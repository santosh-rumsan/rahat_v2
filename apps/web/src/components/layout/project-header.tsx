import * as React from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { MenuItem } from '@rahataid/plugin-sdk'

interface ProjectHeaderProps {
  projectId: string
  projectName?: string
  menuItems?: Array<MenuItem>
  onBack: () => void
}

export function ProjectHeader({ projectId, projectName, menuItems = [], onBack }: ProjectHeaderProps) {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!openDropdown) return
    const close = () => setOpenDropdown(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [openDropdown])

  return (
    <header className="flex items-center gap-4 px-6 h-14 border-b border-gray-200 bg-[#f0f0f0] shrink-0">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={16} />
        <span></span>
      </button>

      <nav className="flex items-center gap-1">
        <Link
          to="/projects/$id"
          params={{ id: projectId }}
          className="px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
          activeProps={{ className: 'px-3 py-1.5 text-sm text-gray-900 bg-gray-100 rounded-md font-medium' }}
          activeOptions={{ exact: true }}
        >
          Overview
        </Link>

        <Link
          to="/projects/$id/beneficiaries"
          params={{ id: projectId }}
          className="px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
          activeProps={{ className: 'px-3 py-1.5 text-sm text-gray-900 bg-gray-100 rounded-md font-medium' }}
        >
          Beneficiaries
        </Link>

        <Link
          to="/projects/$id/project-management"
          params={{ id: projectId }}
          className="px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
          activeProps={{ className: 'px-3 py-1.5 text-sm text-gray-900 bg-gray-100 rounded-md font-medium' }}
          activeOptions={{ exact: true }}
        >
          Project Management
        </Link>

        <Link
          to="/projects/$id/project-management/add-task"
          params={{ id: projectId }}
          className="px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
          activeProps={{ className: 'px-3 py-1.5 text-sm text-gray-900 bg-gray-100 rounded-md font-medium' }}
        >
          Add Task
        </Link>

        {menuItems.map((item) => {
          if (item.type === 'link') {
            return (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </a>
            )
          }

          // dropdown
          const isOpen = openDropdown === item.label
          return (
            <div key={item.label} className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenDropdown(isOpen ? null : item.label)
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {item.label}
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-1 min-w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
                >
                  {item.items.map((sub) => (
                    <a
                      key={sub.href}
                      href={sub.href}
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      {sub.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {projectName ? (
        <>
          <div className="ml-auto w-px h-4 bg-gray-200" />
          <span className="text-sm font-semibold text-gray-900 truncate">{projectName}</span>
        </>
      ) : null}
    </header>
  )
}
