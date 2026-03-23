import * as React from 'react'
import { ArrowLeft, Calendar, Phone, Users } from 'lucide-react'
import {
  Card,
  CardContent,
} from '@rs/ui/card'
import { Badge } from '@rs/ui/badge'
import { Button } from '@rs/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@rs/ui/tabs'
import type { Beneficiary } from './types.js'

const STATUS_COLORS: Record<Beneficiary['status'], string> = {
  Verified: 'bg-green-100 text-green-700 border-green-200',
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Inactive: 'bg-gray-100 text-gray-500 border-gray-200',
}

export interface BeneficiaryDetailProps {
  beneficiary: Beneficiary
  onBack?: () => void
  hideHeader?: boolean
}

export function BeneficiaryDetail({
  beneficiary,
  onBack,
  hideHeader = false,
}: BeneficiaryDetailProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {!hideHeader && (
        <div className="flex items-center gap-2 mb-4">
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
      )}

      <Tabs defaultValue="basic-info" className="flex flex-col flex-1 min-h-0">
        <TabsList>
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">Enrolled</p>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-gray-400" />
                <p className="text-sm font-semibold text-[#1a1a1a]">{beneficiary.enrolledDate}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">Household size</p>
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-gray-400" />
                <p className="text-sm font-semibold text-[#1a1a1a]">
                  {beneficiary.householdSize ?? '—'} members
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">Phone</p>
              <div className="flex items-center gap-1.5">
                <Phone size={13} className="text-gray-400" />
                <p className="text-sm font-semibold text-[#1a1a1a]">{beneficiary.phone ?? '—'}</p>
              </div>
            </div>
          </div>

          <h3 className="text-base font-bold text-[#1a1a1a] mb-4">Profile details</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {[
              { label: 'Full name', value: beneficiary.name },
              { label: 'Age', value: String(beneficiary.age) },
              { label: 'Gender', value: beneficiary.gender },
              { label: 'Phone', value: beneficiary.phone ?? '—' },
              { label: 'Email', value: beneficiary.email ?? '—' },
              { label: 'Location', value: beneficiary.location },
              { label: 'Status', value: beneficiary.status },
            ].map((field) => (
              <div key={field.label}>
                <p className="text-xs text-gray-400 mb-1">{field.label}</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{field.value}</p>
              </div>
            ))}
          </div>

          {beneficiary.notes && (
            <div className="mt-8">
              <h3 className="text-base font-bold text-[#1a1a1a] mb-2">Notes</h3>
              <p className="text-sm text-gray-500">{beneficiary.notes}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="communications" className="px-8 py-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No communications recorded.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="px-8 py-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No benefits assigned.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="px-8 py-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No logs found.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
