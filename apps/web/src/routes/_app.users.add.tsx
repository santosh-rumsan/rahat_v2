import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { UserForm } from '../lib/user/user-form.js'

export const Route = createFileRoute('/_app/users/add')({ component: UserAddPage })

function UserAddPage() {
  const navigate = useNavigate()

  return (
    <UserForm
      onSave={() => navigate({ to: '/users' })}
      onCancel={() => navigate({ to: '/users' })}
    />
  )
}
