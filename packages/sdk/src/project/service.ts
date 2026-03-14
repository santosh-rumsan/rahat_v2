import type { Project, CreateProjectInput, UpdateProjectInput } from '../types/project.js'

export interface ProjectService {
  list(): Promise<Project[]>
  get(id: string): Promise<Project | undefined>
  create(data: CreateProjectInput): Promise<Project>
  update(id: string, data: UpdateProjectInput): Promise<Project>
  delete(id: string): Promise<void>
}
