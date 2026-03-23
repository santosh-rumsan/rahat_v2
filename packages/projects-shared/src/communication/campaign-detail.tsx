import * as React from 'react'
import { ArrowLeft, Users, User, UserMinus, UserPlus, Search, Trash2, Plus, Send } from 'lucide-react'
import { cn } from '@rs/ui'
import { Badge } from '@rs/ui/badge'
import { Button } from '@rs/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@rs/ui/tabs'
import { idbBeneficiaryService, idbBeneficiaryGroupService } from '@rahataid/sdk'
import type { Beneficiary, BeneficiaryGroup, CommunicationType } from '@rahataid/sdk'
import { useCampaign, useCampaignTransmissionLogs } from './hooks.js'
import {
  CAMPAIGN_STATUS_COLORS,
  COMM_TYPE_COLORS,
  COMM_TYPE_ICONS,
  TRANSMISSION_STATUS_COLORS,
} from './types.js'
import type { Campaign, SmsDetails, WhatsappDetails, VoiceDetails } from './types.js'
import { CAMPAIGN_SEND_EVENT } from './comm-types/registry.js'
import type { CampaignSendEventDetail } from './comm-types/registry.js'

export interface CampaignDetailPageProps {
  projectId: string
  campaignId: string
  onBack?: () => void
}

