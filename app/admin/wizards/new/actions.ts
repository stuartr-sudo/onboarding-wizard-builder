'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createWizard(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string

  const { data, error } = await supabase
    .from('wizards')
    .insert({
      title,
      description,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create wizard')
  }

  redirect(`/admin/wizards/${data.id}`)
}

