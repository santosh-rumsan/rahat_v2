import { openDb } from './db.js'
import type {
  AllocationLog,
  Benefit,
  Beneficiary,
  BeneficiaryGroup,
  Campaign,
  Fund,
  FundAllocation,
  Project,
  Task,
  Token,
  TransmissionLog,
} from './types/index.js'

type JsonRecord = Record<string, unknown>

export interface ProjectModuleLog extends JsonRecord {
  id: string
  module: string
  type: string
  title: string
  timestamp: string
  projectId?: string
  description?: string
  severity?: 'info' | 'success' | 'warning' | 'error'
  relatedId?: string
  relatedType?: string
  metadata?: Record<string, unknown>
}

export type ImportedProject = Project & JsonRecord
export type ImportedBeneficiary = Beneficiary & JsonRecord
export type ImportedBeneficiaryGroup = BeneficiaryGroup & JsonRecord
export type ImportedBenefit = Benefit & JsonRecord
export type ImportedToken = Token & JsonRecord
export type ImportedTask = Task & JsonRecord
export type ImportedCampaign = Campaign & JsonRecord
export type ImportedTransmissionLog = TransmissionLog & JsonRecord
export type ImportedFund = Fund & JsonRecord
export type ImportedFundAllocation = FundAllocation & JsonRecord
export type ImportedAllocationLog = AllocationLog & JsonRecord

export interface ProjectImportPayload extends JsonRecord {
  version?: number
  exportedAt?: string
  project: ImportedProject
  beneficiaries?: ImportedBeneficiary[]
  beneficiaryGroups?: ImportedBeneficiaryGroup[]
  benefits?: ImportedBenefit[]
  tokens?: ImportedToken[]
  tasks?: ImportedTask[]
  communications?: ImportedCampaign[]
  campaigns?: ImportedCampaign[]
  communicationLogs?: ImportedTransmissionLog[]
  transmissionLogs?: ImportedTransmissionLog[]
  funds?: ImportedFund[]
  fundAllocations?: ImportedFundAllocation[]
  allocationLogs?: ImportedAllocationLog[]
  moduleLogs?: ProjectModuleLog[]
}

export interface NormalizedProjectImportPayload {
  version: number
  exportedAt: string
  project: ImportedProject
  beneficiaries: ImportedBeneficiary[]
  beneficiaryGroups: ImportedBeneficiaryGroup[]
  benefits: ImportedBenefit[]
  tokens: ImportedToken[]
  tasks: ImportedTask[]
  communications: ImportedCampaign[]
  transmissionLogs: ImportedTransmissionLog[]
  funds: ImportedFund[]
  fundAllocations: ImportedFundAllocation[]
  allocationLogs: ImportedAllocationLog[]
  moduleLogs: ProjectModuleLog[]
}

export interface ProjectImportResult {
  projectId: string
  projectName: string
  summary: {
    beneficiaries: number
    beneficiaryGroups: number
    benefits: number
    tokens: number
    tasks: number
    communications: number
    transmissionLogs: number
    funds: number
    fundAllocations: number
    allocationLogs: number
    moduleLogs: number
  }
}

export interface ProjectImportOptions {
  includeActivities?: boolean
}

export interface ProjectImportAdapter {
  importProjectDump(payload: NormalizedProjectImportPayload): Promise<void>
}

