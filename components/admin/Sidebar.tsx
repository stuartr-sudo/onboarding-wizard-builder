import { signOut } from '@/app/auth/actions'
import { LogOut, Menu } from 'lucide-react'
import Link from 'next/link'

export default function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center justify-center border-b px-4">
        <h1 className="text-xl font-bold text-gray-900">WizardAdmin</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        <Link
          href="/admin"
          className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/wizards"
          className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          Wizards
        </Link>
        <Link
          href="/admin/submissions"
          className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          Submissions
        </Link>
      </nav>
      <div className="border-t p-4">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}


