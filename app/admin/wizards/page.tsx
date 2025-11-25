import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function WizardsPage() {
  const supabase = await createClient()
  const { data: wizards } = await supabase
    .from('wizards')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Wizards</h1>
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

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {wizards?.map((wizard) => (
            <li key={wizard.id}>
              <Link href={`/admin/wizards/${wizard.id}`} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-indigo-600">
                      {wizard.title}
                    </p>
                    <div className="ml-2 flex flex-shrink-0">
                      <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                        Active
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {wizard.description || 'No description'}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Created <time dateTime={wizard.created_at}>{new Date(wizard.created_at).toLocaleDateString()}</time>
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {(!wizards || wizards.length === 0) && (
            <div className="p-4 text-center text-gray-500">
                No wizards found.
            </div>
        )}
      </div>
    </div>
  )
}


