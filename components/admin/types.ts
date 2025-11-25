export interface WizardField {
  id: string
  step_id: string
  field_type: 'text_input' | 'long_text' | 'dropdown' | 'toggle' | 'radio' | 'color_picker' | 'font_picker' | 'image_upload'
  label: string
  options: any
  required: boolean
  order_index: number
}

export interface WizardStep {
  id: string
  wizard_id: string
  step_number: number
  title: string
  description: string
  layout_style: string
  wizard_fields: WizardField[]
}

export interface Wizard {
  id: string
  title: string
  description: string
  theme_color_primary: string
  theme_color_secondary: string
  font_family: string
  logo_url: string
  wizard_steps: WizardStep[]
}


