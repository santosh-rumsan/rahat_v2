import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { VendorList } from '@rahataid/projects-shared/vendor'
import type { Vendor } from '@rahataid/sdk'

export const Route = createFileRoute('/_app/vendors/')({ component: VendorsPage })

function VendorsPage() {
  const navigate = useNavigate()

  function handleAdd() {
    navigate({ to: '/vendors/add' })
  }

  function handleEdit(vendor: Vendor) {
    navigate({ to: '/vendors/$vendorId/edit', params: { vendorId: vendor.id } })
  }

  function handleRowClick(vendor: Vendor) {
    navigate({ to: '/vendors/$vendorId', params: { vendorId: vendor.id } })
  }

  return <VendorList onAdd={handleAdd} onEdit={handleEdit} onRowClick={handleRowClick} />
}
