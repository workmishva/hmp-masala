'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  _id: string
  name: string
  email: string
  phone: string
  address?: string
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then(({ data }) => { if (data) setUsers(data) })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter((u) =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-9 w-36 skeleton rounded-xl" />
        <div className="h-11 skeleton rounded-xl" />
        {[1,2,3,4,5].map(i => <div key={i} className="h-14 skeleton rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-masala-900">Customers</h1>
        <span className="text-sm text-masala-500">{users.length} registered</span>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email or phone..."
        className="w-full h-11 px-4 border border-masala-200 rounded-xl text-masala-900 text-sm placeholder:text-masala-400 focus:outline-none focus:ring-2 focus:ring-saffron-400"
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-masala-400">
          <Users className="w-12 h-12 mb-3" />
          <p className="text-sm">No customers found</p>
        </div>
      ) : (
        <div className="bg-white border border-masala-200 rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-masala-100 bg-masala-50">
                  <th className="text-left px-5 py-3 font-semibold text-masala-600 text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3 font-semibold text-masala-600 text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-3 font-semibold text-masala-600 text-xs uppercase tracking-wider">Phone</th>
                  <th className="text-left px-5 py-3 font-semibold text-masala-600 text-xs uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-masala-100">
                {filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-masala-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-saffron-100 text-saffron-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-masala-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-masala-600">{user.email}</td>
                    <td className="px-5 py-3.5 text-masala-600">{user.phone}</td>
                    <td className="px-5 py-3.5 text-masala-500">{format(new Date(user.createdAt), 'dd MMM yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
