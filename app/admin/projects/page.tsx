'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiTrash2, FiStar, FiFlag, FiEye, FiLock, FiLoader, FiEdit } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

// Proje tipi tanımlaması
type Project = {
  id: string;
  title: string;
  userId: string;
  description: string;
  isPublic: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  status: string;
  createdAt: string;
  tags: string[];
  reportsCount?: number;
  user?: {
    id: string;
    email: string;
  };
};

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState('ALL');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [actionType, setActionType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  // API'den projeleri getir
  const fetchProjects = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/projects', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
      });
      
      if (!response.ok) {
        // Hata durumuna göre özel mesajlar
        if (response.status === 401 || response.status === 403) {
          throw new Error('Bu sayfaya erişim yetkiniz bulunmamaktadır. Lütfen admin olarak giriş yapın.');
        }
        
        // Diğer hata durumları için detaylı bilgi almaya çalış
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Projeler alınırken bir sorun oluştu');
        } catch (jsonError) {
          throw new Error('Projeler alınırken bir sorun oluştu');
        }
      }
      
      const data = await response.json();
      
      // API'den gelen verileri UI için dönüştür
      const formattedProjects = data.map((project: any) => ({
        id: project.id,
        title: project.title,
        userId: project.userId,
        userEmail: project.user?.email || 'Bilinmeyen Kullanıcı',
        description: project.description,
        isPublic: project.isPublic || false,
        isPinned: project.isPinned || false,
        isFeatured: project.isFeatured || false,
        status: project.status || 'GELISTIRILIYOR',
        createdAt: project.createdAt,
        tags: project.tags || [],
        reportsCount: project.reportsCount || 0,
        user: project.user
      }));
      
      setProjects(formattedProjects);
      setError(null);
    } catch (err: any) {
      console.error('Projeler alınırken hata:', err);
      setError(err.message || 'Projeleri yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);
  
  // Kullanıcının admin olduğunu kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        const userData = await response.json();
        
        if (!userData.authenticated) {
          router.push('/login?redirect=/admin/projects');
          return;
        }
        
        if (userData.user && userData.user.isAdmin) {
          setIsAdmin(true);
        } else {
          setError('Bu sayfaya erişim için admin yetkileri gereklidir.');
          setIsAdmin(false);
          setLoading(false);
        }
        
        setAuthChecked(true);
      } catch (err) {
        console.error('Yetkilendirme kontrolü sırasında hata:', err);
        setError('Yetkilendirme kontrolü sırasında bir sorun oluştu.');
        setLoading(false);
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [router]);
  
  // isAdmin değiştiğinde veya authChecked true olduğunda projeleri getir
  useEffect(() => {
    if (isAdmin === true && authChecked) {
      fetchProjects();
    }
  }, [isAdmin, authChecked, fetchProjects]);

  // Proje listesini manuel olarak yenile
  const refreshProjects = () => {
    fetchProjects();
  };
  
  // Arama ve filtreleme
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filtrelemesi için iyileştirilmiş kontrol
    const matchesStatus = statusFilter === 'ALL' || 
                         (statusFilter === 'PUBLISHED' && (project.status === 'PUBLISHED' || project.status === 'YAYINDA')) ||
                         (statusFilter === 'GELISTIRILIYOR' && (project.status === 'GELISTIRILIYOR' || project.status === 'DRAFT' || project.status === 'DEVELOPMENT')) ||
                         (statusFilter === 'COMPLETED' && (project.status === 'COMPLETED' || project.status === 'TAMAMLANDI')) ||
                         (statusFilter === 'ARCHIVED' && (project.status === 'ARCHIVED' || project.status === 'DELETED' || project.status === 'ARSIVDE'));
    
    const matchesVisibility = visibilityFilter === 'ALL' || 
                             (visibilityFilter === 'PUBLIC' && project.isPublic) || 
                             (visibilityFilter === 'PRIVATE' && !project.isPublic);
    
    return matchesSearch && matchesStatus && matchesVisibility;
  });
  
  // Proje silme işlemi
  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setActionType('delete');
      setShowConfirmDialog(true);
    }
  };
  
  // Proje pin durumunu değiştirme
  const handleTogglePin = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setActionType('pin');
      setShowConfirmDialog(true);
    }
  };
  
  // Proje öne çıkarma durumunu değiştirme (featured)
  const handleToggleFeatured = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setActionType('feature');
      setShowConfirmDialog(true);
    }
  };
  
  // Proje görünürlüğünü değiştirme (public/private)
  const handleToggleVisibility = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setActionType('visibility');
      setShowConfirmDialog(true);
    }
  };
  
  // İşlemi onayla
  const confirmAction = async () => {
    if (!selectedProject) return;
    
    setProcessing(true);
    
    try {
      if (actionType === 'delete') {
        // API üzerinden silme işlemi
        const response = await fetch(`/api/admin/projects?id=${selectedProject.id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Bu işlemi yapmak için yetkiniz bulunmamaktadır.');
          }
          
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Proje silinirken bir hata oluştu');
        }
        
        // UI'ı güncelle - projeyi listeden kaldır
        setProjects(projects.filter((project) => project.id !== selectedProject.id));
      } else if (actionType === 'pin') {
        // Pin işlemi için API entegrasyonu
        const response = await fetch('/api/admin/projects', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: selectedProject.id,
            isPinned: !selectedProject.isPinned
          }),
        });
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Bu işlemi yapmak için yetkiniz bulunmamaktadır.');
          }
          
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Proje öne çıkarılırken bir hata oluştu');
        }
        
        const updatedProject = await response.json();
        
        // UI'ı güncelle
        const updatedProjects = projects.map((project) => {
          if (project.id === selectedProject.id) {
            return { ...project, isPinned: !project.isPinned };
          }
          return project;
        });
        setProjects(updatedProjects);
      } else if (actionType === 'feature') {
        // Feature işlemi için API entegrasyonu
        const response = await fetch('/api/admin/projects', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: selectedProject.id,
            featured: !selectedProject.isFeatured
          }),
        });
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Bu işlemi yapmak için yetkiniz bulunmamaktadır.');
          }
          
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Proje öne çıkarma durumu güncellenirken bir hata oluştu');
        }
        
        // UI'ı güncelle
        const updatedProjects = projects.map((project) => {
          if (project.id === selectedProject.id) {
            return { ...project, isFeatured: !project.isFeatured };
          }
          return project;
        });
        setProjects(updatedProjects);
      } else if (actionType === 'visibility') {
        // API üzerinden görünürlük değiştirme
        const response = await fetch('/api/admin/projects', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: selectedProject.id,
            isPublic: !selectedProject.isPublic  // Use isPublic instead of featured for visibility toggle
          }),
        });
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Bu işlemi yapmak için yetkiniz bulunmamaktadır.');
          }
          
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Proje görünürlüğü değiştirilirken bir hata oluştu');
        }
        
        const updatedProject = await response.json();
        
        // UI'ı güncelle
        setProjects(projects.map((project) => {
          if (project.id === selectedProject.id) {
            return { 
              ...project, 
              isPublic: updatedProject.isPublic 
            };
          }
          return project;
        }));
      }
      
      setShowConfirmDialog(false);
      setSelectedProject(null);
      setError(null);
    } catch (err: any) {
      console.error('İşlem sırasında hata:', err);
      setError(err.message || 'İşlem sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setProcessing(false);
    }
  };
  
  // İşlemi iptal et
  const cancelAction = () => {
    setShowConfirmDialog(false);
    setSelectedProject(null);
    setActionType('');
  };
  
  // Duruma göre formatlama ve gösterim metni elde etme
  const getStatusDisplayText = (status: string): string => {
    if (status === 'PUBLISHED' || status === 'YAYINDA') return 'Yayında';
    if (status === 'GELISTIRILIYOR' || status === 'DRAFT' || status === 'DEVELOPMENT') return 'Geliştiriliyor';
    if (status === 'COMPLETED' || status === 'TAMAMLANDI') return 'Tamamlandı';
    if (status === 'ARCHIVED' || status === 'DELETED' || status === 'ARSIVDE') return 'Arşivlenmiş';
    return status;
  };
  
  // Duruma göre formatlama
  const formatStatus = (status: string) => {
    const statusClass = 
      (status === 'PUBLISHED' || status === 'YAYINDA' || status === 'COMPLETED' || status === 'TAMAMLANDI')
        ? 'bg-green-900/60 text-green-300'
        : (status === 'GELISTIRILIYOR' || status === 'DRAFT' || status === 'DEVELOPMENT')
          ? 'bg-yellow-900/60 text-yellow-300'
          : (status === 'ARCHIVED' || status === 'DELETED' || status === 'ARSIVDE')
            ? 'bg-red-900/60 text-red-300'
            : 'bg-gray-700 text-gray-300';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
        {getStatusDisplayText(status)}
      </span>
    );
  };
  
  // Görünürlük formatlama
  const formatVisibility = (isPublic: boolean) => {
    return isPublic 
      ? <span className="flex items-center text-green-600"><FiEye className="mr-1" /> Herkese Açık</span>
      : <span className="flex items-center text-gray-600"><FiLock className="mr-1" /> Gizli</span>;
  };
  
  // Pin durumu formatlama
  const formatPinned = (isPinned: boolean) => {
    return isPinned 
      ? <span className="flex items-center text-yellow-600"><FiStar className="mr-1" /> Öne Çıkarılmış</span>
      : null;
  };
  
  // Tarih formatlama
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const formatFeatured = (isFeatured: boolean) => {
    return isFeatured ? 
      <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full">Öne Çıkarılmış</span> : 
      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Standart</span>;
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Proje Yönetimi</h1>
      
      {/* Hata mesajı */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
          {(error.includes('erişim yetkiniz') || error.includes('yetkiniz bulunmamaktadır')) && (
            <div className="mt-2">
              <a href="/login" className="text-indigo-400 hover:underline">Giriş sayfasına git</a>
            </div>
          )}
        </div>
      )}
      
      {/* Admin kontrolü */}
      {!isAdmin && authChecked && !loading && (
        <div className="bg-indigo-900/30 border border-indigo-800 text-indigo-300 px-4 py-8 rounded-lg mb-6 text-center">
          <h3 className="text-xl font-bold mb-2">Yetkisiz Erişim</h3>
          <p>Bu sayfaya erişim için admin yetkileri gereklidir. Lütfen admin hesabı ile giriş yapın.</p>
          <div className="mt-4">
            <a href="/login?redirect=/admin/projects" className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg">
              Giriş Sayfasına Git
            </a>
          </div>
        </div>
      )}
      
      {/* Yükleniyor */}
      {loading && (
        <div className="flex items-center justify-center p-12">
          <FiLoader className="h-8 w-8 text-indigo-500 animate-spin" />
          <span className="ml-2 text-gray-300">Projeler yükleniyor...</span>
        </div>
      )}
      
      {/* İçerik - Sadece admin ve yükleme tamamlandıysa göster */}
      {isAdmin === true && !loading && (
        <>
          {/* Filtreleme ve arama */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative flex-grow max-w-lg">
              <input
                type="text"
                className="w-full px-4 py-3 pl-10 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Projelerde ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                className="px-4 py-3 bg-gray-900 border border-indigo-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tüm Durumlar</option>
                <option value="GELISTIRILIYOR">Geliştiriliyor</option>
                <option value="PUBLISHED">Yayında</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="ARCHIVED">Arşivlenmiş</option>
              </select>
              
              <select
                className="px-4 py-3 bg-gray-900 border border-indigo-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
              >
                <option value="ALL">Tüm Görünürlükler</option>
                <option value="PUBLIC">Herkese Açık</option>
                <option value="PRIVATE">Gizli</option>
              </select>
              
              <button 
                className="px-6 py-3 bg-indigo-700 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                onClick={refreshProjects}
              >
                Yenile
              </button>
            </div>
          </div>
          
          {/* Proje Listesi */}
          {filteredProjects.length === 0 ? (
            <div className="bg-gray-900 p-6 text-center rounded-lg">
              <p className="text-gray-400">Hiç proje bulunamadı.</p>
            </div>
          ) : (
            <div className="bg-gray-900/50 rounded-lg shadow-lg overflow-hidden border border-gray-800">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4">
                      Proje Adı
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/5">
                      Sahibi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/6">
                      Durum
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/6">
                      Görünürlük
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/6">
                      Öne Çıkarma
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/6">
                      Oluşturulma
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-[140px]">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900/30 divide-y divide-gray-800">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className={`hover:bg-gray-800/30 ${project.isPinned ? 'bg-indigo-900/10' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="ml-0">
                            <div className="text-sm font-medium text-gray-100 flex items-center">
                              {project.title}
                              {project.isPinned && (
                                <span className="ml-2 text-amber-400">
                                  <FiStar className="inline h-4 w-4" />
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400 max-w-xs truncate">{project.description}</div>
                            {project.tags && project.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {project.tags.slice(0, 3).map((tag, index) => (
                                  <span key={index} className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full text-xs">
                                    {tag}
                                  </span>
                                ))}
                                {project.tags.length > 3 && (
                                  <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full text-xs">
                                    +{project.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">{project.user?.email || 'Bilinmeyen Kullanıcı'}</div>
                        <div className="text-xs text-gray-500">{project.userId}</div>
                      </td>
                      <td className="px-6 py-4">
                        {formatStatus(project.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center text-sm">
                          {project.isPublic 
                            ? <span className="text-green-400 flex items-center"><FiEye className="mr-1" /> Herkese Açık</span>
                            : <span className="text-gray-400 flex items-center"><FiLock className="mr-1" /> Gizli</span>
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {formatFeatured(project.isFeatured)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {formatDate(project.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-3">
                          <button
                            className={`p-2.5 rounded-full ${project.isPinned ? 'bg-amber-900/40 text-amber-400' : 'bg-gray-800 text-gray-400'} hover:bg-gray-700 transition-colors`}
                            onClick={() => handleTogglePin(project.id)}
                            title={project.isPinned ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
                          >
                            <FiStar size={18} />
                          </button>
                          <button
                            className={`p-2.5 rounded-full ${project.isPublic ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-400'} hover:bg-gray-700 transition-colors`}
                            onClick={() => handleToggleVisibility(project.id)}
                            title={project.isPublic ? "Gizli yap" : "Herkese açık yap"}
                          >
                            {project.isPublic ? <FiLock size={18} /> : <FiEye size={18} />}
                          </button>
                          <button
                            className={`p-2 rounded-md ${
                              project.isFeatured ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                            } hover:opacity-80 transition-opacity`}
                            onClick={() => handleToggleFeatured(project.id)}
                          >
                            <FiStar />
                          </button>
                          <button
                            className="p-2.5 rounded-full bg-indigo-900/40 text-indigo-400 hover:bg-indigo-900/60 transition-colors"
                            onClick={() => router.push(`/projects/${project.id}/edit`)}
                            title="Projeyi düzenle"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            className="p-2.5 rounded-full bg-red-900/40 text-red-400 hover:bg-red-900/60 transition-colors"
                            onClick={() => handleDeleteProject(project.id)}
                            title="Projeyi sil"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      
      {/* Onay Diyaloğu */}
      {showConfirmDialog && selectedProject && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {actionType === 'delete' && 'Projeyi Sil'}
              {actionType === 'pin' && (selectedProject.isPinned ? 'Öne Çıkarmayı Kaldır' : 'Öne Çıkar')}
              {actionType === 'feature' && (selectedProject.isFeatured ? 'Öne Çıkarmayı Kaldır' : 'Öne Çıkar')}
              {actionType === 'visibility' && (selectedProject.isPublic ? 'Projeyi Gizli Yap' : 'Projeyi Herkese Açık Yap')}
            </h3>
            
            <p className="text-gray-300 mb-6">
              {actionType === 'delete' && `"${selectedProject.title}" projesi kalıcı olarak silinecektir. Bu işlem geri alınamaz.`}
              {actionType === 'pin' && (selectedProject.isPinned 
                ? `"${selectedProject.title}" projesi artık öne çıkarılmayacak.` 
                : `"${selectedProject.title}" projesi öne çıkarılacak.`)}
              {actionType === 'feature' && (selectedProject.isFeatured 
                ? `"${selectedProject.title}" projesi artık öne çıkarılmayacak.` 
                : `"${selectedProject.title}" projesi öne çıkarılacak.`)}
              {actionType === 'visibility' && (selectedProject.isPublic 
                ? `"${selectedProject.title}" projesi artık herkese açık olmayacak.` 
                : `"${selectedProject.title}" projesi artık herkese açık olacak.`)}
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={cancelAction}
                disabled={processing}
              >
                İptal
              </button>
              <button
                type="button"
                className={`px-4 py-2 font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  actionType === 'delete' ? 'bg-red-700 hover:bg-red-600 focus:ring-red-500' : 
                  'bg-indigo-700 hover:bg-indigo-600 focus:ring-indigo-500'
                }`}
                onClick={confirmAction}
                disabled={processing}
              >
                {processing ? (
                  <span className="flex items-center">
                    <FiLoader className="animate-spin mr-2" />
                    İşleniyor...
                  </span>
                ) : (
                  actionType === 'delete' ? 'Evet, Sil' : 'Onayla'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 