'use client'

import { WizardStep } from '@/components/admin/types'
import { submitStep } from '@/app/wizards/actions'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Check, Upload, X, FileText } from 'lucide-react'
import clsx from 'clsx'
import VoiceInput from './VoiceInput'

interface ClientStepFormProps {
  wizardId: string
  step: WizardStep
  nextStepUrl: string
  primaryColor: string
}

export default function ClientStepForm({ wizardId, step, nextStepUrl, primaryColor }: ClientStepFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({})
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({})
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({})

  const supabase = createClient()

  // Check if all required fields are filled
  const requiredFields = step.wizard_fields?.filter(f => f.required) || []
  const allRequiredFieldsFilled = requiredFields.every(field => {
    const value = formValues[field.id]
    if (field.field_type === 'image_upload') {
      return !!fileUrls[field.id]
    }
    return value !== undefined && value !== null && value !== ''
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFiles(prev => ({ ...prev, [fieldId]: true }))

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${wizardId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('wizard-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('wizard-assets').getPublicUrl(filePath)
      setFileUrls(prev => ({ ...prev, [fieldId]: data.publicUrl }))
      
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed')
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldId]: false }))
    }
  }

  const handleSubmit = async (formData: FormData) => {
      setIsSubmitting(true)
      Object.entries(fileUrls).forEach(([fieldId, url]) => {
          formData.set(fieldId, url)
      })
      // Add all formValues to formData
      Object.entries(formValues).forEach(([fieldId, value]) => {
        formData.set(fieldId, value);
      });
      await submitStep(wizardId, step.id, formData, nextStepUrl)
  }

  const handleValueChange = (fieldId: string, value: any) => {
      setFormValues(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleTranscription = (fieldId: string, text: string) => {
    const currentVal = formValues[fieldId] || ''
    const newVal = currentVal ? `${currentVal} ${text}` : text
    setFormValues(prev => ({ ...prev, [fieldId]: newVal }))
  }

  const handleAiSuggest = async (fieldId: string, fieldLabel: string) => {
    setAiLoading(prev => ({ ...prev, [fieldId]: true }))
    try {
      // Get previous answers for context
      const previousAnswers: Record<string, string> = {}
      step.wizard_fields?.forEach(f => {
        if (f.id !== fieldId && formValues[f.id]) {
          previousAnswers[f.label] = formValues[f.id]
        }
      })

      const res = await fetch('/api/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: fieldLabel,
          previousAnswers,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.suggestion) {
          setFormValues(prev => ({ ...prev, [fieldId]: data.suggestion }))
        }
      }
    } catch (error) {
      console.error('AI suggestion failed:', error)
    } finally {
      setAiLoading(prev => ({ ...prev, [fieldId]: false }))
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 font-sans">
      {step.wizard_fields?.map((field) => (
        <div key={field.id} className="space-y-2">
          {field.field_type !== 'toggle' && (
            <label
              htmlFor={field.id}
              className="block text-base font-semibold text-gray-900"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1" title="Required">*</span>}
            </label>
          )}
          
          {field.field_type === 'text_input' && (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  name={field.id}
                  id={field.id}
                  required={field.required}
                  value={formValues[field.id] || ''}
                  onChange={(e) => handleValueChange(field.id, e.target.value)}
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 pl-4 pr-12 py-3 text-gray-900 shadow-sm focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900 text-sm transition-all duration-200"
                  placeholder="Type your answer here..."
                />
                <VoiceInput
                  onTranscription={(text) => handleTranscription(field.id, text)}
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="button"
                onClick={() => handleAiSuggest(field.id, field.label)}
                disabled={aiLoading[field.id] || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 shadow-md hover:shadow-lg backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {aiLoading[field.id] ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Thinking...
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                    </svg>
                    ✨ AI Suggest
                  </>
                )}
              </button>
            </div>
          )}

          {field.field_type === 'long_text' && (
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  name={field.id}
                  id={field.id}
                  required={field.required}
                  rows={3}
                  value={formValues[field.id] || ''}
                  onChange={(e) => handleValueChange(field.id, e.target.value)}
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 pl-4 pr-12 py-3 text-gray-900 shadow-sm focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900 text-sm transition-all duration-200 resize-y min-h-[80px]"
                  placeholder="Type your answer here..."
                />
                <VoiceInput
                  onTranscription={(text) => handleTranscription(field.id, text)}
                  disabled={isSubmitting}
                  className="top-3"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAiSuggest(field.id, field.label)}
                disabled={aiLoading[field.id] || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 shadow-md hover:shadow-lg backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {aiLoading[field.id] ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Thinking...
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                    </svg>
                    ✨ AI Suggest
                  </>
                )}
              </button>
            </div>
          )}

          {field.field_type === 'color_picker' && (
            <div className="flex items-center gap-3">
              <input
                type="color"
                id={field.id}
                name={field.id}
                defaultValue={formValues[field.id] || '#000000'}
                onChange={(e) => handleValueChange(field.id, e.target.value)}
                className="h-10 w-14 rounded-lg border border-gray-200 bg-white cursor-pointer"
              />
              <input
                type="text"
                value={formValues[field.id] || ''}
                onChange={(e) => handleValueChange(field.id, e.target.value)}
                placeholder="#000000"
                className="flex-1 rounded-xl border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900 text-sm transition-all duration-200 font-mono"
              />
            </div>
          )}
          
          {field.field_type === 'dropdown' && (
              <div className="relative">
                  <select
                      name={field.id}
                      id={field.id}
                      required={field.required}
                      onChange={(e) => handleValueChange(field.id, e.target.value)}
                      className="block w-full appearance-none rounded-xl border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 shadow-sm focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900 text-base transition-all duration-200 pr-10"
                  >
                      <option value="">Select an option...</option>
                      {Array.isArray(field.options) && field.options.map((opt: string, i: number) => (
                          <option key={i} value={opt}>{opt}</option>
                      ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                  </div>
              </div>
          )}

           {field.field_type === 'toggle' && (
             <label className={clsx(
                 "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group",
                 formValues[field.id] 
                  ? "border-gray-900 bg-gray-50" 
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
             )}>
                 <div className={clsx(
                     "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                      formValues[field.id] 
                          ? "border-gray-900 bg-gray-900 text-white" 
                          : "border-gray-300 group-hover:border-gray-400"
                 )}>
                     {formValues[field.id] && <Check className="w-3 h-3" />}
                 </div>
                 <input 
                      type="checkbox" 
                      name={field.id} 
                      id={field.id} 
                      value="true" 
                      className="hidden" 
                      checked={!!formValues[field.id]}
                      onChange={(e) => handleValueChange(field.id, e.target.checked)}
                  />
                 <span className="text-base font-medium text-gray-900">{field.label}</span>
             </label>
           )}
           
           {field.field_type === 'radio' && (
               <div className="grid gap-3">
                   {Array.isArray(field.options) && field.options.map((opt: string, i: number) => (
                       <label 
                          key={i} 
                          className={clsx(
                              "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group",
                              formValues[field.id] === opt
                                  ? "border-gray-900 bg-gray-50"
                                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                          )}
                      >
                           <div className={clsx(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                              formValues[field.id] === opt
                                  ? "border-gray-900"
                                  : "border-gray-300 group-hover:border-gray-400"
                           )}>
                               {formValues[field.id] === opt && (
                                   <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />
                               )}
                           </div>
                           <input
                              type="radio"
                              id={`${field.id}-${i}`}
                              name={field.id}
                              value={opt}
                              required={field.required}
                              className="hidden"
                              onChange={() => handleValueChange(field.id, opt)}
                           />
                           <span className="text-base font-medium text-gray-900">{opt}</span>
                       </label>
                   ))}
               </div>
           )}

           {field.field_type === 'image_upload' && (
               <div>
                   {!fileUrls[field.id] ? (
                      <label htmlFor={field.id} className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                              {uploadingFiles[field.id] ? (
                                  <div className="flex flex-col items-center animate-pulse">
                                      <Upload className="w-6 h-6 mb-2 opacity-50" />
                                      <p className="text-xs font-medium">Uploading...</p>
                                  </div>
                              ) : (
                                  <>
                                      <Upload className="w-6 h-6 mb-2 text-gray-400" />
                                      <p className="text-xs text-gray-600"><span className="font-semibold text-gray-900">Click to upload</span></p>
                                      <p className="text-xs text-gray-400 mt-1">PNG, JPG or PDF</p>
                                  </>
                              )}
                          </div>
                          <input 
                              id={field.id} 
                              type="file" 
                              className="hidden" 
                              accept="image/*,application/pdf"
                              onChange={(e) => handleFileUpload(e, field.id)}
                              disabled={uploadingFiles[field.id]}
                          />
                      </label>
                   ) : (
                       <div className="relative group rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                           <div className="flex items-center p-3 gap-3">
                               <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
                                   {fileUrls[field.id].endsWith('.pdf') ? (
                                       <FileText className="w-5 h-5 text-gray-500" />
                                   ) : (
                                       <img src={fileUrls[field.id]} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                                   )}
                               </div>
                               <div className="flex-1 min-w-0">
                                   <p className="text-xs font-medium text-gray-900 truncate">Uploaded</p>
                               </div>
                               <button
                                  type="button"
                                  onClick={() => setFileUrls(prev => {
                                      const newUrls = {...prev}
                                      delete newUrls[field.id]
                                      return newUrls
                                  })}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                               >
                                   <X className="w-4 h-4" />
                               </button>
                           </div>
                           <input type="hidden" name={field.id} value={fileUrls[field.id]} />
                       </div>
                   )}
               </div>
           )}

        </div>
      ))}

      {allRequiredFieldsFilled && (
        <div className="pt-6 mt-8">
          <button
            type="submit"
            disabled={isSubmitting || Object.values(uploadingFiles).some(Boolean)}
            className="w-full rounded-2xl py-4 px-6 text-base font-bold text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 backdrop-blur-sm relative overflow-hidden group"
            style={{ 
              background: `linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)`,
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  Next Step
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </button>
        </div>
      )}
    </form>
  )
}
