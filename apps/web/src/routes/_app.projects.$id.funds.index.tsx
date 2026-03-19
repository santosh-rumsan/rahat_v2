import { createFileRoute } from '@tanstack/react-router'
import { FundManagementPage } from '@rahataid/projects-shared/fund-management'

export const Route = createFileRoute('/_app/projects/$id/funds/')({ component: FundManagementIndexPage })

function FundManagementIndexPage() {
  const { id } = Route.useParams()
  return <FundManagementPage projectId={id} />
}
