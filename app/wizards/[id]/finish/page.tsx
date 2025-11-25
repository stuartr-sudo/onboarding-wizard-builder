import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default async function FinishPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: wizard } = await supabase
    .from('wizards')
    .select('title, theme_color_primary')
    .eq('id', id)
    .single()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="rounded-full bg-green-100 p-3">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
        All done!
      </h1>
      <p className="mt-2 text-lg text-gray-600">
        Thank you for completing the {wizard?.title || 'wizard'}.
      </p>
      <div className="mt-10">
        <Link
          href="/"
          className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
        >
          Return Home <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  )
}


