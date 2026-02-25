import React from 'react';
import { SetNewPasswordForm } from './SetNewPasswordForm';

export default function SetNewPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
        </div>
        <React.Suspense>
          <SetNewPasswordForm />
        </React.Suspense>
      </div>
    </div>
  );
}
