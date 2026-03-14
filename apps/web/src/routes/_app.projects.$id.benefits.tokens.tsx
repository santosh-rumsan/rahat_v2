import { createFileRoute } from '@tanstack/react-router'
import { TokenAssignment } from '@rahataid/projects-shared/benefits'

export const Route = createFileRoute('/_app/projects/$id/benefits/tokens')({ component: TokensPage })

function TokensPage() {
  const { id } = Route.useParams()
  return <TokenAssignment projectId={id} />
}
