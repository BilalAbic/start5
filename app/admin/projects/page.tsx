'use client';

import { useState } from 'react';
import { FiSearch, FiTrash2, FiStar, FiFlag, FiEye, FiLock } from 'react-icons/fi';

// Proje tipi tanımlaması
type Project = {
  id: string;
  title: string;
  userId: string;
  userEmail: string;
  description: string;
  isPublic: boolean;
  isPinned: boolean;
  status: string;
  createdAt: string;
  tags: string[];
  reportsCount: number;
};

// Geçici statik proje verileri
const MOCK_PROJECTS: Project[] = [
  { 
    id: '1', 
    title: 'E-Ticaret Dashboard',
    userId: '2',
    userEmail: 'developer1@gmail.com',
    description: 'Modern bir e-ticaret yönetim paneli',
    isPublic: true,
    isPinned: true,
    status: 'YAYINDA',
    createdAt: '2023-08-15T10:00:00Z',
    tags: ['React', 'Tailwind', 'Node.js'],
    reportsCount: 0
  },
  { 
    id: '2', 
    title: 'Blog Platformu',
    userId: '3',
    userEmail: 'developer2@gmail.com',
    description: 'Markdown destekli blog yazma platformu',
    isPublic: true,
    isPinned: false,
    status: 'YAYINDA',
    createdAt: '2023-09-20T10:00:00Z',
    tags: ['Vue', 'Express', 'MongoDB'],
    reportsCount: 2
  },
  { 
    id: '3', 
    title: 'Finans Takip Uygulaması',
    userId: '4',
    userEmail: 'designer1@outlook.com',
    description: 'Kişisel finans yönetim uygulaması',
    isPublic: false,
    isPinned: false,
    status: 'GELISTIRILIYOR',
    createdAt: '2023-10-10T10:00:00Z',
    tags: ['React Native', 'Firebase'],
    reportsCount: 0
  },
  { 
    id: '4', 
    title: 'Sosyal Medya Analizi',
    userId: '2',
    userEmail: 'developer1@gmail.com',
    description: 'Sosyal medya analitik platformu',
    isPublic: true,
    isPinned: false,
    status: 'ARSIVDE',
    createdAt: '2023-07-05T10:00:00Z',
    tags: ['Python', 'Django', 'React'],
    reportsCount: 1
  },
  { 
    id: '5', 
    title: 'Görüntü İşleme Servisi',
    userId: '3',
    userEmail: 'developer2@gmail.com',
    description: 'AI tabanlı görüntü işleme API',
    isPublic: true,
    isPinned: true,
    status: 'YAYINDA',
    createdAt: '2023-11-01T10:00:00Z',
    tags: ['Python', 'TensorFlow', 'FastAPI'],
    reportsCount: 0
  },
];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState('ALL');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [actionType, setActionType] = useState('');

  // Arama ve filtreleme
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    
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
  const confirmAction = () => {
    if (!selectedProject) return;
    
    if (actionType === 'delete') {
      setProjects(projects.filter((project) => project.id !== selectedProject.id));
    } else if (actionType === 'pin') {
      setProjects(projects.map((project) => {
        if (project.id === selectedProject.id) {
          return { ...project, isPinned: !project.isPinned };
        }
        return project;
      }));
    } else if (actionType === 'visibility') {
      setProjects(projects.map((project) => {
        if (project.id === selectedProject.id) {
          return { ...project, isPublic: !project.isPublic };
        }
        return project;
      }));
    }
    setShowConfirmDialog(false);
    setSelectedProject(null);
    setActionType('');
  };
  
  // Formatlanmış tarih
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Proje Yönetimi</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Proje ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="YAYINDA">Yayında</option>
            <option value="GELISTIRILIYOR">Geliştiriliyor</option>
            <option value="ARSIVDE">Arşivde</option>
          </select>
          
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tüm Görünürlük</option>
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>
      </div>
      
      {/* Projeler tablosu */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Proje</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kullanıcı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Görünürlük</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredProjects.map((project) => (
                <tr key={project.id} className={`hover:bg-gray-800/30 ${project.isPinned ? 'bg-indigo-900/10' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-100">
                            {project.title}
                            {project.isPinned && (
                              <span className="ml-2 text-amber-400">
                                <FiStar className="inline h-4 w-4" />
                              </span>
                            )}
                          </h3>
                          {project.reportsCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-red-900/60 text-red-300">
                              {project.reportsCount} Rapor
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{project.description}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {project.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {project.userEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'YAYINDA' 
                        ? 'bg-green-900/60 text-green-300'
                        : project.status === 'GELISTIRILIYOR'
                          ? 'bg-blue-900/60 text-blue-300'
                          : 'bg-gray-700 text-gray-300'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.isPublic ? 'bg-indigo-900/60 text-indigo-300' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {project.isPublic ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(project.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleTogglePin(project.id)}
                      className={`${project.isPinned ? 'text-amber-400 hover:text-amber-300' : 'text-gray-400 hover:text-gray-300'}`}
                      title={project.isPinned ? 'Pini Kaldır' : 'Pin\'le'}
                    >
                      <FiStar className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleToggleVisibility(project.id)}
                      className={`${project.isPublic ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-gray-300'}`}
                      title={project.isPublic ? 'Private Yap' : 'Public Yap'}
                    >
                      {project.isPublic ? <FiEye className="h-5 w-5" /> : <FiLock className="h-5 w-5" />}
                    </button>
                    {project.reportsCount > 0 && (
                      <a 
                        href={`/admin/reports?projectId=${project.id}`}
                        className="text-red-400 hover:text-red-300"
                        title="Raporları Görüntüle"
                      >
                        <FiFlag className="h-5 w-5" />
                      </a>
                    )}
                    <button 
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-500 hover:text-red-400"
                      title="Projeyi Sil"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Onay Dialog */}
      {showConfirmDialog && selectedProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              {actionType === 'delete' 
                ? 'Projeyi Sil' 
                : actionType === 'pin' 
                  ? (selectedProject.isPinned ? 'Proje Pinini Kaldır' : 'Projeyi Pinle')
                  : (selectedProject.isPublic ? 'Projeyi Private Yap' : 'Projeyi Public Yap')}
            </h3>
            <p className="text-gray-300 mb-6">
              {actionType === 'delete' 
                ? `"${selectedProject.title}" projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.` 
                : actionType === 'pin' 
                  ? `"${selectedProject.title}" projesini ${selectedProject.isPinned ? 'pin\'lemekten çıkarmak' : 'pin\'lemek'} istediğinize emin misiniz?`
                  : `"${selectedProject.title}" projesini ${selectedProject.isPublic ? 'private' : 'public'} yapmak istediğinize emin misiniz?`}
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowConfirmDialog(false)} 
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700">
                İptal
              </button>
              <button 
                onClick={confirmAction} 
                className={`px-4 py-2 rounded-lg ${
                  actionType === 'delete' 
                    ? 'bg-red-700 hover:bg-red-600 text-white' 
                    : 'bg-indigo-700 hover:bg-indigo-600 text-white'
                }`}>
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 