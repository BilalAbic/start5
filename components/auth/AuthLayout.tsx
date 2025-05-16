'use client';

import { ReactNode } from 'react';
import { FiLoader } from 'react-icons/fi';
import AuthToast from './AuthToast';

interface AuthLayoutProps {
  children: ReactNode;
  isLoading: boolean;
  toast: {type: 'success' | 'error', message: string} | null;
  onCloseToast: () => void;
}

export default function AuthLayout({
  children,
  isLoading,
  toast,
  onCloseToast
}: AuthLayoutProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin text-blue-500 mx-auto h-8 w-8" />
          <p className="mt-2 text-gray-300">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
      {toast && (
        <AuthToast
          type={toast.type}
          message={toast.message}
          onClose={onCloseToast}
        />
      )}
      
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );
} 