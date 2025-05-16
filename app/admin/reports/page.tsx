'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiSearch, FiTrash2, FiCheck, FiX, FiExternalLink } from 'react-icons/fi';

// Rapor tipi tanımlaması
type Report = {
  id: string;
  projectId: string;
  projectTitle: string;
  userId: string;
  reporterEmail: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
};

// Geçici statik rapor verileri
const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    projectId: '2',
    projectTitle: 'Blog Platformu',
    userId: '5',
    reporterEmail: 'user1@gmail.com',
    reason: 'INAPPROPRIATE',
    description: 'İçerik politikalarına aykırı ifadeler içeriyor.',
    status: 'PENDING',
    createdAt: '2023-12-10T14:22:00Z'
  },
  {
    id: '2',
    projectId: '2',
    projectTitle: 'Blog Platformu',
    userId: '6',
    reporterEmail: 'user2@gmail.com',
    reason: 'COPYRIGHT',
    description: 'Başkasına ait kod ve tasarımlar izinsiz kullanılmış.',
    status: 'PENDING',
    createdAt: '2023-12-15T09:14:00Z'
  },
  {
    id: '3',
    projectId: '4',
    projectTitle: 'Sosyal Medya Analizi',
    userId: '7',
    reporterEmail: 'user3@hotmail.com',
    reason: 'SPAM',
    description: 'Proje gerçek değil, sadece reklam amaçlı.',
    status: 'RESOLVED',
    createdAt: '2023-11-28T16:45:00Z'
  }
];

// Rapor nedeni açıklamaları
const REPORT_REASONS = {
  'INAPPROPRIATE': 'Uygunsuz İçerik',
  'COPYRIGHT': 'Telif Hakkı İhlali',
  'SPAM': 'Spam / Yanıltıcı',
  'OTHER': 'Diğer'
};

export default function AdminReportsPage() {
  const searchParams = useSearchParams();
  const projectIdFilter = searchParams?.get('projectId') || '';
  
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionType, setActionType] = useState('');

  // Projeye göre filtreleme
  useEffect(() => {
    if (projectIdFilter) {
      setSearchTerm(projectIdFilter);
    }
  }, [projectIdFilter]);

  // Arama ve filtreleme
  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
      report.reporterEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.projectId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Rapor silme işlemi
  const handleDeleteReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      setActionType('delete');
      setShowConfirmDialog(true);
    }
  };
  
  // Raporu onaylama (haklı bulma)
  const handleResolveReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      setActionType('resolve');
      setShowConfirmDialog(true);
    }
  };
  
  // Raporu reddetme
  const handleRejectReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      setActionType('reject');
      setShowConfirmDialog(true);
    }
  };
  
  // İşlemi onayla
  const confirmAction = () => {
    if (!selectedReport) return;
    
    if (actionType === 'delete') {
      setReports(reports.filter((report) => report.id !== selectedReport.id));
    } else if (actionType === 'resolve') {
      setReports(reports.map((report) => {
        if (report.id === selectedReport.id) {
          return { ...report, status: 'RESOLVED' };
        }
        return report;
      }));
    } else if (actionType === 'reject') {
      setReports(reports.map((report) => {
        if (report.id === selectedReport.id) {
          return { ...report, status: 'REJECTED' };
        }
        return report;
      }));
    }
    setShowConfirmDialog(false);
    setSelectedReport(null);
    setActionType('');
  };
  
  // Formatlanmış tarih
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Şikayet Raporları</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Ara..."
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
            <option value="PENDING">Beklemede</option>
            <option value="RESOLVED">Çözüldü</option>
            <option value="REJECTED">Reddedildi</option>
          </select>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center text-gray-400">
          <p>Hiç rapor bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="p-5 border-b border-gray-800 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{report.projectTitle}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === 'PENDING' 
                        ? 'bg-blue-900/60 text-blue-300'
                        : report.status === 'RESOLVED'
                          ? 'bg-green-900/60 text-green-300'
                          : 'bg-red-900/60 text-red-300'
                    }`}>
                      {report.status === 'PENDING' ? 'Beklemede' : 
                       report.status === 'RESOLVED' ? 'Çözüldü' : 'Reddedildi'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">
                    <span className="font-medium">Rapor Eden:</span> {report.reporterEmail}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium">Tarih:</span> {formatDate(report.createdAt)}
                  </p>
                </div>
                
                <a 
                  href={`/projects/${report.projectId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>Projeyi Görüntüle</span>
                  <FiExternalLink />
                </a>
              </div>
              
              <div className="p-5">
                <div className="mb-3">
                  <span className="text-sm font-semibold text-gray-300 block mb-1">Rapor Nedeni:</span>
                  <span className="px-2 py-1 rounded-md text-sm bg-gray-800 text-gray-300">
                    {REPORT_REASONS[report.reason as keyof typeof REPORT_REASONS]}
                  </span>
                </div>
                <div className="mb-5">
                  <span className="text-sm font-semibold text-gray-300 block mb-1">Açıklama:</span>
                  <p className="text-gray-400 text-sm">{report.description}</p>
                </div>
                
                {report.status === 'PENDING' && (
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => handleRejectReport(report.id)}
                      className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FiX />
                      <span>Reddet</span>
                    </button>
                    <button 
                      onClick={() => handleResolveReport(report.id)}
                      className="px-4 py-2 bg-green-800 text-green-100 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <FiCheck />
                      <span>Onayla</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteReport(report.id)}
                      className="px-4 py-2 bg-red-800 text-red-100 rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                      <FiTrash2 />
                      <span>Sil</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Onay Dialog */}
      {showConfirmDialog && selectedReport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              {actionType === 'delete' 
                ? 'Raporu Sil' 
                : actionType === 'resolve' 
                  ? 'Raporu Onayla' 
                  : 'Raporu Reddet'}
            </h3>
            <p className="text-gray-300 mb-6">
              {actionType === 'delete' 
                ? `Bu raporu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.` 
                : actionType === 'resolve' 
                  ? `"${selectedReport.projectTitle}" projesi için raporu onaylamak ve konu hakkında işlem yapmak istediğinize emin misiniz?`
                  : `"${selectedReport.projectTitle}" projesi için raporu reddetmek istediğinize emin misiniz?`}
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
                    : actionType === 'resolve'
                    ? 'bg-green-700 hover:bg-green-600 text-white' 
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