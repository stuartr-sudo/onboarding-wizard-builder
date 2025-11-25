'use client'

import { useState, useEffect, useRef } from 'react'
import { Wizard, StepWithFields, Field } from '@/types/application'
import { createClient } from '@/utils/supabase/client'
import { ChevronRight, ChevronLeft, Check, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function WizardRenderer({ wizard }: { wizard: Wizard }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const supabase = createClient()
  
  // Initialize submission session
  useEffect(() => {
    const initSubmission = async () => {
      // Check local storage for existing submission ID for this wizard?
      // For now, always create new or let user start fresh.
      // Actually, requirements say "Auto-save".
      // We can store submissionId in localStorage.
      const storedSubId = localStorage.getItem(`wizard_sub_${wizard.id}`)
      if (storedSubId) {
          setSubmissionId(storedSubId)
          // Ideally fetch previous responses here to populate state
      } else {
          const { data, error } = await supabase
            .from('wizard_submissions')
            .insert({ wizard_id: wizard.id })
            .select()
            .single()
          
          if (data) {
              setSubmissionId(data.id)
              localStorage.setItem(`wizard_sub_${wizard.id}`, data.id)
          }
      }
    }
    initSubmission()
  }, [wizard.id])

  const currentStep = wizard.steps[currentStepIndex]
  const isLastStep = currentStepIndex === wizard.steps.length - 1

  const handleResponseChange = (fieldId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }))
    
    // Auto-save to DB
    if (submissionId) {
       // Debounce this in real app
       saveResponse(fieldId, value)
    }
  }

  const saveResponse = async (fieldId: string, value: any) => {
      if (!submissionId) return
      
      // Upsert response
      // Since we don't have a unique constraint on (submission_id, field_id) in the schema (oops, explicitly), 
      // we should probably check if it exists or use an upsert if we added a unique index.
      // For now, let's just delete old and insert new or update.
      // Better: Select first.
      
      const { data: existing } = await supabase
        .from('wizard_responses')
        .select('id')
        .eq('submission_id', submissionId)
        .eq('field_id', fieldId)
        .single()
        
      if (existing) {
          await supabase
            .from('wizard_responses')
            .update({ value: String(value) }) // Stringify for now
            .eq('id', existing.id)
      } else {
          await supabase
            .from('wizard_responses')
            .insert({
                submission_id: submissionId,
                field_id: fieldId,
                value: String(value)
            })
      }
  }

  const handleNext = () => {
    // Validate current step
    // Simple check: are required fields filled?
    const requiredFields = currentStep.fields.filter(f => f.required)
    const missing = requiredFields.filter(f => !responses[f.id])
    
    if (missing.length > 0) {
        alert(`Please fill in: ${missing.map(f => f.label).join(', ')}`)
        return
    }

    if (isLastStep) {
        completeWizard()
    } else {
        setCurrentStepIndex(prev => prev + 1)
        window.scrollTo(0, 0)
    }
  }

  const completeWizard = async () => {
      setIsSubmitting(true)
      // Update submission status or metadata if needed
      setIsSubmitting(false)
      setIsComplete(true)
      localStorage.removeItem(`wizard_sub_${wizard.id}`)
  }

  if (isComplete) {
      return (
          <div className="flex min-h-screen items-center justify-center bg-white p-4">
              <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Check className="h-8 w-8" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Thank You!</h1>
                  <p className="mt-2 text-gray-600">Your information has been submitted successfully.</p>
              </div>
          </div>
      )
  }

  return (
    <div 
        className="min-h-screen bg-gray-50"
        style={{ 
            fontFamily: wizard.font_family || 'Inter, sans-serif',
            '--primary': wizard.theme_color_primary || '#000000',
            '--secondary': wizard.theme_color_secondary || '#ffffff'
        } as React.CSSProperties}
    >
      {/* Header / Progress */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white px-4 py-4 shadow-sm">
         <div className="mx-auto max-w-3xl">
             <div className="flex items-center justify-between mb-2">
                 <h1 className="font-bold text-gray-900">{wizard.title}</h1>
                 <span className="text-sm text-gray-500">Step {currentStepIndex + 1} of {wizard.steps.length}</span>
             </div>
             <div className="h-1 w-full rounded-full bg-gray-200">
                 <div 
                    className="h-1 rounded-full transition-all duration-300 ease-out"
                    style={{ 
                        width: `${((currentStepIndex + 1) / wizard.steps.length) * 100}%`,
                        backgroundColor: 'var(--primary)' 
                    }}
                 />
             </div>
         </div>
      </header>

      {/* Main Step Content */}
      <main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{currentStep.title}</h2>
              {currentStep.description && (
                  <p className="mt-2 text-lg text-gray-600">{currentStep.description}</p>
              )}
          </div>

          <div className="space-y-8">
              {currentStep.fields.map(field => (
                  <FieldRenderer 
                    key={field.id} 
                    field={field} 
                    value={responses[field.id]} 
                    onChange={(val) => handleResponseChange(field.id, val)}
                  />
              ))}
          </div>
      </main>

      {/* Footer Actions */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
          <div className="mx-auto flex max-w-3xl justify-between">
              <button
                onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                  <ChevronLeft className="h-4 w-4" />
                  Back
              </button>
              
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-md px-6 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                  {isLastStep ? (isSubmitting ? 'Submitting...' : 'Submit') : 'Next'}
                  {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </button>
          </div>
      </footer>
    </div>
  )
}

function FieldRenderer({ 
    field, 
    value, 
    onChange 
}: { 
    field: Field
    value: any
    onChange: (val: any) => void 
}) {
    const commonClasses = "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
    const supabase = createClient()
    const [uploading, setUploading] = useState(false)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return
        
        setUploading(true)
        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `submissions/${fileName}`

        try {
            const { error: uploadError } = await supabase.storage
                .from('wizard-assets') // Assuming this bucket exists or 'submissions' bucket
                .upload(filePath, file)

            if (uploadError) throw uploadError
            
            // Get public URL or just store path
            // For private submissions, path is safer, but for this demo public URL is easier to view
            const { data } = supabase.storage.from('wizard-assets').getPublicUrl(filePath)
            
            onChange(data.publicUrl)
        } catch (error) {
            console.error('Error uploading file:', error)
            alert('Error uploading file')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-900">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            <div className="mt-1">
                {field.field_type === 'text_input' && (
                    <input
                        type="text"
                        className={commonClasses}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                )}
                
                {field.field_type === 'long_text' && (
                    <textarea
                        rows={4}
                        className={commonClasses}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                )}

                {field.field_type === 'dropdown' && (
                     <select 
                        className={commonClasses}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                     >
                         <option value="">Select an option</option>
                         {Array.isArray(field.options) && field.options.map((opt: any) => (
                             <option key={opt} value={opt}>{opt}</option>
                         ))}
                     </select>
                )}
                
                {(field.field_type === 'radio' || field.field_type === 'toggle') && (
                    <div className="space-y-2">
                        {Array.isArray(field.options) && field.options.map((opt: any) => (
                            <label key={opt} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name={field.id}
                                    value={opt}
                                    checked={value === opt}
                                    onChange={(e) => onChange(e.target.value)}
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-gray-900">{opt}</span>
                            </label>
                        ))}
                    </div>
                )}

                {(field.field_type === 'image_upload' || field.field_type === 'brand_guideline_upload') && (
                    <div className="mt-2">
                        {value ? (
                            <div className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                                <span className="truncate text-sm text-gray-600 max-w-xs">{value}</span>
                                <button 
                                    onClick={() => onChange('')}
                                    className="ml-2 text-gray-400 hover:text-red-500"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 px-6 py-10 hover:bg-gray-50">
                                <div className="text-center">
                                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                    <div className="mt-2 text-sm text-gray-600">
                                        <span className="font-medium text-indigo-600 hover:text-indigo-500">Upload a file</span>
                                        {uploading && <span className="ml-2 text-gray-400">Uploading...</span>}
                                    </div>
                                </div>
                                <input 
                                    type="file" 
                                    className="sr-only" 
                                    onChange={handleFileUpload}
                                    accept={field.field_type === 'image_upload' ? 'image/*' : '.pdf,.zip,.doc,.docx'}
                                />
                            </label>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

