import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/forecast')({ component: ForecastLayout })

function ForecastLayout() {
  return <Outlet />
}
