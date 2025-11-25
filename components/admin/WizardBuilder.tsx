'use client'

import { useState, useEffect } from 'react'
import { Wizard, WizardStep } from './types'
import { addStep, updateWizard, reorderSteps } from '@/app/admin/wizards/actions'
import { Plus, Settings, Layout, Save, ExternalLink, GripVertical } from 'lucide-react'
import StepEditor from './StepEditor'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface WizardBuilderProps {
  initialWizard: Wizard
}

export default function WizardBuilder({ initialWizard }: WizardBuilderProps) {
  const [wizard, setWizard] = useState<Wizard>(initialWizard)
  const [activeTab, setActiveTab] = useState<'steps' | 'settings'>('steps')
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    initialWizard.wizard_steps?.[0]?.id || null
  )
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // Sync with server data when it changes
  useEffect(() => {
    setWizard(initialWizard)
  }, [initialWizard])

  // Refresh data from server
  const refreshData = async () => {
    router.refresh()
  }

  const handleAddStep = async () => {
    setIsSaving(true)
    try {
      const newStepNumber = (wizard.wizard_steps?.length || 0) + 1
      
      // Optimistically add step to UI
      const tempId = `temp-${Date.now()}`
      const newStep: WizardStep = {
        id: tempId,
        wizard_id: wizard.id,
        step_number: newStepNumber,
        title: 'New Step',
        description: null,
        wizard_fields: [],
        created_at: new Date().toISOString(),
      }
      
      setWizard({
        ...wizard,
        wizard_steps: [...(wizard.wizard_steps || []), newStep],
      })
      setSelectedStepId(tempId)

      // Save to server
      await addStep(wizard.id, newStepNumber)
      
      // Refresh from server to get real ID
      await refreshData()
    } catch (error) {
      console.error('Failed to add step:', error)
      alert('Failed to add step')
      // Revert on error
      setWizard(initialWizard)
    } finally {
      setIsSaving(false)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const steps = wizard.wizard_steps || []
      const oldIndex = steps.findIndex((step) => step.id === active.id)
      const newIndex = steps.findIndex((step) => step.id === over.id)

      const reorderedSteps = arrayMove(steps, oldIndex, newIndex)
      
      // Update local state immediately for responsive UI
      setWizard({
        ...wizard,
        wizard_steps: reorderedSteps,
      })

      // Save to database
      try {
        const updates = reorderedSteps.map((step, index) => ({
          id: step.id,
          step_number: index + 1,
        }))
        await reorderSteps(wizard.id, updates)
        router.refresh()
      } catch (error) {
        console.error('Failed to reorder steps:', error)
        alert('Failed to reorder steps')
        // Revert on error
        setWizard(initialWizard)
      }
    }
  }

  const activeStep = wizard.wizard_steps?.find((s) => s.id === selectedStepId)

  // Update selectedStepId if the steps array changes and we have a new step or none selected
  useEffect(() => {
      if (wizard.wizard_steps?.length > 0 && !selectedStepId) {
          setSelectedStepId(wizard.wizard_steps[0].id)
      }
      // If we just added a step (length increased), select the last one?
      // Or just let user select.
  }, [wizard.wizard_steps, selectedStepId])

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">{wizard.title}</h1>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            Draft
          </span>
        </div>
        <div className="flex items-center gap-3">
           <Link
              href={`/wizards/${wizard.id}`}
              target="_blank"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <ExternalLink className="-ml-0.5 mr-2 h-4 w-4 text-gray-400" />
              Preview
            </Link>
          <button
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Save className="-ml-0.5 mr-2 h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / Step List */}
        <div className="w-64 overflow-y-auto border-r bg-gray-50 p-4">
          <div className="mb-4 flex space-x-1 rounded-lg bg-gray-200 p-1">
            <button
              onClick={() => setActiveTab('steps')}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
                activeTab === 'steps'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Steps
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
                activeTab === 'settings'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Settings
            </button>
          </div>

          {activeTab === 'steps' && (
            <div className="space-y-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={wizard.wizard_steps?.map((s) => s.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  {wizard.wizard_steps?.map((step, index) => (
                    <SortableStepItem
                      key={step.id}
                      step={step}
                      index={index}
                      isSelected={selectedStepId === step.id}
                      onSelect={() => setSelectedStepId(step.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <button
                onClick={handleAddStep}
                disabled={isSaving}
                className="flex w-full items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
              >
                <Plus className="mr-2 h-4 w-4" />
                {isSaving ? 'Adding...' : 'Add Step'}
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Settings Form would go here */}
              <div className="p-2 text-sm text-gray-500">
                Global wizard settings (colors, fonts, logo)
              </div>
            </div>
          )}
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto bg-white p-8">
          {activeTab === 'steps' && activeStep ? (
            <StepEditor step={activeStep} wizardId={wizard.id} />
          ) : activeTab === 'steps' ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              Select a step to edit
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Settings Panel
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface SortableStepItemProps {
  step: WizardStep
  index: number
  isSelected: boolean
  onSelect: () => void
}

function SortableStepItem({ step, index, isSelected, onSelect }: SortableStepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex w-full items-center gap-2 rounded-md overflow-hidden ${
        isSelected
          ? 'bg-indigo-50 ring-1 ring-indigo-700'
          : 'bg-white'
      }`}
    >
      <button
        type="button"
        {...listeners}
        role={attributes.role}
        tabIndex={attributes.tabIndex}
        className="flex items-center px-2 py-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className={`flex-1 text-left px-3 py-2 text-sm font-medium ${
          isSelected
            ? 'text-indigo-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className="truncate">
          {index + 1}. {step.title || 'Untitled Step'}
        </span>
      </button>
    </div>
  )
}
