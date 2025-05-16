'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiFolder, FiPlusCircle, FiLogOut, FiCompass } from 'react-icons/fi';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <FiHome className="w-5 h-5" />,
    },
    {
      name: 'Projelerim',
      href: '/projects',
      icon: <FiFolder className="w-5 h-5" />,
    },
    {
      name: 'Yeni Proje',
      href: '/projects/new',
      icon: <FiPlusCircle className="w-5 h-5" />,
    },
    {
      name: 'Keşfet',
      href: '/explore',
      icon: <FiCompass className="w-5 h-5" />,
    },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <aside className="bg-gray-800 w-64 flex-shrink-0 hidden md:block h-screen sticky top-0">
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Start5</h2>
          <p className="text-sm text-gray-400 mt-1">Project Dashboard</p>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
          >
            <FiLogOut className="w-5 h-5 mr-3" />
            Çıkış
          </button>
        </div>
      </div>
    </aside>
  );
} 