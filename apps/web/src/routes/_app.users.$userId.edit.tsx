import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { UserForm } from '../lib/user/user-form.js'
import { useUser } from '../lib/user/queries.js'

export const Route = createFileRoute('/_app/users/$userId/edit')({ component: UserEditPage })

function UserEditPage() {
  const { userId } = Route.useParams()
  const navigate = useNavigate()
  const { data: user, isLoading } = useUser(userId)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        User not found.
      </div>
    )
  }

  return (
    <UserForm
      user={user}
      onSave={() => navigate({ to: '/users' })}
      onCancel={() => navigate({ to: '/users' })}
    />
  )
}
