'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiFolder, FiPlusCircle, FiLogOut, FiCompass, FiUser, FiSettings, FiAlertTriangle } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import NotificationIconSidebar from '../NotificationIconSidebar';

interface User {
  id: string;
  userId: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user');
        const data = await response.json();
        if (response.ok && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, []);

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
    {
      name: 'Rapor Sonuçlarım',
      href: '/account/reports',
      icon: <FiAlertTriangle className="w-5 h-5" />,
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
          <div className="flex flex-col space-y-2">
            <Link
              href="/account"
              className="flex items-center group hover:bg-gray-700 rounded-lg p-2 transition-colors"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                {user?.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt={`${user.firstName || 'User'}'s profile`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiUser className="w-4 h-4" />
                  </div>
                )}
              </div>
              <span className="ml-2 text-sm font-medium text-white truncate">
                {user?.username ? user.username : 
                  (user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email?.split('@')[0] || 'Kullanıcı')}
              </span>
            </Link>
            
            {/* Notification Icon between profile and logout */}
            <div className="hover:bg-gray-700 rounded-lg transition-colors">
              <NotificationIconSidebar />
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex items-center"
              title="Çıkış Yap"
            >
              <FiLogOut className="w-5 h-5 mr-2" />
              <span className="text-sm">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
} 