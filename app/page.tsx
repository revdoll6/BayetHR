'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store/auth';

export default function Home() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for hydration before making routing decisions
    if (!isHydrated) {
      return;
    }

    // If user is logged in, go to dashboard
    if (user) {
      router.replace('/candidate/dashboard');
    } else {
      // If not logged in, go to login page
      router.replace('/candidate/login');
    }
  }, [user, isHydrated, router]);

  // Show loading state while hydrating
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Return null while redirecting
  return null;
}
