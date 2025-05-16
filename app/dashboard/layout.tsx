import { ReactNode } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import MobileNav from '../../components/dashboard/MobileNav';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Server-side auth check
  const cookieStore = await cookies();
  const cookie = cookieStore.get('token');
  
  if (!cookie?.value) {
    redirect('/login');
  }

  try {
    verifyToken(cookie.value);
  } catch (error) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Navigation Bar */}
      <MobileNav />

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 pb-16 md:pb-8">{children}</main>
    </div>
  );
} 