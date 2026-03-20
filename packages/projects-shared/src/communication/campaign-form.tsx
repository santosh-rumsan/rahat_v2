import * as React from 'react'
import { ArrowLeft, ArrowRight, Check, MessageSquare, Phone, MessageCircle, Users, User } from 'lucide-react'
import { cn } from '@rs/ui'
import { Button } from '@rs/ui/button'
import { idbBeneficiaryGroupService, idbBeneficiaryService } from '@rahataid/sdk'
import type {
  CommunicationType,
  SmsDetails,
  WhatsappDetails,
  VoiceDetails,
  BeneficiaryGroup,
  Beneficiary,
} from '@rahataid/sdk'
import { useProjectCampaigns } from './hooks.js'
import { COMMUNICATION_TYPES } from './types.js'

export interface CampaignFormPageProps {
  projectId: string
  onSaved?: (campaignId: string) => void
  onCancel?: () => void
}

type Step = 'basics' | 'type' | 'details' | 'recipients'

const STEPS: { id: Step; label: string }[] = [
  { id: 'basics', label: 'Basics' },
  { id: 'type', label: 'Type' },
  { id: 'details', label: 'Details' },
  { id: 'recipients', label: 'Recipients' },
]

function stepIndex(step: Step): number {
  return STEPS.findIndex((s) => s.id === step)
}

interface FormState {
  name: string
  description: string
  communicationType: CommunicationType | ''
  smsMessage: string
  smsSenderId: string
  whatsappMessage: string
  whatsappTemplateId: string
  voiceScript: string
  voiceAudioUrl: string
  voiceLanguage: string
  beneficiaryIds: string[]
  beneficiaryGroupIds: string[]
}

function getDefaultForm(): FormState {
  return {
    name: '',
    description: '',
    communicationType: '',
    smsMessage: '',
    smsSenderId: '',
    whatsappMessage: '',
    whatsappTemplateId: '',
    voiceScript: '',
    voiceAudioUrl: '',
    voiceLanguage: '',
    beneficiaryIds: [],
    beneficiaryGroupIds: [],
  }
}

