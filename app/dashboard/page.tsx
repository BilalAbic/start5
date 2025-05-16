import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default async function DashboardPage() {
  const userPayload = await getCurrentUser();
  
  // Get user info from database
  const user = userPayload?.userId ? await prisma.user.findUnique({
    where: { id: userPayload.userId }
  }) : null;

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Merhaba, {user?.email}!
        </h1>
        <p className="text-gray-300 mb-4">
          Start5 Dashboard'a hoş geldiniz. Buradan projelerinizi yönetebilirsiniz.
        </p>
        
        <Link 
          href="/projects" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Projelerinize Göz Atın
          <FiArrowRight className="ml-2" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-medium text-white mb-3">Hızlı İşlemler</h2>
          <div className="space-y-2">
            <Link href="/projects/new" className="block p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
              Yeni Proje Oluştur
            </Link>
            <Link href="/projects" className="block p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
              Mevcut Projeleri Yönet
            </Link>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-medium text-white mb-3">Kullanıcı Bilgileri</h2>
          <div className="space-y-2">
            <div className="flex justify-between p-3 bg-gray-700 rounded-md">
              <span className="text-gray-300">E-posta</span>
              <span className="text-white font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-700 rounded-md">
              <span className="text-gray-300">Rol</span>
              <span className="text-white font-medium">{user?.role}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-700 rounded-md">
              <span className="text-gray-300">Kayıt Tarihi</span>
              <span className="text-white font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 