export function CampaignDetailPage({ projectId, campaignId, onBack }: CampaignDetailPageProps) {
  const { campaign, loading, update } = useCampaign(projectId, campaignId)
  const { logs, addLog, clearLogs } = useCampaignTransmissionLogs(campaignId)
  const [beneficiaries, setBeneficiaries] = React.useState<Beneficiary[]>([])
  const [groups, setGroups] = React.useState<BeneficiaryGroup[]>([])
  const [sending, setSending] = React.useState(false)

  React.useEffect(() => {
    idbBeneficiaryService.list(projectId).then(setBeneficiaries).catch(() => {})
    idbBeneficiaryGroupService.list(projectId).then(setGroups).catch(() => {})
  }, [projectId])

  function handleBack() {
    if (onBack) {
      onBack()
    } else {
      window.location.href = `/projects/${projectId}/communication`
    }
  }

  async function handleSend() {
    if (!campaign || sending) return
    setSending(true)
    try {
      // Resolve all beneficiary IDs (expand groups)
      const resolvedIds = new Set<string>(campaign.beneficiaryIds)
      for (const groupId of campaign.beneficiaryGroupIds) {
        const group = groups.find((g) => g.id === groupId)
        if (group) group.beneficiaryIds.forEach((id) => resolvedIds.add(id))
      }
      const beneficiaryIds = Array.from(resolvedIds)

      // Update campaign status to Sending
      const updatedCampaign = await update({ status: 'Sending', sentAt: new Date().toISOString() })

      // Create Pending transmission logs for each beneficiary
      const transmissionLogs = await Promise.all(
        beneficiaryIds.map((bId) => {
          const b = beneficiaries.find((x) => x.id === bId)
          return addLog({ campaignId: campaign.id, beneficiaryId: bId, beneficiaryName: b?.name, status: 'Pending' })
        }),
      )

      // Dispatch event — comms plugins listen and call service webhooks
      window.dispatchEvent(
        new CustomEvent<CampaignSendEventDetail>(CAMPAIGN_SEND_EVENT, {
          detail: {
            campaign: updatedCampaign ?? campaign,
            beneficiaryIds,
            transmissionLogs,
            projectId,
          },
        }),
      )
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400 text-sm">Loading…</div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex h-full items-center justify-center flex-col gap-3">
        <p className="text-slate-500 text-sm">Campaign not found</p>
        <button onClick={handleBack} className="text-sm text-orange-500 hover:text-orange-600">
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="px-8 pt-7 pb-5 flex-shrink-0">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            All Campaigns
          </button>
          <div className="flex items-start gap-5">
            <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0', COMM_TYPE_COLORS[campaign.communicationType])}>
              {COMM_TYPE_ICONS[campaign.communicationType]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-[#1a1a1a] leading-tight">{campaign.name}</h1>
                <Badge className={CAMPAIGN_STATUS_COLORS[campaign.status]}>{campaign.status}</Badge>
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', COMM_TYPE_COLORS[campaign.communicationType])}>
                  {campaign.communicationType === 'sms' ? 'SMS' : campaign.communicationType === 'whatsapp' ? 'WhatsApp' : campaign.communicationType === 'slack' ? 'Slack' : 'Voice'}
                </span>
                {(campaign.status === 'Draft' || campaign.status === 'Scheduled') && (
                  <Button
                    onClick={() => { void handleSend() }}
                    disabled={sending || (campaign.beneficiaryIds.length === 0 && campaign.beneficiaryGroupIds.length === 0)}
                    className="ml-2 flex items-center gap-1.5 bg-orange-500 text-white hover:bg-orange-600 text-sm px-4 py-2 h-auto"
                  >
                    <Send className="size-3.5" />
                    {sending ? 'Sending…' : 'Send Campaign'}
                  </Button>
                )}
              </div>
              {campaign.description && (
                <p className="text-sm text-gray-400 mt-1">{campaign.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1.5">
                Created {new Date(campaign.createdAt).toLocaleDateString()}
                {campaign.sentAt && ` · Sent ${new Date(campaign.sentAt).toLocaleDateString()}`}
              </p>
            </div>
          </div>
      </div>

      <Tabs defaultValue="overview" className="flex flex-col flex-1 min-h-0 mt-4">
        <TabsList className="flex-shrink-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="message">Message Details</TabsTrigger>
          <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
          <TabsTrigger value="logs">Transmission Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex-1 overflow-y-auto mt-0">
          <OverviewTab campaign={campaign} onUpdate={update} />
        </TabsContent>

        <TabsContent value="message" className="flex-1 overflow-y-auto mt-0">
          <MessageTab campaign={campaign} onUpdate={update} />
        </TabsContent>

        <TabsContent value="beneficiaries" className="flex-1 overflow-y-auto mt-0">
          <BeneficiariesTab
            campaign={campaign}
            beneficiaries={beneficiaries}
            groups={groups}
            onUpdate={update}
          />
        </TabsContent>

        <TabsContent value="logs" className="flex-1 overflow-y-auto mt-0">
          <LogsTab
            campaign={campaign}
            logs={logs}
            beneficiaries={beneficiaries}
            onAddLog={addLog}
            onClearLogs={clearLogs}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// --- Tab: Overview ---

function OverviewTab({ campaign, onUpdate }: { campaign: Campaign; onUpdate: (data: Parameters<ReturnType<typeof useCampaign>['update']>[0]) => void }) {
  const [editing, setEditing] = React.useState(false)
  const [name, setName] = React.useState(campaign.name)
  const [description, setDescription] = React.useState(campaign.description)
  const [status, setStatus] = React.useState(campaign.status)
  const [saving, setSaving] = React.useState(false)

  async function handleSave() {
    setSaving(true)
    await onUpdate({ name: name.trim(), description: description.trim(), status })
    setEditing(false)
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-slate-900">Campaign Information</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.currentTarget.value as Campaign['status'])}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
            >
              {(['Draft', 'Scheduled', 'Sending', 'Completed', 'Failed'] as const).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => { void handleSave() }}
              disabled={saving || !name.trim()}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            <button
              onClick={() => {
                setEditing(false)
                setName(campaign.name)
                setDescription(campaign.description)
                setStatus(campaign.status)
              }}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <InfoRow label="Name" value={campaign.name} />
          <InfoRow label="Description" value={campaign.description || '—'} />
          <InfoRow label="Type" value={campaign.communicationType === 'sms' ? 'SMS' : campaign.communicationType === 'whatsapp' ? 'WhatsApp' : 'Voice Call'} />
          <InfoRow label="Status" value={<Badge className={CAMPAIGN_STATUS_COLORS[campaign.status]}>{campaign.status}</Badge>} />
          <InfoRow label="Created" value={new Date(campaign.createdAt).toLocaleString()} />
          {campaign.scheduledAt && <InfoRow label="Scheduled" value={new Date(campaign.scheduledAt).toLocaleString()} />}
          {campaign.sentAt && <InfoRow label="Sent" value={new Date(campaign.sentAt).toLocaleString()} />}
          <InfoRow label="Recipients" value={`${campaign.beneficiaryIds.length} individual${campaign.beneficiaryIds.length !== 1 ? 's' : ''}, ${campaign.beneficiaryGroupIds.length} group${campaign.beneficiaryGroupIds.length !== 1 ? 's' : ''}`} />
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 w-32 shrink-0">{label}</span>
      <span className="text-sm text-slate-900 flex-1">{value}</span>
    </div>
  )
}

// --- Tab: Message ---

function MessageTab({ campaign, onUpdate }: { campaign: Campaign; onUpdate: (data: Parameters<ReturnType<typeof useCampaign>['update']>[0]) => void }) {
  const [editing, setEditing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const type = campaign.communicationType
  const details = campaign.details as SmsDetails & WhatsappDetails & VoiceDetails

  const [message, setMessage] = React.useState(details.message ?? '')
  const [senderId, setSenderId] = React.useState((details as SmsDetails).senderId ?? '')
  const [templateId, setTemplateId] = React.useState((details as WhatsappDetails).templateId ?? '')
  const [script, setScript] = React.useState((details as VoiceDetails).script ?? '')
  const [audioUrl, setAudioUrl] = React.useState((details as VoiceDetails).audioUrl ?? '')
  const [language, setLanguage] = React.useState((details as VoiceDetails).language ?? '')

  async function handleSave() {
    setSaving(true)
    let newDetails: SmsDetails | WhatsappDetails | VoiceDetails
    if (type === 'sms') newDetails = { message, senderId: senderId || undefined }
    else if (type === 'whatsapp') newDetails = { message, templateId: templateId || undefined }
    else newDetails = { script: script || undefined, audioUrl: audioUrl || undefined, language: language || undefined }
    await onUpdate({ details: newDetails })
    setEditing(false)
    setSaving(false)
  }

  const label = type === 'sms' ? 'SMS' : type === 'whatsapp' ? 'WhatsApp' : 'Voice Call'

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-slate-900">{label} Message Details</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          {(type === 'sms' || type === 'whatsapp') && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.currentTarget.value)}
                  rows={6}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                />
                {type === 'sms' && <p className="text-xs text-slate-400 mt-1">{message.length} characters</p>}
              </div>
              {type === 'sms' && (
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Sender ID</label>
                  <input
                    type="text"
                    value={senderId}
                    onChange={(e) => setSenderId(e.currentTarget.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
              )}
              {type === 'whatsapp' && (
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Template ID</label>
                  <input
                    type="text"
                    value={templateId}
                    onChange={(e) => setTemplateId(e.currentTarget.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
              )}
            </>
          )}
          {type === 'voice' && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Script</label>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.currentTarget.value)}
                  rows={6}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Audio URL</label>
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.currentTarget.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Language</label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.currentTarget.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
            </>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => { void handleSave() }}
              disabled={saving}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {(type === 'sms' || type === 'whatsapp') && (
            <>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Message</p>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-wrap">
                  {(details as SmsDetails).message || <span className="text-slate-400">No message set</span>}
                </div>
                {type === 'sms' && <p className="text-xs text-slate-400 mt-1">{((details as SmsDetails).message ?? '').length} characters</p>}
              </div>
              {type === 'sms' && (details as SmsDetails).senderId && (
                <InfoRow label="Sender ID" value={(details as SmsDetails).senderId!} />
              )}
              {type === 'whatsapp' && (details as WhatsappDetails).templateId && (
                <InfoRow label="Template ID" value={(details as WhatsappDetails).templateId!} />
              )}
            </>
          )}
          {type === 'voice' && (
            <>
              {(details as VoiceDetails).script && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Script</p>
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-wrap">
                    {(details as VoiceDetails).script}
                  </div>
                </div>
              )}
              {(details as VoiceDetails).audioUrl && (
                <InfoRow label="Audio URL" value={(details as VoiceDetails).audioUrl!} />
              )}
              {(details as VoiceDetails).language && (
                <InfoRow label="Language" value={(details as VoiceDetails).language!} />
              )}
              {!(details as VoiceDetails).script && !(details as VoiceDetails).audioUrl && (
                <p className="text-sm text-slate-400 py-4">No message details set.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// --- Tab: Beneficiaries ---

interface BeneficiariesTabProps {
  campaign: Campaign
  beneficiaries: Beneficiary[]
  groups: BeneficiaryGroup[]
  onUpdate: (data: Parameters<ReturnType<typeof useCampaign>['update']>[0]) => void
}

function BeneficiariesTab({ campaign, beneficiaries, groups, onUpdate }: BeneficiariesTabProps) {
  const [subTab, setSubTab] = React.useState<'groups' | 'individuals'>('groups')
  const [search, setSearch] = React.useState('')
  const [addSearch, setAddSearch] = React.useState('')
  const [showAdd, setShowAdd] = React.useState(false)

  const selectedGroups = groups.filter((g) => campaign.beneficiaryGroupIds.includes(g.id))
  const selectedBeneficiaries = beneficiaries.filter((b) => campaign.beneficiaryIds.includes(b.id))

  const filteredGroups = selectedGroups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  )
  const filteredBeneficiaries = selectedBeneficiaries.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.location.toLowerCase().includes(search.toLowerCase()),
  )

  const unselectedGroups = groups.filter((g) => !campaign.beneficiaryGroupIds.includes(g.id))
  const filteredAddGroups = unselectedGroups.filter((g) =>
    g.name.toLowerCase().includes(addSearch.toLowerCase()),
  )
  const unselectedBeneficiaries = beneficiaries.filter((b) => !campaign.beneficiaryIds.includes(b.id))
  const filteredAddBeneficiaries = unselectedBeneficiaries.filter((b) =>
    b.name.toLowerCase().includes(addSearch.toLowerCase()) ||
    b.location.toLowerCase().includes(addSearch.toLowerCase()),
  )

  async function addGroup(id: string) {
    await onUpdate({ beneficiaryGroupIds: [...campaign.beneficiaryGroupIds, id] })
  }

  async function removeGroup(id: string) {
    await onUpdate({ beneficiaryGroupIds: campaign.beneficiaryGroupIds.filter((g) => g !== id) })
  }

  async function addBeneficiary(id: string) {
    await onUpdate({ beneficiaryIds: [...campaign.beneficiaryIds, id] })
  }

  async function removeBeneficiary(id: string) {
    await onUpdate({ beneficiaryIds: campaign.beneficiaryIds.filter((b) => b !== id) })
  }

  return (
    <div className="px-6 py-6">
      {/* Sub-tabs */}
      <div className="flex items-center justify-between mb-5">
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => { setSubTab('groups'); setSearch('') }}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors',
              subTab === 'groups' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800',
            )}
          >
            <Users className="size-4" />
            Groups ({campaign.beneficiaryGroupIds.length})
          </button>
          <button
            type="button"
            onClick={() => { setSubTab('individuals'); setSearch('') }}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors',
              subTab === 'individuals' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800',
            )}
          >
            <User className="size-4" />
            Individuals ({campaign.beneficiaryIds.length})
          </button>
        </div>
        <button
          onClick={() => { setShowAdd((v) => !v); setAddSearch('') }}
          className="flex items-center gap-1.5 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white px-3 py-2 rounded-xl transition-colors"
        >
          <Plus className="size-3.5" />
          Add {subTab === 'groups' ? 'groups' : 'beneficiaries'}
        </button>
      </div>

      {/* Add panel */}
      {showAdd && (
        <div className="mb-5 bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-900">
              Add {subTab === 'groups' ? 'groups' : 'beneficiaries'} to campaign
            </p>
            <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
          </div>
          <div className="relative mb-3">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search…"
              value={addSearch}
              onChange={(e) => setAddSearch(e.currentTarget.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {subTab === 'groups' ? (
              filteredAddGroups.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-4">
                  {unselectedGroups.length === 0 ? 'All groups are already added' : 'No matching groups'}
                </p>
              ) : (
                filteredAddGroups.map((g) => (
                  <div key={g.id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Users className="size-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{g.name}</p>
                        <p className="text-xs text-slate-400">{g.beneficiaryIds.length} members</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { void addGroup(g.id) }}
                      className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <UserPlus className="size-3" />
                      Add
                    </button>
                  </div>
                ))
              )
            ) : (
              filteredAddBeneficiaries.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-4">
                  {unselectedBeneficiaries.length === 0 ? 'All beneficiaries are already added' : 'No matching beneficiaries'}
                </p>
              ) : (
                filteredAddBeneficiaries.map((b) => (
                  <div key={b.id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 shrink-0">
                        {b.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{b.name}</p>
                        <p className="text-xs text-slate-400">{b.location}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { void addBeneficiary(b.id) }}
                      className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <UserPlus className="size-3" />
                      Add
                    </button>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={subTab === 'groups' ? 'Search groups…' : 'Search beneficiaries…'}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
        />
      </div>

      {/* List */}
      {subTab === 'groups' ? (
        <div className="space-y-2">
          {filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="size-8 text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">
                {selectedGroups.length === 0 ? 'No groups added yet' : 'No matching groups'}
              </p>
            </div>
          ) : (
            filteredGroups.map((g) => (
              <div key={g.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white group">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <Users className="size-5 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{g.name}</p>
                  {g.description && <p className="text-xs text-slate-400 truncate mt-0.5">{g.description}</p>}
                  <p className="text-xs text-slate-400 mt-0.5">{g.beneficiaryIds.length} members</p>
                </div>
                <button
                  onClick={() => { void removeGroup(g.id) }}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-all"
                >
                  <UserMinus className="size-3" />
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBeneficiaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <User className="size-8 text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">
                {selectedBeneficiaries.length === 0 ? 'No beneficiaries added yet' : 'No matching beneficiaries'}
              </p>
            </div>
          ) : (
            filteredBeneficiaries.map((b) => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white group">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600 shrink-0">
                  {b.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{b.name}</p>
                  <p className="text-xs text-slate-400">{b.location} · {b.gender} · {b.age}y</p>
                </div>
                <button
                  onClick={() => { void removeBeneficiary(b.id) }}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-all"
                >
                  <UserMinus className="size-3" />
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// --- Tab: Transmission Logs ---

interface LogsTabProps {
  campaign: Campaign
  logs: ReturnType<typeof useCampaignTransmissionLogs>['logs']
  beneficiaries: Beneficiary[]
  onAddLog: ReturnType<typeof useCampaignTransmissionLogs>['addLog']
  onClearLogs: ReturnType<typeof useCampaignTransmissionLogs>['clearLogs']
}

function LogsTab({ campaign, logs, beneficiaries, onAddLog, onClearLogs }: LogsTabProps) {
  const [filter, setFilter] = React.useState('')

  const filteredLogs = logs.filter((l) =>
    (l.beneficiaryName ?? '').toLowerCase().includes(filter.toLowerCase()) ||
    l.status.toLowerCase().includes(filter.toLowerCase()),
  )

  const counts = {
    total: logs.length,
    sent: logs.filter((l) => l.status === 'Sent').length,
    delivered: logs.filter((l) => l.status === 'Delivered').length,
    failed: logs.filter((l) => l.status === 'Failed').length,
    pending: logs.filter((l) => l.status === 'Pending').length,
  }

  return (
    <div className="px-6 py-6">
      {/* Stats row */}
      {logs.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: counts.total, color: 'bg-slate-100 text-slate-700' },
            { label: 'Delivered', value: counts.delivered, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Failed', value: counts.failed, color: 'bg-rose-100 text-rose-700' },
            { label: 'Pending', value: counts.pending, color: 'bg-slate-100 text-slate-600' },
          ].map((stat) => (
            <div key={stat.label} className={cn('rounded-xl px-4 py-3', stat.color)}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter logs…"
            value={filter}
            onChange={(e) => setFilter(e.currentTarget.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
          />
        </div>
        {logs.length > 0 && (
          <button
            onClick={() => { void onClearLogs() }}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-colors"
          >
            <Trash2 className="size-3.5" />
            Clear logs
          </button>
        )}
      </div>

      {/* Table */}
      {filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Search className="size-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500">
            {logs.length === 0 ? 'No transmission logs yet' : 'No matching logs'}
          </p>
          {logs.length === 0 && (
            <p className="text-xs text-slate-400 mt-1">Logs will appear here once the campaign is sent</p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Beneficiary</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {log.beneficiaryName ?? beneficiaries.find((b) => b.id === log.beneficiaryId)?.name ?? log.beneficiaryId}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={TRANSMISSION_STATUS_COLORS[log.status]}>{log.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {log.errorMessage ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
