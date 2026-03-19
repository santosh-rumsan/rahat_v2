import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BenefitFormPage } from '@rahataid/projects-shared/benefits'
import { useProject } from '@rahataid/projects-shared/project'

export const Route = createFileRoute('/_app/projects/$id/benefits/new')({ component: NewBenefitPage })

function NewBenefitPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: project } = useProject(id)

  const primaryToken = project?.primaryToken ?? 'cUSD'

  const goBack = () => navigate({ to: '/projects/$id/benefits', params: { id }, search: { benefit: undefined } })

  function handleDone(benefitId: string) {
    navigate({ to: '/projects/$id/benefits/$benefitId', params: { id, benefitId } })
  }

  return <BenefitFormPage projectId={id} primaryToken={primaryToken} availableTokens={['cUSD', 'cEUR', 'cNPR']} onDone={handleDone} onCancel={goBack} />
}
