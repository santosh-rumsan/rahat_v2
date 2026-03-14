import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { VendorForm } from '@rahataid/projects-shared/vendor'

export const Route = createFileRoute('/_app/vendors/add')({
  component: VendorAddPage,
})

function VendorAddPage() {
  const navigate = useNavigate()

  return (
    <VendorForm
      onSave={() => navigate({ to: '/vendors' })}
      onCancel={() => navigate({ to: '/vendors' })}
    />
  )
}
