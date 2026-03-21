import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BenefitFormPage, getRegisteredBenefitTypes } from '@rahataid/projects-shared/benefits'
import { useProject } from '@rahataid/projects-shared/project'
import { isPluginEnabled } from '../plugins/plugin-state'

export const Route = createFileRoute('/_app/projects/$id/benefits/$benefitId/edit')({ component: EditBenefitPage })

function EditBenefitPage() {
  const { id, benefitId } = Route.useParams()
  const navigate = useNavigate()
  const { data: project } = useProject(id)

  const primaryToken = project?.primaryToken ?? 'cUSD'
  const availableBenefitTypes = getRegisteredBenefitTypes().filter((t) => isPluginEnabled(t.type))

  const goToDetail = () => navigate({ to: '/projects/$id/benefits/$benefitId', params: { id, benefitId } })
  const goBack = () => navigate({ to: '/projects/$id/benefits', params: { id }, search: { benefit: undefined } })

  return <BenefitFormPage projectId={id} primaryToken={primaryToken} availableTokens={['cUSD', 'cEUR', 'cNPR']} availableBenefitTypes={availableBenefitTypes} benefitId={benefitId} onDone={goToDetail} onCancel={goBack} />
}
