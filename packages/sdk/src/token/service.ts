import type { Token, CreateTokenInput, UpdateTokenInput } from '../types/benefit.js'

export interface TokenService {
  list(projectId: string): Promise<Token[]>
  get(projectId: string, id: string): Promise<Token | undefined>
  create(projectId: string, data: CreateTokenInput): Promise<Token>
  update(projectId: string, id: string, data: UpdateTokenInput): Promise<Token>
  delete(projectId: string, id: string): Promise<void>
}
