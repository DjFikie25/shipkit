/**
 * Public landing page — shown to unauthenticated visitors.
 * Authenticated users are redirected to /dashboard.
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerUser } from '@/lib/auth';

export default async function LandingPage() {
  const user = await getServerUser();
  if (user) redirect('/dashboard');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
      <div className="w-full max-w-2xl text-center">
        {/* Logo / wordmark */}
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
          <span className="text-2xl font-bold">M</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          My App
        </h1>
        <p className="mt-4 text-lg text-gray-500 sm:text-xl">
          Your concise, compelling one-liner goes here.{' '}
          <span className="text-gray-700">Replace this with your value proposition.</span>
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="w-full rounded-xl bg-blue-600 px-8 py-3.5 text-center text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
          >
            Get started — it&apos;s free
          </Link>
          <Link
            href="/signin"
            className="w-full rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-center text-base font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 sm:w-auto"
          >
            Sign in
          </Link>
        </div>

        {/* Feature highlights — replace with real features */}
        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            { icon: '🔐', title: 'Auth built-in', desc: 'Email/password + Google OAuth, password reset, session management.' },
            { icon: '🤖', title: 'AI chat ready', desc: 'Streaming AI chatbot with Mastra + multi-provider LLM support.' },
            { icon: '📱', title: 'Mobile-native', desc: 'React Native / Expo app sharing the same auth and API.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-3 font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
