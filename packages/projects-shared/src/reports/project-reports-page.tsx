import * as React from 'react'
import { Users, CheckCircle, Calendar, Home } from 'lucide-react'
import { useBeneficiaries } from '../beneficiary/queries.js'
import type { Beneficiary } from '@rahataid/sdk'

// ─── small chart primitives ───────────────────────────────────────────────────

interface DonutSegment {
  label: string
  value: number
  color: string
}

function DonutChart({ segments }: { segments: DonutSegment[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  let cumulative = 0
  const stops = segments
    .filter((s) => s.value > 0)
    .map(({ color, value }) => {
      const pct = (value / total) * 100
      const start = cumulative
      cumulative += pct
      return `${color} ${start.toFixed(1)}% ${cumulative.toFixed(1)}%`
    })

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              total > 0 ? `conic-gradient(${stops.join(', ')})` : '#e5e7eb',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-full bg-white flex items-center justify-center"
            style={{ width: 70, height: 70 }}
          >
            <span className="text-lg font-black text-gray-800">
              {total > 0 ? total : '—'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 flex-1">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-sm text-gray-600 flex-1">{s.label}</span>
            <span className="text-sm font-semibold text-gray-900">{s.value}</span>
            {total > 0 && (
              <span className="text-xs text-gray-400 w-8 text-right">
                {Math.round((s.value / total) * 100)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function HorizBar({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600 truncate max-w-[160px]">{label}</span>
        <span className="font-semibold text-gray-900 ml-2 flex-shrink-0">{value}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="h-28 flex items-center justify-center text-sm text-gray-400">
      No data available
    </div>
  )
}

// ─── stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  colorClass,
}: {
  label: string
  value: string
  sub: string
  icon: React.ElementType
  colorClass: string
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export interface ProjectReportsPageProps {
  projectId: string
}

export function ProjectReportsPage({ projectId }: ProjectReportsPageProps) {
  const { data: beneficiaries = [], isLoading } = useBeneficiaries(projectId)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
      </div>
    )
  }

  const total = beneficiaries.length

  // Status
  const verified = beneficiaries.filter((b: Beneficiary) => b.status === 'Verified').length
  const pending = beneficiaries.filter((b: Beneficiary) => b.status === 'Pending').length
  const inactive = beneficiaries.filter((b: Beneficiary) => b.status === 'Inactive').length

  // Gender
  const male = beneficiaries.filter((b: Beneficiary) => b.gender === 'Male').length
  const female = beneficiaries.filter((b: Beneficiary) => b.gender === 'Female').length
  const other = beneficiaries.filter((b: Beneficiary) => b.gender === 'Other').length

  // Age
  const ages = beneficiaries.map((b: Beneficiary) => b.age)
  const avgAge =
    ages.length > 0
      ? Math.round(ages.reduce((s: number, a: number) => s + a, 0) / ages.length)
      : 0
  const age0_17 = ages.filter((a: number) => a <= 17).length
  const age18_35 = ages.filter((a: number) => a >= 18 && a <= 35).length
  const age36_50 = ages.filter((a: number) => a >= 36 && a <= 50).length
  const age51plus = ages.filter((a: number) => a >= 51).length
  const maxAgeGroup = Math.max(age0_17, age18_35, age36_50, age51plus, 1)

  // Household size
  const householdSizes = beneficiaries
    .filter((b: Beneficiary) => b.householdSize !== undefined)
    .map((b: Beneficiary) => b.householdSize!)
  const avgHousehold =
    householdSizes.length > 0
      ? (householdSizes.reduce((s: number, h: number) => s + h, 0) / householdSizes.length).toFixed(1)
      : '—'

  // Top locations
  const locationMap: Record<string, number> = {}
  for (const b of beneficiaries) {
    locationMap[b.location] = (locationMap[b.location] ?? 0) + 1
  }
  const topLocations = Object.entries(locationMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
  const maxLocation = topLocations[0]?.[1] ?? 1

  // Monthly enrollment trend
  const monthlyMap: Record<string, number> = {}
  for (const b of beneficiaries) {
    if (!b.enrolledDate) continue
    const key = b.enrolledDate.substring(0, 7) // YYYY-MM
    monthlyMap[key] = (monthlyMap[key] ?? 0) + 1
  }
  const months = Object.keys(monthlyMap).sort()
  const recentMonths = months.slice(-12)
  const maxMonthCount = Math.max(...recentMonths.map((m) => monthlyMap[m] ?? 0), 1)

  const emptyState = total === 0

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Beneficiary demographics for this project
        </p>
      </div>

      <div className="flex-1 px-8 py-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Total Beneficiaries"
            value={total.toLocaleString()}
            sub="enrolled in this project"
            icon={Users}
            colorClass="bg-blue-50 text-blue-500"
          />
          <StatCard
            label="Verified"
            value={verified.toLocaleString()}
            sub={total > 0 ? `${Math.round((verified / total) * 100)}% of total` : '—'}
            icon={CheckCircle}
            colorClass="bg-green-50 text-green-500"
          />
          <StatCard
            label="Average Age"
            value={avgAge > 0 ? `${avgAge} yrs` : '—'}
            sub={`${ages.length} with age data`}
            icon={Calendar}
            colorClass="bg-orange-50 text-orange-500"
          />
          <StatCard
            label="Avg. Household Size"
            value={String(avgHousehold)}
            sub={`${householdSizes.length} with data`}
            icon={Home}
            colorClass="bg-purple-50 text-purple-500"
          />
        </div>

        {/* Row 2: Gender | Status | Age */}
        <div className="grid grid-cols-3 gap-4">
          {/* Gender distribution */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Gender Distribution</h2>
            {!emptyState ? (
              <DonutChart
                segments={[
                  { label: 'Male', value: male, color: '#3b82f6' },
                  { label: 'Female', value: female, color: '#ec4899' },
                  { label: 'Other / Unknown', value: other, color: '#a855f7' },
                ]}
              />
            ) : (
              <EmptyChart />
            )}
          </div>

          {/* Verification status */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Verification Status</h2>
            {!emptyState ? (
              <div className="space-y-4">
                <HorizBar label="Verified" value={verified} max={total} color="#22c55e" />
                <HorizBar label="Pending" value={pending} max={total} color="#facc15" />
                <HorizBar label="Inactive" value={inactive} max={total} color="#d1d5db" />
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Verification rate</span>
                  <span className="text-sm font-semibold text-green-600">
                    {Math.round((verified / total) * 100)}%
                  </span>
                </div>
              </div>
            ) : (
              <EmptyChart />
            )}
          </div>

          {/* Age groups */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Age Groups</h2>
            {ages.length > 0 ? (
              <div className="space-y-4">
                <HorizBar label="0–17 (children)" value={age0_17} max={maxAgeGroup} color="#f97316" />
                <HorizBar label="18–35 (young adults)" value={age18_35} max={maxAgeGroup} color="#f97316" />
                <HorizBar label="36–50 (adults)" value={age36_50} max={maxAgeGroup} color="#f97316" />
                <HorizBar label="51+ (seniors)" value={age51plus} max={maxAgeGroup} color="#f97316" />
              </div>
            ) : (
              <EmptyChart />
            )}
          </div>
        </div>

        {/* Row 3: Locations | Enrollment trend */}
        <div className="grid grid-cols-2 gap-4">
          {/* Top locations */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Top Locations</h2>
            {topLocations.length > 0 ? (
              <div className="space-y-3">
                {topLocations.map(([location, count]) => (
                  <HorizBar
                    key={location}
                    label={location}
                    value={count}
                    max={maxLocation}
                    color="#6366f1"
                  />
                ))}
              </div>
            ) : (
              <EmptyChart />
            )}
          </div>

          {/* Monthly enrollment */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">
              Enrollment Over Time
              {recentMonths.length > 0 && (
                <span className="text-xs text-gray-400 font-normal ml-2">
                  (last {recentMonths.length} months)
                </span>
              )}
            </h2>
            {recentMonths.length > 0 ? (
              <div className="flex items-end gap-1.5 h-28 pt-2">
                {recentMonths.map((month) => {
                  const count = monthlyMap[month] ?? 0
                  const heightPct = (count / maxMonthCount) * 100
                  const label = month.substring(5) // MM
                  return (
                    <div
                      key={month}
                      className="flex-1 flex flex-col items-center gap-1 group relative"
                    >
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {month}: {count}
                      </div>
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className="w-full rounded-t-sm bg-orange-400 hover:bg-orange-500 transition-colors"
                          style={{ height: `${heightPct}%`, minHeight: count > 0 ? 4 : 0 }}
                        />
                      </div>
                      <span className="text-[9px] text-gray-400 flex-shrink-0">{label}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyChart />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
