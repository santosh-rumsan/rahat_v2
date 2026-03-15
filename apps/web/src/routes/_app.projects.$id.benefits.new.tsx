import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BenefitFormPage } from '@rahataid/projects-shared/benefits'

export const Route = createFileRoute('/_app/projects/$id/benefits/new')({ component: NewBenefitPage })

function NewBenefitPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  const goBack = () => navigate({ to: '/projects/$id/benefits', params: { id }, search: { benefit: undefined } })

  return <BenefitFormPage projectId={id} onDone={goBack} onCancel={goBack} />
}
