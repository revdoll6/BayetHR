'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store/auth';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const { login, user, isLoading, error, isHydrated } = useAuthStore();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (isHydrated && user) {
      router.replace('/candidate/dashboard');
    }
  }, [user, isHydrated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password }, 'candidate');
      const immediateUser = useAuthStore.getState().user;

      if (immediateUser) {
        document.cookie = `user=${JSON.stringify(immediateUser)}; path=/`;
        window.location.replace('/candidate/dashboard');
      }
    } catch (err) {
      // Error is handled by the store
    }
  };

  // Show loading state while hydrating
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Don't render form if already logged in
  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Bayet HR</h1>
          <h2 className="mt-6 text-2xl font-semibold">Candidate Login</h2>
          <p className="mt-2 text-gray-600">
            Or{' '}
            <Link href="/candidate/signup" className="text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
          </div>

          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
