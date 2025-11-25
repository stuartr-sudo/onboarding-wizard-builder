import { createWizard } from '../actions'
import Link from 'next/link'

export default function NewWizardPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Wizard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Start by giving your wizard a name and description.
        </p>
      </div>

      <form action={createWizard} className="space-y-6 rounded-lg border bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
            Title
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="title"
              id="title"
              required
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
              placeholder="e.g. Mobile App Onboarding"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
            Description
          </label>
          <div className="mt-2">
            <textarea
              name="description"
              id="description"
              rows={3}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
              placeholder="Internal notes about this wizard..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-4 pt-4 border-t">
          <Link
            href="/admin"
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create Wizard
          </button>
        </div>
      </form>
    </div>
  )
}
