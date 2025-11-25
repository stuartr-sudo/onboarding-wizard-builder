import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white text-center">
      <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
        Onboarding Wizard
      </h1>
      <p className="mb-8 max-w-xl text-lg text-gray-600">
        Build beautiful, step-by-step onboarding flows for your clients.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-lg hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
        >
          Admin Login
        </Link>
      </div>
    </div>
  )
}
