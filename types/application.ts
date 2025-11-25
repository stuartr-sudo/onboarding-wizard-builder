import { Database } from './supabase'

export type Wizard = Database['public']['Tables']['wizards']['Row'] & {
  steps: StepWithFields[]
}

export type Step = Database['public']['Tables']['wizard_steps']['Row']

export type Field = Database['public']['Tables']['wizard_fields']['Row']

export type StepWithFields = Step & {
  fields: Field[]
}

