import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BenefitFormPage } from '@rahataid/projects-shared/benefits'
import { useProject } from '@rahataid/projects-shared/project'

export const Route = createFileRoute('/_app/projects/$id/benefits/$benefitId/edit')({ component: EditBenefitPage })

function EditBenefitPage() {
  const { id, benefitId } = Route.useParams()
  const navigate = useNavigate()
  const { data: project } = useProject(id)

  const primaryToken = project?.primaryToken ?? 'cUSD'

  const goToDetail = () => navigate({ to: '/projects/$id/benefits/$benefitId', params: { id, benefitId } })
  const goBack = () => navigate({ to: '/projects/$id/benefits', params: { id }, search: { benefit: undefined } })

  return <BenefitFormPage projectId={id} primaryToken={primaryToken} availableTokens={['cUSD', 'cEUR', 'cNPR']} benefitId={benefitId} onDone={goToDetail} onCancel={goBack} />
}
