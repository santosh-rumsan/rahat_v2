import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BeneficiaryForm } from '@rahataid/projects-shared/beneficiary'

export const Route = createFileRoute('/_app/projects/$id/beneficiaries/add')({
  component: BeneficiaryAddPage,
})

function BeneficiaryAddPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  return (
    <BeneficiaryForm
      projectId={id}
      onSave={() => navigate({ to: '/projects/$id/beneficiaries', params: { id } })}
      onCancel={() => navigate({ to: '/projects/$id/beneficiaries', params: { id } })}
    />
  )
}
