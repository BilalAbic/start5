import { ReactNode } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Server-side auth check
  const cookie = cookies().get('token');
  if (!cookie?.value) {
    redirect('/login');
  }

  try {
    verifyToken(cookie.value);
  } catch (error) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-grow p-6 md:p-8">{children}</main>
    </div>
  );
} 