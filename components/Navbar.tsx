'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiLogIn, FiUserPlus, FiMenu, FiX, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';
import NotificationIcon from './NotificationIcon';

type User = {
  id: string;
  email: string;
  username?: string;
  profileImage?: string;
  isAdmin: boolean;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Ensure menu is closed when navigating to a new page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Fetch user data on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        const userData = await response.json();
        
        if (userData.authenticated && userData.user) {
          setUser(userData.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Authentication check error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setUser(null);
        router.push('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-white flex items-center">
          <span className="text-blue-500">Start</span>
          <span className="text-white">5</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link href="/#features" className="text-gray-300 hover:text-white transition">
            Özellikler
          </Link>
          <Link href="/#projects" className="text-gray-300 hover:text-white transition">
            Projeler
          </Link>
          <Link href="/#why" className="text-gray-300 hover:text-white transition">
            Neden Start5?
          </Link>
          <Link href="/#how" className="text-gray-300 hover:text-white transition">
            Nasıl Çalışır?
          </Link>
        </nav>
        
        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex gap-3 items-center">
          {loading ? (
            <div className="h-10 w-24 bg-gray-800 animate-pulse rounded-md"></div>
          ) : user ? (
            <>
              {/* User is logged in */}
              <Link
                href="/dashboard"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
              >
                <FiUser className="mr-2" />
                Dashboard
              </Link>
              
              {/* Notification Icon - Only shown when user is logged in */}
              <NotificationIcon />
              
              {/* Admin Panel Link - Only shown for admins */}
              {user.isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-600 rounded-md transition-colors"
                >
                  <FiSettings className="mr-2" />
                  Admin Paneli
                </Link>
              )}
              
              {/* User Profile/Avatar */}
              <div className="flex items-center ml-2 relative group">
                <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-blue-500 flex items-center justify-center bg-gray-800">
                  {user.profileImage ? (
                    <Image 
                      src={user.profileImage} 
                      alt={user.username || user.email} 
                      width={36} 
                      height={36} 
                      className="object-cover"
                    />
                  ) : (
                    <FiUser className="text-white" />
                  )}
                </div>
                <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-md overflow-hidden shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-700 text-sm text-gray-300 truncate">
                    {user.username || user.email}
                  </div>
                  <div className="px-2 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-2 py-2 text-sm text-red-400 hover:bg-gray-700 rounded flex items-center"
                    >
                      <FiLogOut className="mr-2" />
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* User is not logged in */}
              <Link
                href="/login"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
              >
                <FiLogIn className="mr-2" />
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <FiUserPlus className="mr-2" />
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-300 hover:text-white transition"
          aria-label={isMenuOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4 mb-6">
              <Link href="/#features" className="text-gray-300 hover:text-white transition py-2">
                Özellikler
              </Link>
              <Link href="/#projects" className="text-gray-300 hover:text-white transition py-2">
                Projeler
              </Link>
              <Link href="/#why" className="text-gray-300 hover:text-white transition py-2">
                Neden Start5?
              </Link>
              <Link href="/#how" className="text-gray-300 hover:text-white transition py-2">
                Nasıl Çalışır?
              </Link>
            </nav>
            
            <div className="flex flex-col space-y-3">
              {loading ? (
                <div className="h-10 w-full bg-gray-800 animate-pulse rounded-md"></div>
              ) : user ? (
                <>
                  {/* Mobile: User is logged in */}
                  {user.profileImage || user.username ? (
                    <div className="flex items-center py-2 mb-2">
                      <div className="h-8 w-8 rounded-full overflow-hidden mr-2 border border-blue-500 flex items-center justify-center bg-gray-800">
                        {user.profileImage ? (
                          <Image 
                            src={user.profileImage} 
                            alt={user.username || user.email} 
                            width={32} 
                            height={32} 
                            className="object-cover"
                          />
                        ) : (
                          <FiUser className="text-white" />
                        )}
                      </div>
                      <span className="text-sm text-gray-300">{user.username || user.email}</span>
                      
                      {/* Mobile Notification Icon - Only shown when user is logged in */}
                      <div className="ml-auto">
                        <NotificationIcon />
                      </div>
                    </div>
                  ) : null}
                  
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors w-full"
                  >
                    <FiUser className="mr-2" />
                    Dashboard
                  </Link>
                  
                  {/* Admin Panel - Mobile */}
                  {user.isAdmin && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-600 rounded-md transition-colors w-full"
                    >
                      <FiSettings className="mr-2" />
                      Admin Paneli
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-700 hover:bg-red-600 rounded-md transition-colors w-full"
                  >
                    <FiLogOut className="mr-2" />
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  {/* Mobile: User is not logged in */}
                  <Link
                    href="/login"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors w-full"
                  >
                    <FiLogIn className="mr-2" />
                    Giriş Yap
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors w-full"
                  >
                    <FiUserPlus className="mr-2" />
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 