export interface ProjectImportApiHandlers {
  project: (project: ImportedProject) => Promise<void>
  beneficiaries?: (projectId: string, beneficiaries: ImportedBeneficiary[]) => Promise<void>
  beneficiaryGroups?: (projectId: string, groups: ImportedBeneficiaryGroup[]) => Promise<void>
  benefits?: (projectId: string, benefits: ImportedBenefit[]) => Promise<void>
  tokens?: (projectId: string, tokens: ImportedToken[]) => Promise<void>
  tasks?: (projectId: string, tasks: ImportedTask[]) => Promise<void>
  communications?: (projectId: string, communications: ImportedCampaign[]) => Promise<void>
  transmissionLogs?: (projectId: string, logs: ImportedTransmissionLog[]) => Promise<void>
  funds?: (projectId: string, funds: ImportedFund[]) => Promise<void>
  fundAllocations?: (projectId: string, allocations: ImportedFundAllocation[]) => Promise<void>
  allocationLogs?: (projectId: string, logs: ImportedAllocationLog[]) => Promise<void>
  moduleLogs?: (projectId: string, logs: ProjectModuleLog[]) => Promise<void>
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function ensureRecord<T extends JsonRecord>(value: unknown, label: string): T {
  if (!isRecord(value)) {
    throw new Error(`Invalid project import: ${label} must be an object`)
  }
  return value as T
}

export function parseProjectImportPayload(input: string | unknown): NormalizedProjectImportPayload {
  const raw = typeof input === 'string' ? JSON.parse(input) : input
  if (!isRecord(raw)) {
    throw new Error('Invalid project import: root JSON value must be an object')
  }

  const project = ensureRecord<ImportedProject>(raw.project, 'project')
  const projectId = typeof project.id === 'string' ? project.id.trim() : ''
  if (!projectId) {
    throw new Error('Invalid project import: project.id is required')
  }

  const beneficiaries = asArray<ImportedBeneficiary>(raw.beneficiaries)
  const beneficiaryCount =
    beneficiaries.length > 0 ? beneficiaries.length : typeof project.beneficiaries === 'number' ? project.beneficiaries : 0
  const normalizedProject: ImportedProject = { ...project, id: projectId }
  normalizedProject.status = typeof project.status === 'string' ? project.status : 'Planning'
  normalizedProject.budget = typeof project.budget === 'string' ? project.budget : '$0'
  normalizedProject.beneficiaries = beneficiaryCount

  return {
    version: typeof raw.version === 'number' ? raw.version : 1,
    exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : new Date().toISOString(),
    project: normalizedProject,
    beneficiaries,
    beneficiaryGroups: asArray<ImportedBeneficiaryGroup>(raw.beneficiaryGroups),
    benefits: asArray<ImportedBenefit>(raw.benefits),
    tokens: asArray<ImportedToken>(raw.tokens),
    tasks: asArray<ImportedTask>(raw.tasks),
    communications: asArray<ImportedCampaign>(raw.communications ?? raw.campaigns),
    transmissionLogs: asArray<ImportedTransmissionLog>(raw.communicationLogs ?? raw.transmissionLogs),
    funds: asArray<ImportedFund>(raw.funds),
    fundAllocations: asArray<ImportedFundAllocation>(raw.fundAllocations),
    allocationLogs: asArray<ImportedAllocationLog>(raw.allocationLogs),
    moduleLogs: asArray<ProjectModuleLog>(raw.moduleLogs),
  }
}

function assertHandler<T>(records: T[], handler: ((...args: never[]) => Promise<void>) | undefined, label: string) {
  if (records.length > 0 && !handler) {
    throw new Error(`Project import adapter is missing a handler for ${label}`)
  }
}

export async function importProjectDump(
  input: string | ProjectImportPayload | NormalizedProjectImportPayload,
  adapter: ProjectImportAdapter,
  options: ProjectImportOptions = {}
): Promise<ProjectImportResult> {
  const payload = applyProjectImportOptions(parseProjectImportPayload(input), options)
  await adapter.importProjectDump(payload)

  return {
    projectId: payload.project.id,
    projectName: payload.project.name,
    summary: {
      beneficiaries: payload.beneficiaries.length,
      beneficiaryGroups: payload.beneficiaryGroups.length,
      benefits: payload.benefits.length,
      tokens: payload.tokens.length,
      tasks: payload.tasks.length,
      communications: payload.communications.length,
      transmissionLogs: payload.transmissionLogs.length,
      funds: payload.funds.length,
      fundAllocations: payload.fundAllocations.length,
      allocationLogs: payload.allocationLogs.length,
      moduleLogs: payload.moduleLogs.length,
    },
  }
}

function stripActivityFields<T extends JsonRecord>(record: T): T {
  const next = { ...record }
  delete next.activities
  delete next.activityLogs
  delete next.logs
  return next
}

function applyProjectImportOptions(
  payload: NormalizedProjectImportPayload,
  options: ProjectImportOptions
): NormalizedProjectImportPayload {
  if (options.includeActivities !== false) {
    return payload
  }

  return {
    ...payload,
    beneficiaries: payload.beneficiaries.map((beneficiary) => stripActivityFields(beneficiary)),
    tasks: payload.tasks.map((task) => {
      const nextTask = stripActivityFields(task)
      delete nextTask.statusLogs
      return nextTask as ImportedTask
    }),
    communications: payload.communications.map((communication) => stripActivityFields(communication)),
    transmissionLogs: [],
    allocationLogs: [],
    moduleLogs: [],
  }
}

export function createIndexedDbProjectImportAdapter(): ProjectImportAdapter {
  return {
    async importProjectDump(payload) {
      const db = await openDb()
      const storeNames = [
        'projects',
        'beneficiaries',
        'beneficiary_groups',
        'benefits',
        'tokens',
        'tasks',
        'campaigns',
        'transmission_logs',
        'funds',
        'fund_allocations',
        'allocation_logs',
        'project_module_logs',
      ]

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeNames, 'readwrite')
        const projectId = payload.project.id

        tx.objectStore('projects').put(payload.project)

        for (const beneficiary of payload.beneficiaries) {
          tx.objectStore('beneficiaries').put({ ...beneficiary, projectId })
        }

        for (const group of payload.beneficiaryGroups) {
          tx.objectStore('beneficiary_groups').put({ ...group, projectId })
        }

        for (const benefit of payload.benefits) {
          tx.objectStore('benefits').put({ ...benefit, projectId })
        }

        for (const token of payload.tokens) {
          tx.objectStore('tokens').put({ ...token, projectId })
        }

        for (const task of payload.tasks) {
          tx.objectStore('tasks').put({ ...task, projectId })
        }

        for (const communication of payload.communications) {
          tx.objectStore('campaigns').put({ ...communication, projectId })
        }

        for (const log of payload.transmissionLogs) {
          tx.objectStore('transmission_logs').put(log)
        }

        for (const fund of payload.funds) {
          tx.objectStore('funds').put(fund)
        }

        for (const allocation of payload.fundAllocations) {
          tx.objectStore('fund_allocations').put({ ...allocation, projectId: allocation.projectId ?? projectId })
        }

        for (const log of payload.allocationLogs) {
          tx.objectStore('allocation_logs').put({ ...log, projectId: log.projectId ?? projectId })
        }

        for (const log of payload.moduleLogs) {
          tx.objectStore('project_module_logs').put({ ...log, projectId: log.projectId ?? projectId })
        }

        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
      })
    },
  }
}

