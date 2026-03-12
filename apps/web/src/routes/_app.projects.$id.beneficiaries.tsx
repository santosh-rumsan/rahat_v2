import { createFileRoute } from '@tanstack/react-router'
import { BeneficiaryList } from '@rahataid/projects-shared/beneficiary'

export const Route = createFileRoute('/_app/projects/$id/beneficiaries')({ component: BeneficiariesPage })

function BeneficiariesPage() {
  return <BeneficiaryList onAdd={() => {}} />
}
