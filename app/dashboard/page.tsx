import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FiArrowRight, FiGrid, FiLock, FiGlobe, FiClock } from 'react-icons/fi';
import Link from 'next/link';

// Example projects data
const exampleProjects = [
  {
    id: '1',
    title: 'E-Commerce Website',
    isPublic: true,
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    title: 'Portfolio App',
    isPublic: false,
    createdAt: new Date('2023-03-10'),
  },
  {
    id: '3',
    title: 'Task Manager',
    isPublic: true,
    createdAt: new Date('2023-04-20'),
  },
];

export default async function DashboardPage() {
  const userPayload = await getCurrentUser();
  
  // Get user info from database
  const user = userPayload?.userId ? await prisma.user.findUnique({
    where: { id: userPayload.userId }
  }) : null;

  // In real app, these would be fetched from database
  const totalProjects = exampleProjects.length;
  const publicProjects = exampleProjects.filter(p => p.isPublic).length;
  const privateProjects = exampleProjects.filter(p => !p.isPublic).length;
  const recentProjects = exampleProjects
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 2);

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
            <h3 className="text-white text-xl font-bold">{recentProjects[0] ? new Date(recentProjects[0].createdAt).toLocaleDateString() : '-'}</h3>
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
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-medium text-white mb-3">Son Projeler</h2>
          {recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.map(project => (
                <div key={project.id} className="p-3 bg-gray-700 rounded-md flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-white">{project.title}</h3>
                    <p className="text-sm text-gray-400">{new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    {project.isPublic ? (
                      <FiGlobe className="text-green-500" />
                    ) : (
                      <FiLock className="text-amber-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Henüz proje bulunmuyor</p>
          )}
        </div>
      </div>
    </div>
  );
} 