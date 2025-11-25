'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWizard(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string

  const { data, error } = await supabase
    .from('wizards')
    .insert({ title, description })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  redirect(`/admin/wizards/${data.id}`)
}

export async function addStep(wizardId: string, stepNumber: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('wizard_steps')
    .insert({
      wizard_id: wizardId,
      step_number: stepNumber,
      title: 'New Step',
    })

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/wizards/${wizardId}`)
}

export async function updateStep(stepId: string, data: any) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('wizard_steps')
    .update(data)
    .eq('id', stepId)

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/wizards`) // Revalidate broadly or specific path
}

export async function deleteStep(stepId: string, wizardId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('wizard_steps')
    .delete()
    .eq('id', stepId)

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/wizards/${wizardId}`)
}

export async function addField(stepId: string, fieldType: string, orderIndex: number, wizardId: string) {
  console.log('Adding field:', { stepId, fieldType, orderIndex, wizardId })
  const supabase = await createClient()
  
  // Verify user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('User:', user?.id, userError)
  
  if (!user) {
    console.error('No authenticated user found')
    throw new Error('You must be logged in to add fields')
  }

  // Check user profile and role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  console.log('User profile:', profile, profileError)
  
  if (profileError || !profile) {
    console.error('Profile not found or error:', profileError)
    throw new Error('User profile not found. Please contact support.')
  }
  
  if (!['admin', 'super_admin'].includes(profile.role)) {
    console.error('User does not have admin role:', profile.role)
    throw new Error('You do not have permission to add fields')
  }

  const { data, error } = await supabase
    .from('wizard_fields')
    .insert({
      step_id: stepId,
      field_type: fieldType,
      label: 'New Question',
      order_index: orderIndex,
    })
    .select()

  console.log('Insert result:', data, error)

  if (error) {
    console.error('Database error:', error)
    throw new Error(`Failed to add field: ${error.message}`)
  }
  
  revalidatePath(`/admin/wizards/${wizardId}`)
  return data
}

export async function updateField(fieldId: string, data: any, wizardId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('wizard_fields')
    .update(data)
    .eq('id', fieldId)

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/wizards/${wizardId}`)
}

export async function deleteField(fieldId: string, wizardId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('wizard_fields')
    .delete()
    .eq('id', fieldId)

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/wizards/${wizardId}`)
}

export async function updateWizard(wizardId: string, data: any) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('wizards')
    .update(data)
    .eq('id', wizardId)

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/wizards/${wizardId}`)
}

export async function reorderSteps(wizardId: string, stepUpdates: { id: string; step_number: number }[]) {
  const supabase = await createClient()
  
  // Update each step's step_number in a transaction-like manner
  for (const update of stepUpdates) {
    const { error } = await supabase
      .from('wizard_steps')
      .update({ step_number: update.step_number })
      .eq('id', update.id)
    
    if (error) throw new Error(error.message)
  }
  
  revalidatePath(`/admin/wizards/${wizardId}`)
}