export function createApiProjectImportAdapter(handlers: ProjectImportApiHandlers): ProjectImportAdapter {
  return {
    async importProjectDump(payload) {
      const projectId = payload.project.id

      assertHandler(payload.beneficiaries, handlers.beneficiaries as never, 'beneficiaries')
      assertHandler(payload.beneficiaryGroups, handlers.beneficiaryGroups as never, 'beneficiaryGroups')
      assertHandler(payload.benefits, handlers.benefits as never, 'benefits')
      assertHandler(payload.tokens, handlers.tokens as never, 'tokens')
      assertHandler(payload.tasks, handlers.tasks as never, 'tasks')
      assertHandler(payload.communications, handlers.communications as never, 'communications')
      assertHandler(payload.transmissionLogs, handlers.transmissionLogs as never, 'transmissionLogs')
      assertHandler(payload.funds, handlers.funds as never, 'funds')
      assertHandler(payload.fundAllocations, handlers.fundAllocations as never, 'fundAllocations')
      assertHandler(payload.allocationLogs, handlers.allocationLogs as never, 'allocationLogs')
      assertHandler(payload.moduleLogs, handlers.moduleLogs as never, 'moduleLogs')

      await handlers.project(payload.project)

      if (payload.beneficiaries.length > 0) await handlers.beneficiaries!(projectId, payload.beneficiaries)
      if (payload.beneficiaryGroups.length > 0) await handlers.beneficiaryGroups!(projectId, payload.beneficiaryGroups)
      if (payload.benefits.length > 0) await handlers.benefits!(projectId, payload.benefits)
      if (payload.tokens.length > 0) await handlers.tokens!(projectId, payload.tokens)
      if (payload.tasks.length > 0) await handlers.tasks!(projectId, payload.tasks)
      if (payload.communications.length > 0) await handlers.communications!(projectId, payload.communications)
      if (payload.transmissionLogs.length > 0) await handlers.transmissionLogs!(projectId, payload.transmissionLogs)
      if (payload.funds.length > 0) await handlers.funds!(projectId, payload.funds)
      if (payload.fundAllocations.length > 0) await handlers.fundAllocations!(projectId, payload.fundAllocations)
      if (payload.allocationLogs.length > 0) await handlers.allocationLogs!(projectId, payload.allocationLogs)
      if (payload.moduleLogs.length > 0) await handlers.moduleLogs!(projectId, payload.moduleLogs)
    },
  }
}
