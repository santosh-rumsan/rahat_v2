// A NestJS module class constructor
export type Constructor<T = object> = new (...args: any[]) => T

export interface ProjectBackendPlugin {
  projectType: string
  module: Constructor
}

export interface SetupPageProps {
  onSubmit: (data: { name: string } & Record<string, unknown>) => void
}

export interface ProjectSummary {
  id: string
  name: string
  status: string
  location: string
  beneficiaries: number
  budget: string
  image: string
  projectType: string
}

export interface DashboardPageProps {
  project: ProjectSummary
  onEdit?: () => void
}

export interface MenuLink {
  type: 'link'
  label: string
  icon?: string
  href: string
}

export interface MenuDropdown {
  type: 'dropdown'
  label: string
  icon?: string
  items: MenuLink[]
}

export type MenuItem = MenuLink | MenuDropdown

export interface ProjectFrontendPlugin {
  projectType: string
  label: string
  description?: string
  icon?: string
  menuItems?: MenuItem[]
  SetupPage: (props: SetupPageProps) => unknown
  DashboardPage?: (props: DashboardPageProps) => unknown
}

export interface AppFrontendPlugin {
  id: string
  label: string
  route: string
  PageComponent: () => unknown
}

export const PROJECT_TYPES = {
  CVA: 'CVA',
  BENEFICIARY_MANAGEMENT: 'BENEFICIARY_MANAGEMENT',
  MICROLEARNING: 'MICROLEARNING',
  ANTICIPATORY_ACTION: 'ANTICIPATORY_ACTION',
  MICROLOANS: 'MICROLOANS',
} as const

export type ProjectType = (typeof PROJECT_TYPES)[keyof typeof PROJECT_TYPES]
