import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BeneficiaryForm, loadBeneficiaries } from '@rahataid/projects-shared/beneficiary'

export const Route = createFileRoute('/_app/projects/$id/beneficiaries/$beneficiaryId/edit')({
  component: BeneficiaryEditPage,
})

function BeneficiaryEditPage() {
  const { id, beneficiaryId } = Route.useParams()
  const navigate = useNavigate()

  const beneficiary = loadBeneficiaries(id).find((b) => b.id === beneficiaryId)

  if (!beneficiary) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Beneficiary not found.
      </div>
    )
  }

  return (
    <BeneficiaryForm
      projectId={id}
      beneficiary={beneficiary}
      onSave={() => navigate({ to: '/projects/$id/beneficiaries', params: { id } })}
      onCancel={() => navigate({ to: '/projects/$id/beneficiaries', params: { id } })}
    />
  )
}
