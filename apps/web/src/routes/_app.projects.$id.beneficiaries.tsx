import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BeneficiaryList } from '@rahataid/projects-shared/beneficiary'
import type { Beneficiary } from '@rahataid/projects-shared/beneficiary'

export const Route = createFileRoute('/_app/projects/$id/beneficiaries')({ component: BeneficiariesPage })

function BeneficiariesPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  function handleAdd() {
    navigate({ to: '/projects/$id/beneficiaries/add', params: { id } })
  }

  function handleEdit(beneficiary: Beneficiary) {
    navigate({ to: '/projects/$id/beneficiaries/$beneficiaryId/edit', params: { id, beneficiaryId: beneficiary.id } })
  }

  return <BeneficiaryList projectId={id} onAdd={handleAdd} onEdit={handleEdit} />
}
