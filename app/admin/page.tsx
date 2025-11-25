import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: wizards } = await supabase
    .from('wizards')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your onboarding wizards
          </p>
        </div>
        <Link
          href="/admin/wizards/new"
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="-ml-0.5 mr-2 h-4 w-4" />
          New Wizard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {wizards?.map((wizard) => (
          <div
            key={wizard.id}
            className="relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="flex-1 p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {wizard.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                {wizard.description || 'No description'}
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4">
              <Link
                href={`/admin/wizards/${wizard.id}`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Edit Wizard <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        ))}
        {(!wizards || wizards.length === 0) && (
          <div className="col-span-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No wizards
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new onboarding wizard.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/wizards/new"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
                New Wizard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
