'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiFolder, FiPlusCircle, FiLogOut, FiCompass, FiUser } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import NotificationIconMobile from '../NotificationIconMobile';
import useAuth from '@/lib/hooks/useAuth';

interface User {
  id: string;
  userId: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export default function MobileNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const { user: authUser } = useAuth();

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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <>
      {/* Profile Drawer */}
      {showProfile && (
        <div className="md:hidden fixed inset-0 bg-gray-900/90 z-40" onClick={() => setShowProfile(false)}>
          <div 
            className="absolute bottom-16 left-4 right-4 bg-gray-800 rounded-lg p-4 border border-gray-700"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                  {user?.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={`${user.firstName || 'User'}'s profile`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FiUser className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-white font-medium truncate">
                    {user?.username ? user.username : 
                      (user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email?.split('@')[0] || 'Kullanıcı')}
                  </p>
                  <p className="text-sm text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Çıkış Yap"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
            <Link
              href="/account"
              className="mt-4 block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 rounded-md"
              onClick={() => setShowProfile(false)}
            >
              Profil Ayarları
            </Link>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {authUser && (
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

            {/* Notification Icon */}
            <NotificationIconMobile />

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
              onClick={() => setShowProfile(!showProfile)}
              className={`flex flex-col items-center p-3 flex-1 ${
                showProfile ? 'text-blue-400' : 'text-gray-400'
              }`}
            >
              <div className="relative">
                {user?.profileImage ? (
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <Image
                      src={user.profileImage}
                      alt="Profile"
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <FiUser className="h-6 w-6" />
                )}
              </div>
              <span className="text-xs mt-1">Profil</span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
} 