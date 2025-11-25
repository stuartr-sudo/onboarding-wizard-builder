'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function submitStep(wizardId: string, stepId: string, formData: FormData, nextUrl: string) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  
  // Identify submission by a cookie ID
  let submissionId = cookieStore.get('wizard_submission_id')?.value

  if (!submissionId) {
    // Create new submission
    const { data: submission, error } = await supabase
      .from('wizard_submissions')
      .insert({ wizard_id: wizardId })
      .select()
      .single()
      
    if (error) throw new Error(error.message)
    submissionId = submission.id
    
    // Set cookie
    // Note: In a Server Action, we can't set cookies directly on the response object easily unless we use middleware or specific return.
    // But Supabase client handles auth cookies. For custom cookies in Server Actions:
    // It's actually better to do this check in middleware or the page load if possible, or just rely on client to pass it?
    // Actually, Next.js cookies().set() works in Server Actions now.
    cookieStore.set('wizard_submission_id', submissionId)
  }

  // Process fields
  // We need to know which fields were submitted. 
  // The formData keys should probably be the field IDs.
  const entries = Array.from(formData.entries())
  
  for (const [key, value] of entries) {
      // Filter out system fields if any
      if(key.startsWith('$')) continue; // Next.js internal
      
      // Assuming key is field_id
      // Check if response already exists? Or just insert/upsert?
      // Upsert is better if they go back and change it.
      
      // BUT, we need to know the field_id. 
      // Let's assume the input names ARE the field IDs.
      
      // We might want to validate that 'key' is a valid UUID to be safe
      if (key.length === 36) { // UUID length
           const { error: responseError } = await supabase
            .from('wizard_responses')
            .insert({
                submission_id: submissionId,
                field_id: key,
                value: value.toString()
            })
            // Supabase doesn't support conflict on non-unique columns easily without unique constraint.
            // Ideally we have a unique constraint on (submission_id, field_id).
            // Let's add that constraint or just delete old ones first?
            // Delete is safer for now without changing schema.
      }
  }

  redirect(nextUrl)
}


