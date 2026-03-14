import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { VendorForm, useVendor } from '@rahataid/projects-shared/vendor'

export const Route = createFileRoute('/_app/vendors/$vendorId/edit')({
  component: VendorEditPage,
})

function VendorEditPage() {
  const { vendorId } = Route.useParams()
  const navigate = useNavigate()
  const { data: vendor, isLoading } = useVendor(vendorId)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Loading...
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Vendor not found.
      </div>
    )
  }

  return (
    <VendorForm
      vendor={vendor}
      onSave={() => navigate({ to: '/vendors' })}
      onCancel={() => navigate({ to: '/vendors' })}
    />
  )
}
