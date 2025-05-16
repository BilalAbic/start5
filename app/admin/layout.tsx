'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiUsers, FiFolder, FiAlertTriangle, FiLogOut } from 'react-icons/fi';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { title: 'Dashboard', href: '/admin', icon: <FiHome className="w-5 h-5" /> },
    { title: 'Kullanıcılar', href: '/admin/users', icon: <FiUsers className="w-5 h-5" /> },
    { title: 'Projeler', href: '/admin/projects', icon: <FiFolder className="w-5 h-5" /> },
    { title: 'Raporlar', href: '/admin/reports', icon: <FiAlertTriangle className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-gray-900">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-indigo-500">Start5 Admin</h2>
        </div>
        
        <nav className="p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-indigo-900/50 text-indigo-400'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-gray-800 pt-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center w-full px-4 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
            >
              <FiLogOut className="w-5 h-5 mr-3" />
              <span>Ana Sayfaya Dön</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 bg-gray-950">
        {children}
      </main>
    </div>
  );
} 