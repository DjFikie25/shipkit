import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth';
import { SignUpForm } from '@/components/auth/SignUpForm';

export const metadata = { title: 'Create account' };

export default async function SignUpPage() {
  const user = await getServerUser();
  if (user) redirect('/dashboard');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">Free to get started</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
