import { createFileRoute } from '@tanstack/react-router'
import { CampaignFormPage } from '@rahataid/projects-shared'
import { isPluginEnabled } from '../plugins/plugin-state'

export const Route = createFileRoute('/_app/projects/$id/communication/add')({
  component: CampaignAddPage,
})

function CampaignAddPage() {
  const { id } = Route.useParams()

  return <CampaignFormPage projectId={id} isCommTypeEnabled={isPluginEnabled} />
}
