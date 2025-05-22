'use client';

import { FiUsers, FiFolder, FiEye, FiClock, FiAlertTriangle, FiExternalLink, FiGithub, FiEdit2, FiRefreshCw } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dinamik olarak yükle (client tarafında)
const ProjectCharts = dynamic(() => import('@/components/admin/ProjectCharts'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <FiRefreshCw className="animate-spin text-indigo-500 mr-2" />
      <span className="text-gray-400">Grafik bileşeni yükleniyor...</span>
    </div>
  )
});

type DashboardStats = {
  totalUsers: number;
  totalProjects: number;
  activePublicProjects: number;
  recentProjects: number;
};

type Project = {
  id: string;
  title: string;
  description: string;
  githubUrl: string;
  demoUrl?: string;
  isPublic: boolean;
  status: string;
  createdAt: string;
  user: {
    username: string;
    email: string;
  };
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProjects: 0,
    activePublicProjects: 0,
    recentProjects: 0
  });
  const [recentProjectsList, setRecentProjectsList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin yetkisini kontrol et
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
        
        if (!userData.authenticated) {
          router.push('/login?redirect=/admin');
          return;
        }
        
        // Check if user data exists and has admin role
        if (userData.user && userData.user.isAdmin) {
          setIsAdmin(true);
          // Admin yetkisi varsa istatistikleri getir
          fetchDashboardData();
        } else {
          setError('Bu sayfaya erişim için admin yetkileri gereklidir.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Yetkilendirme kontrolü sırasında hata:', err);
        setError('Yetkilendirme kontrolü sırasında bir sorun oluştu.');
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  // Dashboard verilerini getir
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // İstatistikleri ve son projeleri paralel olarak getir
      const [statsResponse, recentProjectsResponse] = await Promise.all([
        fetch('/api/admin/dashboard', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        }),
        fetch('/api/admin/dashboard/recent-projects', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        })
      ]);

      if (!statsResponse.ok) {
        throw new Error('İstatistikler alınırken bir sorun oluştu');
      }

      if (!recentProjectsResponse.ok) {
        throw new Error('Son projeler alınırken bir sorun oluştu');
      }

      const statsData = await statsResponse.json();
      const recentProjectsData = await recentProjectsResponse.json();
      
      setStats(statsData);
      setRecentProjectsList(recentProjectsData);
      setError(null);
    } catch (err: any) {
      console.error('Dashboard verileri alınırken hata:', err);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Tarih formatı
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Yeniden yükleme işlevi
  const refreshData = () => {
    fetchDashboardData();
  };

  const statCards = [
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      icon: <FiUsers className="h-7 w-7 text-blue-500" />,
      color: 'bg-blue-900/20',
    },
    {
      title: 'Toplam Proje',
      value: stats.totalProjects,
      icon: <FiFolder className="h-7 w-7 text-green-500" />,
      color: 'bg-green-900/20',
    },
    {
      title: 'Aktif Public Projeler',
      value: stats.activePublicProjects,
      icon: <FiEye className="h-7 w-7 text-purple-500" />,
      color: 'bg-purple-900/20',
    },
    {
      title: 'Son 7 Gün Eklenenler',
      value: stats.recentProjects,
      icon: <FiClock className="h-7 w-7 text-amber-500" />,
      color: 'bg-amber-900/20',
    },
  ];

  // Proje durumuna göre renkler
  const statusColors = {
    'GELISTIRILIYOR': 'text-amber-400',
    'YAYINDA': 'text-green-400',
    'ARSIVDE': 'text-gray-400'
  };

  // Proje durumu Türkçe karşılıkları
  const statusLabels = {
    'GELISTIRILIYOR': 'Geliştiriliyor',
    'YAYINDA': 'Yayında',
    'ARSIVDE': 'Arşivde'
  };

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 rounded-xl border border-red-800">
        <h2 className="text-xl font-bold text-white mb-2">Hata</h2>
        <p className="text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Platform genel görünümü ve istatistikler</p>
          {loading && (
            <div className="mt-2 text-indigo-400 text-sm flex items-center">
              <FiClock className="animate-spin mr-2" /> Veriler yükleniyor...
            </div>
          )}
        </div>
        
        <button 
          onClick={refreshData}
          className="p-2 bg-indigo-900/40 text-indigo-400 rounded-lg hover:bg-indigo-900/60 transition-colors flex items-center"
          disabled={loading}
        >
          <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl border border-gray-800 ${card.color} ${loading ? 'opacity-50' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{card.title}</p>
                <h3 className="text-3xl font-bold text-white">{loading ? '...' : card.value}</h3>
              </div>
              <div>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Grafik Bileşeni */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-white mb-4">Dashboard Grafikleri</h2>
        <ProjectCharts />
      </div>
      
      {/* Son Eklenen Projeler Listesi */}
      <div className="mt-10 p-6 rounded-xl border border-gray-800 bg-gray-900/50">
        <h2 className="text-xl font-semibold text-white mb-4">Son Eklenen Projeler</h2>
        
        {loading ? (
          <div className="flex justify-center p-6">
            <FiClock className="animate-spin mr-2 text-indigo-400" /> 
            <span className="text-indigo-400">Projeler yükleniyor...</span>
          </div>
        ) : recentProjectsList.length === 0 ? (
          <div className="text-gray-400 p-4 text-center">
            Son 7 gün içinde eklenen proje bulunmamaktadır.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-800 text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3 rounded-tl-lg">Proje</th>
                  <th scope="col" className="px-4 py-3">Kullanıcı</th>
                  <th scope="col" className="px-4 py-3">Durum</th>
                  <th scope="col" className="px-4 py-3">Oluşturma Tarihi</th>
                  <th scope="col" className="px-4 py-3 rounded-tr-lg">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {recentProjectsList.map((project) => (
                  <tr key={project.id} className="border-b border-gray-800 bg-gray-900 hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{project.title}</div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-1">{project.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/u/${project.user.username}`} className="hover:text-indigo-400 hover:underline">
                        @{project.user.username}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={statusColors[project.status as keyof typeof statusColors]}>
                        {statusLabels[project.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {formatDate(project.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/admin/projects?id=${project.id}`} 
                          className="p-1.5 bg-indigo-900/40 text-indigo-400 rounded hover:bg-indigo-900/60 transition-colors"
                          title="Projeyi Düzenle"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                        <a 
                          href={project.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors"
                          title="GitHub'da Görüntüle"
                        >
                          <FiGithub className="w-4 h-4" />
                        </a>
                        {project.demoUrl && (
                          <a 
                            href={project.demoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 bg-blue-900/40 text-blue-400 rounded hover:bg-blue-900/60 transition-colors"
                            title="Demo Sitesini Aç"
                          >
                            <FiExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 text-right">
          <Link 
            href="/admin/projects" 
            className="inline-block text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            Tüm projeleri görüntüle →
          </Link>
        </div>
      </div>
      
      <div className="mt-10 p-6 rounded-xl border border-gray-800 bg-gray-900/50">
        <h2 className="text-xl font-semibold text-white mb-4">Admin İşlevleri</h2>
        <p className="text-gray-400 mb-4">
          Yan menüden platformun farklı bölümlerini yönetebilirsiniz. Kullanıcıları ve projeleri düzenleyebilir, 
          raporları inceleyebilirsiniz.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <a href="/admin/users" className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition">
            <FiUsers className="h-6 w-6 mx-auto mb-2 text-blue-400" />
            <p className="font-medium">Kullanıcıları Yönet</p>
          </a>
          <a href="/admin/projects" className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition">
            <FiFolder className="h-6 w-6 mx-auto mb-2 text-green-400" />
            <p className="font-medium">Projeleri Yönet</p>
          </a>
          <a href="/admin/reports" className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition">
            <FiAlertTriangle className="h-6 w-6 mx-auto mb-2 text-amber-400" />
            <p className="font-medium">Raporları Görüntüle</p>
          </a>
        </div>
      </div>
    </div>
  );
} 