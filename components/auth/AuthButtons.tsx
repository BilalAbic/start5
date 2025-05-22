'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FiLogIn, 
  FiUserPlus, 
  FiBox,
  FiUser
} from 'react-icons/fi';
import useAuth from '@/lib/hooks/useAuth';

export const AuthButtons = () => {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <div className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white bg-gray-700 rounded-lg animate-pulse">
          <span className="w-24 h-6"></span>
        </div>
      </div>
    );
  }

  // If user is logged in
  if (user) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <FiUser className="mr-2" />
          Dashboard
        </Link>
        <Link
          href="/projects/new"
          className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiBox className="mr-2" />
          Projeni Ekle
        </Link>
      </div>
    );
  }

  // If user is not logged in
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link
        href="/login"
        className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FiLogIn className="mr-2" />
        Giriş Yap
      </Link>
      <Link
        href="/register"
        className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <FiUserPlus className="mr-2" />
        Kayıt Ol
      </Link>
    </div>
  );
}; 