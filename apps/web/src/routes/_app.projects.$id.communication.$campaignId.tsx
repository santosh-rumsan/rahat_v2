import { createFileRoute } from '@tanstack/react-router'
import { CampaignDetailPage } from '@rahataid/projects-shared'

export const Route = createFileRoute('/_app/projects/$id/communication/$campaignId')({
  component: CampaignDetailRoute,
})

function CampaignDetailRoute() {
  const { id, campaignId } = Route.useParams()

  return <CampaignDetailPage projectId={id} campaignId={campaignId} />
}