export function CampaignFormPage({ projectId, onSaved, onCancel }: CampaignFormPageProps) {
  const [step, setStep] = React.useState<Step>('basics')
  const [form, setForm] = React.useState<FormState>(getDefaultForm())
  const [groups, setGroups] = React.useState<BeneficiaryGroup[]>([])
  const [beneficiaries, setBeneficiaries] = React.useState<Beneficiary[]>([])
  const [saving, setSaving] = React.useState(false)
  const [recipientTab, setRecipientTab] = React.useState<'groups' | 'individuals'>('groups')
  const { createCampaign } = useProjectCampaigns(projectId)

  React.useEffect(() => {
    idbBeneficiaryGroupService.list(projectId).then(setGroups).catch(() => {})
    idbBeneficiaryService.list(projectId).then(setBeneficiaries).catch(() => {})
  }, [projectId])

  function update(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  function canAdvance(): boolean {
    if (step === 'basics') return form.name.trim().length > 0
    if (step === 'type') return form.communicationType !== ''
    if (step === 'details') {
      if (form.communicationType === 'sms') return form.smsMessage.trim().length > 0
      if (form.communicationType === 'whatsapp') return form.whatsappMessage.trim().length > 0
      if (form.communicationType === 'voice') return form.voiceScript.trim().length > 0 || form.voiceAudioUrl.trim().length > 0
    }
    return true
  }

  function handleNext() {
    const idx = stepIndex(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]!.id)
  }

  function handleBack() {
    const idx = stepIndex(step)
    if (idx > 0) setStep(STEPS[idx - 1]!.id)
  }

  function buildDetails(): SmsDetails | WhatsappDetails | VoiceDetails {
    if (form.communicationType === 'sms') {
      return { message: form.smsMessage, senderId: form.smsSenderId || undefined }
    }
    if (form.communicationType === 'whatsapp') {
      return { message: form.whatsappMessage, templateId: form.whatsappTemplateId || undefined }
    }
    return {
      script: form.voiceScript || undefined,
      audioUrl: form.voiceAudioUrl || undefined,
      language: form.voiceLanguage || undefined,
    }
  }

  async function handleSave() {
    if (!form.communicationType) return
    setSaving(true)
    try {
      const campaign = await createCampaign({
        name: form.name.trim(),
        description: form.description.trim(),
        communicationType: form.communicationType,
        details: buildDetails(),
        beneficiaryIds: form.beneficiaryIds,
        beneficiaryGroupIds: form.beneficiaryGroupIds,
      })
      if (onSaved) {
        onSaved(campaign.id)
      } else {
        window.location.href = `/projects/${projectId}/communication/${campaign.id}`
      }
    } finally {
      setSaving(false)
    }
  }

  function toggleGroup(id: string) {
    update({
      beneficiaryGroupIds: form.beneficiaryGroupIds.includes(id)
        ? form.beneficiaryGroupIds.filter((g) => g !== id)
        : [...form.beneficiaryGroupIds, id],
    })
  }

  function toggleBeneficiary(id: string) {
    update({
      beneficiaryIds: form.beneficiaryIds.includes(id)
        ? form.beneficiaryIds.filter((b) => b !== id)
        : [...form.beneficiaryIds, id],
    })
  }

  const currentStepIndex = stepIndex(step)
  const isLastStep = currentStepIndex === STEPS.length - 1

  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#fffdf8_0%,#f7fbff_42%,#f6f7fb_100%)]">
      <div className="flex-1 flex flex-col w-full px-6 py-8 gap-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel ?? (() => { window.history.back() })}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">New Campaign</h1>
            <p className="text-sm text-slate-500 mt-0.5">Create a communication campaign for beneficiaries</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <button
                onClick={() => {
                  if (i < currentStepIndex) setStep(s.id)
                }}
                disabled={i > currentStepIndex}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors',
                  i < currentStepIndex ? 'text-orange-500 cursor-pointer hover:text-orange-600' : '',
                  i === currentStepIndex ? 'text-slate-900 cursor-default' : '',
                  i > currentStepIndex ? 'text-slate-400 cursor-default' : '',
                )}
              >
                <span className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                  i < currentStepIndex ? 'bg-orange-500 border-orange-500 text-white' : '',
                  i === currentStepIndex ? 'bg-white border-orange-500 text-orange-500' : '',
                  i > currentStepIndex ? 'bg-white border-slate-200 text-slate-400' : '',
                )}>
                  {i < currentStepIndex ? <Check className="size-3.5" /> : i + 1}
                </span>
                {s.label}
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-px mx-3', i < currentStepIndex ? 'bg-orange-300' : 'bg-slate-200')} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-y-auto">
          <div className="p-8">
            {step === 'basics' && (
              <BasicsStep form={form} update={update} />
            )}
            {step === 'type' && (
              <TypeStep form={form} update={update} />
            )}
            {step === 'details' && form.communicationType && (
              <DetailsStep form={form} update={update} />
            )}
            {step === 'recipients' && (
              <RecipientsStep
                form={form}
                groups={groups}
                beneficiaries={beneficiaries}
                recipientTab={recipientTab}
                setRecipientTab={setRecipientTab}
                toggleGroup={toggleGroup}
                toggleBeneficiary={toggleBeneficiary}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between shrink-0">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="size-4" />
            Previous
          </button>
          {isLastStep ? (
            <Button
              onClick={() => { void handleSave() }}
              disabled={saving}
              className="bg-orange-500 text-white hover:bg-orange-600 px-6"
            >
              {saving ? 'Saving…' : 'Create Campaign'}
            </Button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canAdvance()}
              className="flex items-center gap-1.5 text-sm font-semibold bg-brand-500 text-white px-5 py-2.5 rounded-xl hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Step sub-components ---

function BasicsStep({ form, update }: { form: FormState; update: (p: Partial<FormState>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Campaign basics</h2>
        <p className="text-sm text-slate-500 mt-1">Give your campaign a name and describe its purpose.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Campaign name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. June Food Distribution Reminder"
            value={form.name}
            onChange={(e) => update({ name: e.currentTarget.value })}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            autoFocus
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Description</label>
          <textarea
            placeholder="Optional description of this campaign…"
            value={form.description}
            onChange={(e) => update({ description: e.currentTarget.value })}
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  )
}

function TypeStep({ form, update }: { form: FormState; update: (p: Partial<FormState>) => void }) {
  const icons: Record<string, React.ReactNode> = {
    sms: <MessageSquare className="size-6" />,
    whatsapp: <MessageCircle className="size-6" />,
    voice: <Phone className="size-6" />,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Communication type</h2>
        <p className="text-sm text-slate-500 mt-1">Choose how you want to reach beneficiaries.</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {COMMUNICATION_TYPES.map((ct) => (
          <button
            key={ct.value}
            type="button"
            onClick={() => update({ communicationType: ct.value })}
            className={cn(
              'flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all',
              form.communicationType === ct.value
                ? 'border-orange-400 bg-orange-50'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
            )}
          >
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
              form.communicationType === ct.value ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500',
            )}>
              {icons[ct.value]}
            </div>
            <div>
              <p className={cn('font-semibold', form.communicationType === ct.value ? 'text-orange-700' : 'text-slate-900')}>
                {ct.label}
              </p>
              <p className="text-sm text-slate-500">{ct.description}</p>
            </div>
            {form.communicationType === ct.value && (
              <div className="ml-auto w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                <Check className="size-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function DetailsStep({ form, update }: { form: FormState; update: (p: Partial<FormState>) => void }) {
  if (form.communicationType === 'sms') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">SMS details</h2>
          <p className="text-sm text-slate-500 mt-1">Write the SMS message to send to beneficiaries.</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              placeholder="Enter the SMS message…"
              value={form.smsMessage}
              onChange={(e) => update({ smsMessage: e.currentTarget.value })}
              rows={5}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              autoFocus
            />
            <p className="text-xs text-slate-400 mt-1">{form.smsMessage.length} characters</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Sender ID</label>
            <input
              type="text"
              placeholder="e.g. RAHAT or leave blank for default"
              value={form.smsSenderId}
              onChange={(e) => update({ smsSenderId: e.currentTarget.value })}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    )
  }

  if (form.communicationType === 'whatsapp') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">WhatsApp details</h2>
          <p className="text-sm text-slate-500 mt-1">Write the WhatsApp message to send to beneficiaries.</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              placeholder="Enter the WhatsApp message…"
              value={form.whatsappMessage}
              onChange={(e) => update({ whatsappMessage: e.currentTarget.value })}
              rows={5}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Template ID</label>
            <input
              type="text"
              placeholder="WhatsApp template ID (optional)"
              value={form.whatsappTemplateId}
              onChange={(e) => update({ whatsappTemplateId: e.currentTarget.value })}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    )
  }

  // voice
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Voice call details</h2>
        <p className="text-sm text-slate-500 mt-1">Provide a script or audio URL for the voice message.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Script <span className="text-rose-500">*</span>
          </label>
          <textarea
            placeholder="Write the voice message script…"
            value={form.voiceScript}
            onChange={(e) => update({ voiceScript: e.currentTarget.value })}
            rows={5}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
            autoFocus
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Audio URL</label>
          <input
            type="text"
            placeholder="https://… (optional pre-recorded audio)"
            value={form.voiceAudioUrl}
            onChange={(e) => update({ voiceAudioUrl: e.currentTarget.value })}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Language</label>
          <input
            type="text"
            placeholder="e.g. Nepali, English"
            value={form.voiceLanguage}
            onChange={(e) => update({ voiceLanguage: e.currentTarget.value })}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )
}

interface RecipientsStepProps {
  form: FormState
  groups: BeneficiaryGroup[]
  beneficiaries: Beneficiary[]
  recipientTab: 'groups' | 'individuals'
  setRecipientTab: (tab: 'groups' | 'individuals') => void
  toggleGroup: (id: string) => void
  toggleBeneficiary: (id: string) => void
}

function RecipientsStep({ form, groups, beneficiaries, recipientTab, setRecipientTab, toggleGroup, toggleBeneficiary }: RecipientsStepProps) {
  const totalSelected = form.beneficiaryIds.length + form.beneficiaryGroupIds.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Select recipients</h2>
        <p className="text-sm text-slate-500 mt-1">
          Choose beneficiary groups or individuals to receive this campaign.
          {totalSelected > 0 && (
            <span className="ml-1 font-medium text-orange-600">
              {form.beneficiaryGroupIds.length > 0 && `${form.beneficiaryGroupIds.length} group${form.beneficiaryGroupIds.length !== 1 ? 's' : ''}`}
              {form.beneficiaryGroupIds.length > 0 && form.beneficiaryIds.length > 0 && ', '}
              {form.beneficiaryIds.length > 0 && `${form.beneficiaryIds.length} individual${form.beneficiaryIds.length !== 1 ? 's' : ''}`}
              {' '}selected
            </span>
          )}
        </p>
      </div>

      <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setRecipientTab('groups')}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors',
            recipientTab === 'groups' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800',
          )}
        >
          <Users className="size-4" />
          Groups
        </button>
        <button
          type="button"
          onClick={() => setRecipientTab('individuals')}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors',
            recipientTab === 'individuals' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800',
          )}
        >
          <User className="size-4" />
          Individuals
        </button>
      </div>

      {recipientTab === 'groups' ? (
        <div className="space-y-2">
          {groups.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No beneficiary groups found</p>
          ) : (
            groups.map((g) => {
              const selected = form.beneficiaryGroupIds.includes(g.id)
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGroup(g.id)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                    selected ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white hover:border-slate-300',
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', selected ? 'bg-orange-100' : 'bg-slate-100')}>
                    <Users className={cn('size-5', selected ? 'text-orange-600' : 'text-slate-400')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{g.name}</p>
                    {g.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{g.description}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">{g.beneficiaryIds.length} member{g.beneficiaryIds.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                    selected ? 'bg-orange-500 border-orange-500' : 'border-slate-300',
                  )}>
                    {selected && <Check className="size-3 text-white" />}
                  </div>
                </button>
              )
            })
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {beneficiaries.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No beneficiaries found</p>
          ) : (
            beneficiaries.map((b) => {
              const selected = form.beneficiaryIds.includes(b.id)
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggleBeneficiary(b.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all',
                    selected ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white hover:border-slate-300',
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                    selected ? 'bg-orange-200 text-orange-700' : 'bg-slate-100 text-slate-600',
                  )}>
                    {b.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{b.name}</p>
                    <p className="text-xs text-slate-400">{b.location}</p>
                  </div>
                  <div className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                    selected ? 'bg-orange-500 border-orange-500' : 'border-slate-300',
                  )}>
                    {selected && <Check className="size-3 text-white" />}
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
