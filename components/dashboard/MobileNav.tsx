'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiFolder, FiPlusCircle, FiLogOut, FiCompass } from 'react-icons/fi';

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50">
      <div className="flex justify-around items-center">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center p-3 flex-1 ${
            isActive('/dashboard') ? 'text-blue-400' : 'text-gray-400'
          }`}
        >
          <FiHome className="h-6 w-6" />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>

        <Link
          href="/projects"
          className={`flex flex-col items-center p-3 flex-1 ${
            isActive('/projects') ? 'text-blue-400' : 'text-gray-400'
          }`}
        >
          <FiFolder className="h-6 w-6" />
          <span className="text-xs mt-1">Projeler</span>
        </Link>

        <Link
          href="/projects/new"
          className={`flex flex-col items-center p-3 flex-1 ${
            isActive('/projects/new') ? 'text-blue-400' : 'text-gray-400'
          }`}
        >
          <FiPlusCircle className="h-6 w-6" />
          <span className="text-xs mt-1">Yeni</span>
        </Link>

        <Link
          href="/explore"
          className={`flex flex-col items-center p-3 flex-1 ${
            isActive('/explore') ? 'text-blue-400' : 'text-gray-400'
          }`}
        >
          <FiCompass className="h-6 w-6" />
          <span className="text-xs mt-1">Keşfet</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center p-3 flex-1 text-gray-400"
        >
          <FiLogOut className="h-6 w-6" />
          <span className="text-xs mt-1">Çıkış</span>
        </button>
      </div>
    </nav>
  );
} 