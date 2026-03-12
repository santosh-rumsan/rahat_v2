import * as React from 'react'
import { ArrowLeft } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@rs/ui/card'
import { Badge } from '@rs/ui/badge'
import { Button } from '@rs/ui/button'
import type { Beneficiary } from './types.js'

const STATUS_COLORS: Record<Beneficiary['status'], string> = {
  Verified: 'bg-green-100 text-green-700 border-green-200',
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Inactive: 'bg-gray-100 text-gray-500 border-gray-200',
}

export interface BeneficiaryDetailProps {
  beneficiary: Beneficiary
  onBack?: () => void
}

export function BeneficiaryDetail({
  beneficiary,
  onBack,
}: BeneficiaryDetailProps) {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-2">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={14} />
            Back
          </Button>
        )}
        <h1 className="text-lg font-semibold">{beneficiary.name}</h1>
        <Badge
          variant="outline"
          className={STATUS_COLORS[beneficiary.status]}
        >
          {beneficiary.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground flex-shrink-0">
                  {beneficiary.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{beneficiary.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {beneficiary.location}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <span className="text-muted-foreground">Age</span>
                <span>{beneficiary.age}</span>
                <span className="text-muted-foreground">Gender</span>
                <span>{beneficiary.gender}</span>
                <span className="text-muted-foreground">Phone</span>
                <span>{beneficiary.phone ?? '—'}</span>
                <span className="text-muted-foreground">Location</span>
                <span>{beneficiary.location}</span>
                <span className="text-muted-foreground">Enrolled</span>
                <span>{beneficiary.enrolledDate}</span>
                {beneficiary.householdSize !== undefined && (
                  <>
                    <span className="text-muted-foreground">Household</span>
                    <span>{beneficiary.householdSize} members</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {beneficiary.notes ? (
              <p className="text-sm text-muted-foreground">
                {beneficiary.notes}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No notes recorded.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
