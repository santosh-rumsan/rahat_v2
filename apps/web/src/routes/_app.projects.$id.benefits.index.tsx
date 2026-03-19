import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BenefitList } from '@rahataid/projects-shared/benefits'

export const Route = createFileRoute('/_app/projects/$id/benefits/')({
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
    if (benefitId) {
      navigate({ to: '/projects/$id/benefits/$benefitId', params: { id, benefitId } })
    } else {
      navigate({ to: '/projects/$id/benefits/', params: { id }, search: { benefit: undefined } })
    }
  }

  function handleAssign(benefitId: string) {
    navigate({ to: '/projects/$id/benefits/add', params: { id }, search: { benefitId, benefit: undefined } })
  }

  function handleAdd() {
    navigate({ to: '/projects/$id/benefits/new', params: { id }, search: { benefit: undefined } })
  }

  function handleEdit(benefitId: string) {
    navigate({ to: '/projects/$id/benefits/$benefitId/edit', params: { id, benefitId }, search: { benefit: undefined } })
  }

  return (
    <BenefitList
      projectId={id}
      initialBenefitId={benefit}
      onBenefitSelect={handleBenefitSelect}
      onAssign={handleAssign}
      onAdd={handleAdd}
      onEdit={handleEdit}
    />
  )
}
