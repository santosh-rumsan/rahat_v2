import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Settings, Puzzle } from 'lucide-react'
import { cn } from '@rs/ui'

export interface SidebarNavItem {
  icon: React.ReactNode
  /** TanStack Router route path – when provided, renders a <Link> with auto active state */
  to?: string
  badge?: number
  onClick?: () => void
}

export interface IconSidebarProps {
  navItems?: SidebarNavItem[]
  /** Avatar URL shown at the bottom */
  avatar?: string
  /** Footer label rendered vertically */
  footerLabel?: string
  className?: string
}

const activeClass = 'text-white bg-brand-500'
const inactiveClass = 'text-gray-400 hover:text-white'

function RahatLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      id="Layer_1"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 955.91 940.86"
      aria-hidden="true"
      {...props}
    >
      <title>Rahat</title>
      <polygon
        fill="currentColor"
        points="500.65 286.95 585.15 334.8 786.61 221.98 786.61 667.95 395.4 448.88 458 409.76 379.76 354.99 223.28 448.88 872.67 824.43 872.67 81.14 500.65 286.95"
      />
      <polygon
        fill="currentColor"
        points="506.05 510.84 614.48 448.88 223.28 221.98 223.28 667.95 380.26 582.35 458 636.65 137.21 824.43 137.21 81.14 786.61 448.88 591.01 558.41 506.05 510.84"
      />
    </svg>
  )
}

export function IconSidebar({
  navItems = [],
  avatar,
  footerLabel,
  className,
}: IconSidebarProps) {
  return (
    <div
      className={cn(
        'w-16 bg-[#1a1a1a] flex flex-col items-center py-4 gap-2 flex-shrink-0',
        className
      )}
    >
      {/* Logo */}
      <div className="text-white mb-4 flex h-10 w-10 items-center justify-center">
        <RahatLogo className="h-8 w-8 text-white" />
      </div>

      {/* Nav items */}
      {navItems.map((item, i) =>
        item.to ? (
          <Link
            key={i}
            to={item.to}
            className={cn('relative p-2.5 rounded-xl transition-colors', inactiveClass)}
            activeProps={{ className: cn('relative p-2.5 rounded-xl transition-colors', activeClass) }}
          >
            {item.icon}
            {item.badge != null && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 border border-[#1a1a1a] rounded-full text-[10px] flex items-center justify-center text-white">
                {item.badge}
              </span>
            )}
          </Link>
        ) : (
          <button
            key={i}
            onClick={item.onClick}
            className={cn('relative p-2.5 rounded-xl transition-colors', inactiveClass)}
          >
            {item.icon}
            {item.badge != null && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 border border-[#1a1a1a] rounded-full text-[10px] flex items-center justify-center text-white">
                {item.badge}
              </span>
            )}
          </button>
        )
      )}

      {/* Bottom */}
      <div className="mt-auto flex flex-col items-center gap-4">
        <Link
          to="/services"
          className={cn('p-2 rounded-lg transition-colors', inactiveClass)}
          activeProps={{ className: cn('p-2 rounded-lg transition-colors', activeClass) }}
        >
          <Puzzle size={16} />
        </Link>
        <Link
          to="/settings"
          className={cn('p-2 rounded-lg transition-colors', inactiveClass)}
          activeProps={{ className: cn('p-2 rounded-lg transition-colors', activeClass) }}
        >
          <Settings size={16} />
        </Link>
        {avatar && (
          <div className="flex flex-col items-center gap-2">
            <img
              src={avatar}
              alt="user"
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        )}
        {footerLabel && (
          <p
            className="text-[8px] text-gray-600"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {footerLabel}
          </p>
        )}
      </div>
    </div>
  )
}
