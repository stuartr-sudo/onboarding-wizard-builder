'use client'

import { useState, useEffect } from 'react'
import { WizardField } from './types'
import { updateField, deleteField } from '@/app/admin/wizards/actions'
import { Trash2, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FieldEditorProps {
  field: WizardField
  wizardId: string
  onFieldUpdate?: (fieldId: string, updates: Partial<WizardField>) => void
  onFieldDelete?: (fieldId: string) => void
}

export default function FieldEditor({ field, wizardId, onFieldUpdate, onFieldDelete }: FieldEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localField, setLocalField] = useState(field)
  const router = useRouter()

  // Sync local state when prop changes (from server refresh)
  useEffect(() => {
    setLocalField(field)
  }, [field])

  const handleUpdate = async (data: Partial<WizardField>) => {
      // Optimistically update UI
      setLocalField({ ...localField, ...data })
      if (onFieldUpdate) {
        onFieldUpdate(field.id, data)
      }
      
      try {
        await updateField(field.id, data, wizardId)
      } catch (e) {
        console.error('Failed to update field:', e)
        // Revert on error
        setLocalField(field)
        if (onFieldUpdate) {
          onFieldUpdate(field.id, field)
        }
      }
  }

  const handleDelete = async () => {
      if(confirm('Delete this field?')) {
          // Optimistically remove from UI
          if (onFieldDelete) {
            onFieldDelete(field.id)
          }
          
          try {
            await deleteField(field.id, wizardId)
            setTimeout(() => router.refresh(), 100)
          } catch (e) {
            console.error('Failed to delete field:', e)
            alert('Failed to delete field')
            router.refresh() // Refresh to restore
          }
      }
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-3">
            <span className="rounded bg-gray-200 px-2 py-1 text-xs font-mono uppercase text-gray-600">
                {localField.field_type.replace('_', ' ')}
            </span>
            {isExpanded ? (
                 <input
                    type="text"
                    value={localField.label}
                    onChange={(e) => {
                      setLocalField({ ...localField, label: e.target.value })
                    }}
                    onBlur={(e) => handleUpdate({ label: e.target.value })}
                    className="block w-full rounded-md border-gray-300 bg-white text-gray-900 px-2 py-1 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-gray-400"
                    placeholder="Field Label"
                 />
            ) : (
                <span className="text-sm font-medium text-gray-900">{localField.label}</span>
            )}
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            >
                <Settings className="h-4 w-4" />
            </button>
            <button
                onClick={handleDelete}
                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
      </div>
      
      {isExpanded && (
          <div className="space-y-4 p-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700">Label</label>
                   <input
                    type="text"
                    value={localField.label}
                    onChange={(e) => {
                      setLocalField({ ...localField, label: e.target.value })
                    }}
                    onBlur={(e) => handleUpdate({ label: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder:text-gray-400"
                 />
              </div>
              
              <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`required-${localField.id}`}
                    checked={localField.required}
                    onChange={(e) => handleUpdate({ required: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor={`required-${localField.id}`} className="text-sm text-gray-900">Required Field</label>
              </div>

              {(localField.field_type === 'dropdown' || localField.field_type === 'radio') && (
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Options (Comma separated)</label>
                       <input
                        type="text"
                        value={Array.isArray(localField.options) ? localField.options.join(', ') : ''}
                        onChange={(e) => {
                          setLocalField({ ...localField, options: e.target.value.split(',').map((s: string) => s.trim()) })
                        }}
                        onBlur={(e) => handleUpdate({ options: e.target.value.split(',').map((s: string) => s.trim()) })}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder:text-gray-400"
                        placeholder="Option 1, Option 2, Option 3"
                     />
                  </div>
              )}
          </div>
      )}
    </div>
  )
}
