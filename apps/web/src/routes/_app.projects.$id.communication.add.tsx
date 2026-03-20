import { createFileRoute } from '@tanstack/react-router'
import { CampaignFormPage } from '@rahataid/projects-shared'

export const Route = createFileRoute('/_app/projects/$id/communication/add')({
  component: CampaignAddPage,
})

function CampaignAddPage() {
  const { id } = Route.useParams()

  return <CampaignFormPage projectId={id} />
}
