export interface Project {
  id: string
  name: string
  projectType: string
  location: string
  image: string
  startDate: string
  endDate: string
  projectOwner: string
  status: string
  beneficiaries: number
  budget: string
}

export type CreateProjectInput = {
  name: string
  projectType: string
  location: string
  image: string
  startDate: string
  endDate: string
  projectOwner: string
  status?: string
  beneficiaries?: number
  budget?: string
}

export type UpdateProjectInput = Partial<Omit<Project, 'id'>>
