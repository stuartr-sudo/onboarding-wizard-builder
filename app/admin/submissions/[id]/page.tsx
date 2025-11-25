import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function SubmissionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch submission details
  const { data: submission } = await supabase
    .from('wizard_submissions')
    .select(`
        *,
        wizards (title),
        wizard_responses (
            value,
            wizard_fields (
                label,
                field_type,
                order_index,
                step_id
            )
        )
    `)
    .eq('id', id)
    .single()

  if (!submission) {
    notFound()
  }
  
  // Group responses by step (we need to fetch steps or infer order)
  // For now, let's just list them flat or sort by field order if possible.
  // The nested query returns wizard_fields, we can sort by that.
  
  const responses = submission.wizard_responses || []
  responses.sort((a: any, b: any) => {
      // Sort by step ID first (not perfect without step order) then field index
      if (a.wizard_fields.step_id === b.wizard_fields.step_id) {
          return a.wizard_fields.order_index - b.wizard_fields.order_index
      }
      return 0 // Need step order to sort steps correctly, but field order helps within step
  })

  return (
    <div>
       <div className="mb-6">
        <Link href="/admin/submissions" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Submissions
        </Link>
      </div>

      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Submission Details</h1>
        <p className="mt-1 text-sm text-gray-500">
          For {submission.wizards?.title} • {new Date(submission.submitted_at).toLocaleString()}
        </p>
      </div>

      <div className="space-y-6">
        {responses.map((response: any, index: number) => (
            <div key={index} className="bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {response.wizard_fields?.label || 'Unknown Field'}
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p className="whitespace-pre-wrap border-l-4 border-gray-200 pl-3 py-1">
                        {response.value || '(No answer)'}
                    </p>
                </div>
            </div>
        ))}
      </div>
    </div>
  )
}


