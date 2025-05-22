import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FiArrowRight, FiGrid, FiLock, FiGlobe, FiClock } from 'react-icons/fi';
import Link from 'next/link';

// Force dynamic rendering to ensure we get updated project data
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const userPayload = await getCurrentUser();
  
  // Get user info from database
  const user = userPayload?.userId ? await prisma.user.findUnique({
    where: { id: userPayload.userId }
  }) : null;

  // Fetch actual projects from database
  const projects = userPayload?.userId ? await prisma.project.findMany({
    where: { userId: userPayload.userId },
    include: { media: true },
    orderBy: { createdAt: 'desc' }
  }) : [];

  // Calculate dashboard stats from real data
  const totalProjects = projects.length;
  const publicProjects = projects.filter(p => p.isPublic).length;
  const privateProjects = projects.filter(p => !p.isPublic).length;
  const recentProjects = projects.slice(0, 2);
  
  // Get latest activity date
  const latestActivityDate = projects.length > 0 ? 
    new Date(Math.max(...projects.map(p => p.updatedAt.getTime()))) : null;

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Merhaba, {user?.username || user?.email || 'Kullanıcı'}!
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
      
      {/* Project Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-5 flex items-center">
          <div className="p-3 rounded-full bg-blue-500/10 mr-4">
            <FiGrid className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Toplam Proje</p>
            <h3 className="text-white text-xl font-bold">{totalProjects}</h3>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-5 flex items-center">
          <div className="p-3 rounded-full bg-green-500/10 mr-4">
            <FiGlobe className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Açık Projeler</p>
            <h3 className="text-white text-xl font-bold">{publicProjects}</h3>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-5 flex items-center">
          <div className="p-3 rounded-full bg-amber-500/10 mr-4">
            <FiLock className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Özel Projeler</p>
            <h3 className="text-white text-xl font-bold">{privateProjects}</h3>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-5 flex items-center">
          <div className="p-3 rounded-full bg-purple-500/10 mr-4">
            <FiClock className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Son Aktivite</p>
            <h3 className="text-white text-xl font-bold">
              {latestActivityDate ? latestActivityDate.toLocaleDateString('tr-TR') : '-'}
            </h3>
          </div>
        </div>
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
            {user && (
              <Link href={`/u/${user.username}`} className="block p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                Profil Sayfanızı Görüntüleyin
              </Link>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-medium text-white mb-3">Son Projeler</h2>
          {recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.map(project => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="p-3 bg-gray-700 rounded-md flex justify-between items-center hover:bg-gray-600 transition-colors">
                    <div>
                      <h3 className="font-medium text-white">{project.title}</h3>
                      <p className="text-sm text-gray-400">{new Date(project.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div>
                      {project.isPublic ? (
                        <FiGlobe className="text-green-500" />
                      ) : (
                        <FiLock className="text-amber-500" />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {totalProjects > 2 && (
                <Link href="/projects" className="block text-center text-sm text-blue-400 hover:text-blue-300 mt-2">
                  Tüm projeleri görüntüle ({totalProjects})
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400 mb-3">Henüz proje bulunmuyor</p>
              <Link 
                href="/projects/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                İlk Projenizi Oluşturun
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 