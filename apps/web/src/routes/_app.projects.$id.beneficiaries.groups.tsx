import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BeneficiaryGroups } from '@rahataid/projects-shared/beneficiary'

export const Route = createFileRoute('/_app/projects/$id/beneficiaries/groups')({
  validateSearch: (search: Record<string, unknown>) => ({
    group: typeof search.group === 'string' ? search.group : undefined,
  }),
  component: BeneficiaryGroupsPage,
})

function BeneficiaryGroupsPage() {
  const { id } = Route.useParams()
  const { group } = Route.useSearch()
  const navigate = useNavigate()

  function handleGroupSelect(groupId: string | undefined) {
    navigate({ to: '/projects/$id/beneficiaries/groups', params: { id }, search: { group: groupId } })
  }

  return <BeneficiaryGroups projectId={id} initialGroupId={group} onGroupSelect={handleGroupSelect} />
}
