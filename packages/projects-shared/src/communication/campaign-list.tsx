import * as React from 'react'
import { Plus, Megaphone, Trash2, Search, Users } from 'lucide-react'
import { cn } from '@rs/ui'
import { Badge } from '@rs/ui/badge'
import type { ProjectSummary } from '@rahataid/plugin-sdk'
import { useProjectCampaigns } from './hooks.js'
import { CAMPAIGN_STATUS_COLORS, COMM_TYPE_COLORS, COMM_TYPE_ICONS } from './types.js'
import type { Campaign } from './types.js'

export interface CommunicationModuleProps {
  project: ProjectSummary
}

export function CommunicationModule({ project }: CommunicationModuleProps) {
  const { campaigns, deleteCampaign } = useProjectCampaigns(project.id)
  const [search, setSearch] = React.useState('')

  const filteredCampaigns = campaigns.filter((campaign) => {
    const query = search.trim().toLowerCase()
    if (!query) return true

    return [
      campaign.name,
      campaign.description,
      campaign.status,
      campaign.communicationType,
    ].some((value) => value?.toLowerCase().includes(query))
  })

  function handleAdd() {
    window.location.href = `/projects/${project.id}/communication/add`
  }

  function handleRowClick(campaign: Campaign) {
    window.location.href = `/projects/${project.id}/communication/${campaign.id}`
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    await deleteCampaign(id)
  }

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <div className="px-8 pt-7 pb-5 border-b border-gray-100 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1a1a1a]">Communication Campaigns</h1>
          <p className="text-sm text-gray-400 mt-1">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              placeholder="Search campaigns"
              className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <button
            onClick={handleAdd}
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-600 whitespace-nowrap"
          >
            New Campaign
          </button>
        </div>
      </div>

      <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map((campaign) => {
          const recipientCount = campaign.beneficiaryIds.length
          const groupCount = campaign.beneficiaryGroupIds.length

          return (
            <div
              key={campaign.id}
              role="button"
              tabIndex={0}
              onClick={() => handleRowClick(campaign)}
              onKeyDown={(e) => e.key === 'Enter' && handleRowClick(campaign)}
              className="text-left p-5 rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-lg', COMM_TYPE_COLORS[campaign.communicationType])}>
                  <span>{COMM_TYPE_ICONS[campaign.communicationType]}</span>
                </div>
                <button
                  onClick={(e) => { void handleDelete(e, campaign.id) }}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  title="Delete campaign"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-sm font-bold text-[#1a1a1a]">{campaign.name}</h3>
                <Badge className={CAMPAIGN_STATUS_COLORS[campaign.status]}>{campaign.status}</Badge>
              </div>

              {campaign.description && (
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{campaign.description}</p>
              )}

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={cn('inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold', COMM_TYPE_COLORS[campaign.communicationType])}>
                  <span>{COMM_TYPE_ICONS[campaign.communicationType]}</span>
                  <span>{campaign.communicationType === 'sms' ? 'SMS' : campaign.communicationType === 'whatsapp' ? 'WhatsApp' : 'Voice'}</span>
                </span>
                <span className="text-[10px] text-gray-400">
                  Created {new Date(campaign.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <Users size={12} className="text-gray-400" />
                <span>
                  {recipientCount === 0 && groupCount === 0
                    ? 'No recipients'
                    : `${recipientCount} individual${recipientCount !== 1 ? 's' : ''}${groupCount > 0 ? `, ${groupCount} group${groupCount !== 1 ? 's' : ''}` : ''}`}
                </span>
              </div>
            </div>
          )
        })}

        {campaigns.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Megaphone size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No campaigns yet</p>
            <p className="text-xs text-gray-400 mt-1">Create a campaign to send messages to beneficiaries</p>
          </div>
        )}

        {campaigns.length > 0 && filteredCampaigns.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Search size={22} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No matching campaigns</p>
            <p className="text-xs text-gray-400 mt-1">Try a different name, type, or status</p>
          </div>
        )}
      </div>
    </div>
  )
}
