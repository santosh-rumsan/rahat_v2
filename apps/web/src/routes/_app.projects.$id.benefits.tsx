import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BenefitList } from '@rahataid/projects-shared/benefits'

export const Route = createFileRoute('/_app/projects/$id/benefits')({
  validateSearch: (search: Record<string, unknown>) => ({
    benefit: typeof search.benefit === 'string' ? search.benefit : undefined,
  }),
  component: BenefitsPage,
})

function BenefitsPage() {
  const { id } = Route.useParams()
  const { benefit } = Route.useSearch()
  const navigate = useNavigate()

  function handleBenefitSelect(benefitId: string | undefined) {
    navigate({ to: '/projects/$id/benefits', params: { id }, search: { benefit: benefitId } })
  }

  return <BenefitList projectId={id} initialBenefitId={benefit} onBenefitSelect={handleBenefitSelect} />
}
