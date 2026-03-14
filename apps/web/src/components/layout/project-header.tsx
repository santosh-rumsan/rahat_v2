import * as React from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { MenuItem } from '@rahataid/plugin-sdk'
import { PROJECT_TYPES } from '@rahataid/plugin-sdk'

interface ProjectHeaderProps {
  projectId: string
  projectName?: string
  projectType?: string
  menuItems?: Array<MenuItem>
  onBack: () => void
}

export function ProjectHeader({ projectId, projectName, projectType, menuItems = [], onBack }: ProjectHeaderProps) {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!openDropdown) return
    const close = () => setOpenDropdown(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [openDropdown])

  const isBeneficiariesOpen = openDropdown === 'beneficiaries'
  const isBenefitsOpen = openDropdown === 'benefits'
  const isCva = projectType === PROJECT_TYPES.CVA

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

        {/* Beneficiaries dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setOpenDropdown(isBeneficiariesOpen ? null : 'beneficiaries')
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Beneficiaries
            <ChevronDown size={14} className={`transition-transform ${isBeneficiariesOpen ? 'rotate-180' : ''}`} />
          </button>
          {isBeneficiariesOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-full mt-1 min-w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
            >
              <Link
                to="/projects/$id/beneficiaries"
                params={{ id: projectId }}
                onClick={() => setOpenDropdown(null)}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                activeProps={{ className: 'block px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50' }}
                activeOptions={{ exact: true }}
              >
                All Beneficiaries
              </Link>
              <Link
                to="/projects/$id/beneficiaries/groups"
                params={{ id: projectId }}
                search={{ group: undefined }}
                onClick={() => setOpenDropdown(null)}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                activeProps={{ className: 'block px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50' }}
              >
                Groups
              </Link>
            </div>
          )}
        </div>

        {/* Benefits dropdown — CVA only */}
        {isCva && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setOpenDropdown(isBenefitsOpen ? null : 'benefits')
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Benefits
              <ChevronDown size={14} className={`transition-transform ${isBenefitsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isBenefitsOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full mt-1 min-w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
              >
                <Link
                  to="/projects/$id/benefits"
                  params={{ id: projectId }}
                  search={{ benefit: undefined }}
                  onClick={() => setOpenDropdown(null)}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  activeProps={{ className: 'block px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50' }}
                  activeOptions={{ exact: true }}
                >
                  Benefit Catalog
                </Link>
                <Link
                  to="/projects/$id/benefits/tokens"
                  params={{ id: projectId }}
                  search={{ benefit: undefined }}
                  onClick={() => setOpenDropdown(null)}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  activeProps={{ className: 'block px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50' }}
                >
                  Token Management
                </Link>
              </div>
            )}
          </div>
        )}

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
