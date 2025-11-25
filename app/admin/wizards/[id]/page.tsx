import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import WizardBuilder from '@/components/admin/WizardBuilder'

export default async function WizardEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch wizard with steps and fields
  const { data: wizard } = await supabase
    .from('wizards')
    .select(`
      *,
      wizard_steps (
        *,
        wizard_fields (*)
      )
    `)
    .eq('id', id)
    .single()

  if (!wizard) {
    notFound()
  }

  // Sort steps by step_number, and fields by order_index
  // Doing this in JS because nested order in Supabase query is tricky
  if (wizard.wizard_steps) {
    wizard.wizard_steps.sort((a: any, b: any) => a.step_number - b.step_number)
    wizard.wizard_steps.forEach((step: any) => {
      if (step.wizard_fields) {
        step.wizard_fields.sort((a: any, b: any) => a.order_index - b.order_index)
      }
    })
  }

  return <WizardBuilder initialWizard={wizard} />
}
