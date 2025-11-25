import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function WizardStartPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: wizard } = await supabase
    .from('wizards')
    .select('*')
    .eq('id', id)
    .single()

  if (!wizard) {
    notFound()
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center"
      style={{
        background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
        fontFamily: wizard.font_family || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div className="max-w-2xl space-y-10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
        }}>
        {wizard.logo_url && (
          <img
            src={wizard.logo_url}
            alt="Logo"
            className="mx-auto h-24 w-auto object-contain drop-shadow-lg"
          />
        )}
        
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          {wizard.title}
        </h1>
        
        {wizard.description && (
          <p className="text-xl text-gray-700 leading-relaxed max-w-xl mx-auto">
            {wizard.description}
          </p>
        )}

        <div className="mt-12">
          <Link
            href={`/wizards/${id}/steps/1`}
            className="inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm relative overflow-hidden group"
            style={{ 
              background: `linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)`,
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <span className="relative z-10">Start Onboarding</span>
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </Link>
        </div>
      </div>
    </div>
  )
}
