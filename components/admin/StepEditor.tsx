'use client'

import { useState, useEffect } from 'react'
import { WizardStep, WizardField } from './types'
import { updateStep, addField, deleteStep } from '@/app/admin/wizards/actions'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import FieldEditor from './FieldEditor'
import { useRouter } from 'next/navigation'

interface StepEditorProps {
  step: WizardStep
  wizardId: string
  onStepUpdate?: (stepId: string, updates: Partial<WizardStep>) => void
  onFieldAdded?: (stepId: string, field: WizardField) => void
  onFieldUpdated?: (fieldId: string, updates: Partial<WizardField>) => void
  onFieldDeleted?: (fieldId: string) => void
}

export default function StepEditor({ step, wizardId, onStepUpdate, onFieldAdded, onFieldUpdated, onFieldDeleted }: StepEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [localFields, setLocalFields] = useState(step.wizard_fields || [])
  const router = useRouter()

  // Sync local fields when step changes (from server refresh)
  useEffect(() => {
    setLocalFields(step.wizard_fields || [])
  }, [step.wizard_fields])

  const handleUpdateStep = async (data: Partial<WizardStep>) => {
    setIsSaving(true)
    
    // Optimistically update UI
    if (onStepUpdate) {
      onStepUpdate(step.id, data)
    }
    
    try {
      await updateStep(step.id, data)
    } catch (e) {
      console.error(e)
      alert('Failed to update step')
      router.refresh() // Revert on error
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddField = async (type: WizardField['field_type']) => {
     setIsSaving(true)
     try {
       const newOrderIndex = (localFields.length || 0) + 1
       
       // Optimistically add field to local state
       const tempField: WizardField = {
         id: `temp-${Date.now()}`,
         step_id: step.id,
         field_type: type,
         label: 'New Question',
         required: false,
         options: type === 'dropdown' || type === 'radio' ? [] : null,
         order_index: newOrderIndex,
         created_at: new Date().toISOString(),
       }
       
       setLocalFields([...localFields, tempField])
       
       if (onFieldAdded) {
         onFieldAdded(step.id, tempField)
       }
       
       console.log('Calling addField with:', { stepId: step.id, type, newOrderIndex, wizardId })
       const result = await addField(step.id, type, newOrderIndex, wizardId)
       
       // Refresh to get real IDs
       setTimeout(() => router.refresh(), 100)
     } catch (e) {
       console.error('Error adding field:', e)
       const errorMessage = e instanceof Error ? e.message : 'Failed to add field'
       alert(`Error: ${errorMessage}`)
       // Revert on error
       setLocalFields(step.wizard_fields || [])
     } finally {
       setIsSaving(false)
     }
  }

  const handleDeleteStep = async () => {
      if(confirm('Are you sure you want to delete this step?')) {
          setIsSaving(true)
          try {
            await deleteStep(step.id, wizardId)
            router.refresh()
          } catch (e) {
            console.error(e)
            alert('Failed to delete step')
          } finally {
            setIsSaving(false)
          }
      }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-4 border-b pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Step Configuration</h2>
          <button
             onClick={handleDeleteStep}
             className="text-sm text-red-600 hover:text-red-500"
          >
              Delete Step
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Step Title</label>
          <input
            type="text"
            defaultValue={step.title || ''}
            onBlur={(e) => handleUpdateStep({ title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 placeholder:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            defaultValue={step.description || ''}
            onBlur={(e) => handleUpdateStep({ description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 placeholder:text-gray-400"
            rows={2}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900">Fields</h3>
        <div className="space-y-4">
          {localFields.map((field) => (
            <FieldEditor 
              key={field.id} 
              field={field} 
              wizardId={wizardId}
              onFieldUpdate={(fieldId, updates) => {
                setLocalFields(localFields.map(f => 
                  f.id === fieldId ? { ...f, ...updates } : f
                ))
              }}
              onFieldDelete={(fieldId) => {
                setLocalFields(localFields.filter(f => f.id !== fieldId))
              }}
            />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
           <button onClick={() => handleAddField('text_input')} disabled={isSaving} className="rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-dashed border-gray-300">
               + Text Input
           </button>
           <button onClick={() => handleAddField('dropdown')} disabled={isSaving} className="rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-dashed border-gray-300">
               + Dropdown
           </button>
           <button onClick={() => handleAddField('toggle')} disabled={isSaving} className="rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-dashed border-gray-300">
               + Toggle
           </button>
           <button onClick={() => handleAddField('image_upload')} disabled={isSaving} className="rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-dashed border-gray-300">
               + Image Upload
           </button>
        </div>
      </div>
    </div>
  )
}
