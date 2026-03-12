// A NestJS module class constructor
export type Constructor<T = object> = new (...args: any[]) => T

export interface ProjectBackendPlugin {
  projectType: string
  module: Constructor
}

export interface SetupPageProps {
  onSubmit: (data: { name: string } & Record<string, unknown>) => void
}

export interface ProjectFrontendPlugin {
  projectType: string
  label: string
  description?: string
  icon?: string
  SetupPage: (props: SetupPageProps) => unknown
}

export const PROJECT_TYPES = {
  CVA: 'CVA',
  BENEFICIARY_MANAGEMENT: 'BENEFICIARY_MANAGEMENT',
  MICROLEARNING: 'MICROLEARNING',
  ANTICIPATORY_ACTION: 'ANTICIPATORY_ACTION',
  MICROLOANS: 'MICROLOANS',
} as const

export type ProjectType = (typeof PROJECT_TYPES)[keyof typeof PROJECT_TYPES]
