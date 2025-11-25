import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function SubmissionsPage() {
  const supabase = await createClient()
  const { data: submissions } = await supabase
    .from('wizard_submissions')
    .select(`
        *,
        wizards (title)
    `)
    .order('submitted_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
        <p className="mt-1 text-sm text-gray-500">
          View all client submissions
        </p>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wizard
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submission ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions?.map((submission) => (
              <tr key={submission.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {submission.wizards?.title || 'Unknown Wizard'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {submission.id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(submission.submitted_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/submissions/${submission.id}`} className="text-indigo-600 hover:text-indigo-900">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
             {(!submissions || submissions.length === 0) && (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                        No submissions yet.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


