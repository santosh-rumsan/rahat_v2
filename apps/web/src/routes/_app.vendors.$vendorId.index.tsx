import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { VendorDetail, useVendor } from '@rahataid/projects-shared/vendor'

export const Route = createFileRoute('/_app/vendors/$vendorId/')({
  component: VendorDetailPage,
})

function VendorDetailPage() {
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
    <VendorDetail
      vendor={vendor}
      onBack={() => navigate({ to: '/vendors' })}
      onEdit={(v) => navigate({ to: '/vendors/$vendorId/edit', params: { vendorId: v.id } })}
      onDeleted={() => navigate({ to: '/vendors' })}
    />
  )
}
