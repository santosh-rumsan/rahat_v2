import { createFileRoute } from '@tanstack/react-router'
import { MessageSquare, PhoneCall, Coins, CheckCircle2, XCircle, Settings } from 'lucide-react'

export const Route = createFileRoute('/_app/services')({ component: Services })

const services = [
  {
    id: 'sms',
    name: 'SMS Service',
    description: 'Send bulk SMS notifications to beneficiaries for aid distribution alerts, OTP verification, and programme updates.',
    icon: MessageSquare,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    status: 'Active',
    stats: [
      { label: 'Messages sent', value: '48,290' },
      { label: 'Delivery rate', value: '97.4%' },
      { label: 'Provider', value: 'Sparrow SMS' },
    ],
    features: ['Bulk messaging', 'OTP delivery', 'Two-way SMS', 'Delivery reports'],
  },
  {
    id: 'ivr',
    name: 'IVR Service',
    description: 'Interactive Voice Response system allowing beneficiaries to check their aid status and receive voice-based instructions.',
    icon: PhoneCall,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    status: 'Active',
    stats: [
      { label: 'Calls handled', value: '12,043' },
      { label: 'Avg. duration', value: '2m 14s' },
      { label: 'Provider', value: 'Ncell IVR' },
    ],
    features: ['Automated call flows', 'Multi-language support', 'Balance enquiry', 'Status check'],
  },
  {
    id: 'token',
    name: 'Token Service',
    description: 'Digital voucher and token issuance system enabling cashless aid distribution to registered beneficiaries.',
    icon: Coins,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    status: 'Active',
    stats: [
      { label: 'Tokens issued', value: '9,870' },
      { label: 'Redemption rate', value: '91.2%' },
      { label: 'Token type', value: 'QR / NFC' },
    ],
    features: ['QR code tokens', 'NFC support', 'Vendor redemption', 'Expiry management'],
  },
]

function Services() {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and monitor active delivery services.</p>
      </div>

      <div className="flex-1 px-8 py-6 space-y-5">
        {services.map((svc) => {
          const Icon = svc.icon
          const isActive = svc.status === 'Active'
          return (
            <div key={svc.id} className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-start gap-5">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${svc.iconBg}`}>
                  <Icon size={22} className={svc.iconColor} />
                </div>

                {/* Main */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-base font-semibold text-gray-900">{svc.name}</h2>
                    <span
                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                        isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {svc.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 max-w-2xl">{svc.description}</p>

                  {/* Stats row */}
                  <div className="flex gap-6 mb-4">
                    {svc.stats.map((s) => (
                      <div key={s.label}>
                        <p className="text-xs text-gray-400">{s.label}</p>
                        <p className="text-sm font-semibold text-gray-800">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Feature pills */}
                  <div className="flex flex-wrap gap-2">
                    {svc.features.map((f) => (
                      <span key={f} className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 bg-white px-3 py-2 rounded-xl transition-colors flex-shrink-0">
                  <Settings size={13} />
                  Configure
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
