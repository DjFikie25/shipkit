import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth';
import { SignInForm } from '@/components/auth/SignInForm';

export const metadata = { title: 'Sign in' };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const user = await getServerUser();
  if (user) redirect('/dashboard');

  const { next, reset } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>
        <SignInForm nextUrl={next ?? '/dashboard'} showResetSuccess={reset === '1'} />
      </div>
    </div>
  );
}
