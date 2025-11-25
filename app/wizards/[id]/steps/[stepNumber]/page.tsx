import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ClientStepForm from '@/components/wizard/ClientStepForm'

export default async function WizardStepPage({
  params,
}: {
  params: Promise<{ id: string; stepNumber: string }>
}) {
  const { id, stepNumber } = await params
  const stepNum = parseInt(stepNumber)
  const supabase = await createClient()

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

  if (!wizard) notFound()

  const steps = wizard.wizard_steps.sort((a: any, b: any) => a.step_number - b.step_number)
  const currentStepIndex = stepNum - 1
  const currentStep = steps[currentStepIndex]

  if (!currentStep) {
    if (currentStepIndex >= steps.length) {
       return (
           <div className="flex min-h-screen items-center justify-center bg-gray-50">
               <div className="text-center">
                   <h1 className="text-3xl font-bold text-gray-900">Wizard Completed</h1>
                   <p className="mt-2 text-gray-600">Thank you for your submission.</p>
               </div>
           </div>
       )
    }
    notFound()
  }
  
  if (currentStep.wizard_fields) {
      currentStep.wizard_fields.sort((a: any, b: any) => a.order_index - b.order_index)
  }

  const totalSteps = steps.length

  return (
    <div
        className="fixed inset-0 flex flex-col overflow-hidden font-sans"
        style={{
            fontFamily: wizard.font_family || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 25%, #06b6d4 75%, #0891b2 100%)',
        }}
    >
        {/* Progress Bar */}
        <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm">
            <div className="px-4 sm:px-6 py-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white/90">Progress</span>
                    <span className="text-xs font-bold text-white">{stepNum} of {totalSteps}</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full transition-all duration-500 ease-out rounded-full shadow-lg relative overflow-hidden"
                        style={{
                            width: `${(stepNum / totalSteps) * 100}%`,
                            background: 'linear-gradient(90deg, #ffffff 0%, #e0f2fe 100%)',
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 overflow-y-auto">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-10">
                    <span className="inline-block px-5 py-2 rounded-full text-xs font-bold text-white tracking-wider uppercase mb-6 shadow-lg backdrop-blur-md"
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                        }}>
                        Step {stepNum} of {totalSteps}
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-5 leading-tight drop-shadow-lg">
                        {currentStep.title}
                    </h1>
                    {currentStep.description && (
                        <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                            {currentStep.description}
                        </p>
                    )}
                </div>

                <div className="rounded-3xl shadow-2xl p-8 sm:p-10 backdrop-blur-xl"
                    style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                    }}>
                    <ClientStepForm
                        wizardId={wizard.id}
                        step={currentStep}
                        nextStepUrl={stepNum < totalSteps ? `/wizards/${id}/steps/${stepNum + 1}` : `/wizards/${id}/finish`}
                        primaryColor={wizard.theme_color_primary || '#667eea'}
                    />
                </div>
            </div>
        </div>
    </div>
  )
}
