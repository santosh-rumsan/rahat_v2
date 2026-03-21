import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BenefitFormPage, getRegisteredBenefitTypes } from '@rahataid/projects-shared/benefits'
import { useProject } from '@rahataid/projects-shared/project'
import { isPluginEnabled } from '../plugins/plugin-state'

export const Route = createFileRoute('/_app/projects/$id/benefits/new')({ component: NewBenefitPage })

function NewBenefitPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: project } = useProject(id)

  const primaryToken = project?.primaryToken ?? 'cUSD'
  const availableBenefitTypes = getRegisteredBenefitTypes().filter((t) => isPluginEnabled(t.type))

  const goBack = () => navigate({ to: '/projects/$id/benefits', params: { id }, search: { benefit: undefined } })

  function handleDone(benefitId: string) {
    navigate({ to: '/projects/$id/benefits/$benefitId', params: { id, benefitId } })
  }

  return <BenefitFormPage projectId={id} primaryToken={primaryToken} availableTokens={['cUSD', 'cEUR', 'cNPR']} availableBenefitTypes={availableBenefitTypes} onDone={handleDone} onCancel={goBack} />
}
