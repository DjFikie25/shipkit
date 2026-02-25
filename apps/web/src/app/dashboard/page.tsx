/**
 * Authenticated dashboard — shown only to signed-in users.
 * Redirects to /signin if not authenticated.
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerUser } from '@/lib/auth';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) redirect('/signin?next=/dashboard');

  const displayName = user.name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-lg font-bold text-gray-900">My App</span>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-500 sm:block">{user.email}</span>
            <form action="/api/auth/sign-out" method="POST">
              <button
                type="submit"
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {displayName}!
          </h1>
          <p className="mt-1 text-gray-500">Here&apos;s what&apos;s happening today.</p>
        </div>

        {/* Quick actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/chat"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <span className="text-3xl">💬</span>
            <h2 className="mt-3 font-semibold text-gray-900 group-hover:text-blue-600">
              AI Chat
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Ask your AI assistant anything.
            </p>
          </Link>

          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6">
            <span className="text-3xl opacity-40">📦</span>
            <h2 className="mt-3 font-semibold text-gray-400">Your feature</h2>
            <p className="mt-1 text-sm text-gray-400">Add your app features here.</p>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6">
            <span className="text-3xl opacity-40">⚙️</span>
            <h2 className="mt-3 font-semibold text-gray-400">Settings</h2>
            <p className="mt-1 text-sm text-gray-400">Profile and preferences.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
