import { Search, Plus, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-500',
  Pending: 'bg-yellow-100 text-yellow-700',
}

const vendors = [
  { name: 'Aasha Suppliers Pvt. Ltd.', type: 'Food & Groceries', contact: 'Ram Shrestha', email: 'ram@aasha.com.np', phone: '+977-1-4234567', status: 'Active', projects: 3 },
  { name: 'Himalayan Hardware Store', type: 'Construction Materials', contact: 'Sita Gurung', email: 'sita@himalayan.np', phone: '+977-9841234567', status: 'Active', projects: 2 },
  { name: 'SunRise Medical Supplies', type: 'Healthcare', contact: 'Dr. Hari Koirala', email: 'hari@sunrise-med.np', phone: '+977-1-5561234', status: 'Active', projects: 4 },
  { name: 'Terai Agri Coop', type: 'Agriculture', contact: 'Kamala Tharu', email: 'kamala@tearicoop.np', phone: '+977-56-456789', status: 'Pending', projects: 0 },
  { name: 'KTM Logistics & Transport', type: 'Logistics', contact: 'Binod Tamang', email: 'binod@ktmlogistics.np', phone: '+977-9851234567', status: 'Active', projects: 5 },
  { name: 'NepTech Solutions', type: 'Technology', contact: 'Priya Rai', email: 'priya@neptech.np', phone: '+977-9861234567', status: 'Active', projects: 1 },
  { name: 'Mountain View Textiles', type: 'Clothing & NFI', contact: 'Kumar Magar', email: 'kumar@mvtextiles.np', phone: '+977-61-789012', status: 'Inactive', projects: 0 },
  { name: 'GreenField Nursery', type: 'Agriculture', contact: 'Devi Poudel', email: 'devi@greenfield.np', phone: '+977-9801234567', status: 'Active', projects: 2 },
]

export function VendorsPage() {
  const [search, setSearch] = React.useState('')
  const filtered = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-500 mt-1">{vendors.length} registered vendors</p>
        </div>
        <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          <Plus size={16} />
          Add Vendor
        </button>
      </div>

      <div className="px-8 pt-5">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 px-8 py-5">
        <div className="bg-gray-50 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                <th className="px-5 py-3 font-medium">Vendor</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium text-center">Projects</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((v) => (
                <tr key={v.name} className="hover:bg-white/70 transition-colors">
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{v.name}</p>
                      <p className="text-xs text-gray-400">{v.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{v.type}</td>
                  <td className="px-5 py-3 text-gray-600">{v.contact}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{v.phone}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-xs font-semibold text-gray-700">{v.projects}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[v.status]}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
                      <MoreHorizontal size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No vendors found matching "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
