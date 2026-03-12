import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Cloud } from 'lucide-react'
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

const activeClass = 'text-white bg-orange-500'
const inactiveClass = 'text-gray-400 hover:text-white'

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
      <div className="text-white mb-4">
        <span className="text-lg font-bold tracking-widest">···</span>
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
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 border border-[#1a1a1a] rounded-full text-[10px] flex items-center justify-center text-white">
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
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 border border-[#1a1a1a] rounded-full text-[10px] flex items-center justify-center text-white">
                {item.badge}
              </span>
            )}
          </button>
        )
      )}

      {/* Bottom */}
      <div className="mt-auto flex flex-col items-center gap-4">
        <button className="text-gray-400 hover:text-white p-2 rounded-lg">
          <Cloud size={18} />
        </button>
        {avatar && (
          <img
            src={avatar}
            alt="user"
            className="w-8 h-8 rounded-full object-cover"
          />
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
