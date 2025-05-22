'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FiAlertTriangle, FiFilter, FiRefreshCw, FiTrash2, FiCheck, FiX, FiEye, FiEdit, FiUserX } from 'react-icons/fi';

// Types
type Report = {
  id: string;
  projectId: string;
  reporterId: string | null;
  reason: string;
  details: string | null;
  status: 'PENDING' | 'REVIEWED' | 'IGNORED' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    title: string;
    userId: string;
    user: {
      id: string;
      username: string;
      email: string;
      profileImage: string | null;
    };
  };
  reporter: {
    id: string;
    username: string;
    email: string;
    profileImage: string | null;
  } | null;
};

type Filter = {
  status: string | null;
  reason: string | null;
};

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filter>({ status: null, reason: null });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReports: 0,
  });
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Fetch reports based on filters and pagination
  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = `/api/reports?page=${pagination.currentPage}`;
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.reason) url += `&reason=${filters.reason}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReports(data.reports);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalReports: data.totalReports,
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Raporlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Update report status
  const updateReportStatus = async (reportId: string, newStatus: string) => {
    setActionInProgress(reportId);
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update report status');
      }

      // Success message based on status
      const statusMessages = {
        'REVIEWED': 'Rapor incelendi olarak işaretlendi',
        'IGNORED': 'Rapor görmezden gelindi',
        'RESOLVED': 'Rapor çözüldü olarak işaretlendi',
        'PENDING': 'Rapor beklemede olarak işaretlendi'
      };
      
      toast.success(statusMessages[newStatus as keyof typeof statusMessages] || 'Rapor durumu güncellendi');
      
      // Update the report in the local state
      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus as any } 
          : report
      ));
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Rapor durumu güncellenirken bir hata oluştu.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Delete report
  const deleteReport = async (reportId: string) => {
    if (!confirm('Bu raporu silmek istediğinize emin misiniz?')) {
      return;
    }

    setActionInProgress(reportId);
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      toast.success('Rapor başarıyla silindi');
      
      // Remove the report from the local state
      setReports(reports.filter(report => report.id !== reportId));
      
      // Update pagination if needed
      if (reports.length === 1 && pagination.currentPage > 1) {
        setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Rapor silinirken bir hata oluştu.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Function to handle user suspension
  const suspendUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı askıya almak istediğinize emin misiniz?')) {
      return;
    }

    setActionInProgress(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          status: 'suspended',
          action: 'changeStatus'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to suspend user');
      }

      toast.success('Kullanıcı başarıyla askıya alındı');
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Kullanıcı askıya alınırken bir hata oluştu.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({ status: null, reason: null });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Load reports on mount and when filters/pagination change
  useEffect(() => {
    fetchReports();
  }, [filters, pagination.currentPage]);

  const translateReason = (reason: string) => {
    const reasonMap: Record<string, string> = {
      'SPAM': 'Spam',
      'INAPPROPRIATE': 'Uygunsuz İçerik',
      'COPYRIGHT': 'Telif Hakkı İhlali',
      'OTHER': 'Diğer',
    };
    return reasonMap[reason] || reason;
  };

  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Beklemede',
      'REVIEWED': 'İncelendi',
      'IGNORED': 'Yok sayıldı',
      'RESOLVED': 'Çözüldü',
    };
    return statusMap[status] || status;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-900/40 text-amber-300 border border-amber-700/50';
      case 'REVIEWED':
        return 'bg-blue-900/40 text-blue-300 border border-blue-700/50';
      case 'IGNORED':
        return 'bg-gray-800/40 text-gray-300 border border-gray-700/50';
      case 'RESOLVED':
        return 'bg-green-900/40 text-green-300 border border-green-700/50';
      default:
        return 'bg-gray-800/40 text-gray-300 border border-gray-700/50';
    }
  };

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/3"></div>
            </div>
            <div className="h-6 bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state component
  const renderEmptyState = () => (
    <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-8 text-center">
      <FiAlertTriangle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-300 mb-2">Rapor bulunamadı</h3>
      <p className="text-gray-400 mb-4">Seçili filtrelere uygun rapor bulunmuyor.</p>
      {(filters.status || filters.reason) && (
        <button 
          onClick={resetFilters}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Filtreleri Temizle
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <FiAlertTriangle className="mr-2 text-indigo-400" />
          Raporlar
        </h1>
        <button 
          onClick={fetchReports} 
          className="inline-flex items-center px-3 py-2 border border-gray-700 rounded-md bg-gray-800 hover:bg-gray-700 text-sm font-medium text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={loading}
        >
          <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center mb-3">
          <FiFilter className="mr-2 text-gray-400" />
          <h2 className="font-medium text-gray-200">Filtreler</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-300 mb-1">
              Durum
            </label>
            <select
              id="status-filter"
              className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 w-full focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 focus:ring-opacity-50"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || null })}
            >
              <option value="">Tümü</option>
              <option value="PENDING">Beklemede</option>
              <option value="REVIEWED">İncelendi</option>
              <option value="IGNORED">Yok sayıldı</option>
              <option value="RESOLVED">Çözüldü</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="reason-filter" className="block text-sm font-medium text-gray-300 mb-1">
              Sebep
            </label>
          <select
              id="reason-filter"
              className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 w-full focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 focus:ring-opacity-50"
              value={filters.reason || ''}
              onChange={(e) => setFilters({ ...filters, reason: e.target.value || null })}
            >
              <option value="">Tümü</option>
              <option value="SPAM">Spam</option>
              <option value="INAPPROPRIATE">Uygunsız İçerik</option>
              <option value="COPYRIGHT">Telif Hakkı İhlali</option>
              <option value="OTHER">Diğer</option>
          </select>
          </div>
          {(filters.status || filters.reason) && (
            <div className="self-end mb-[2px]">
              <button 
                onClick={resetFilters}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-gray-200 transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        renderSkeleton()
      ) : reports.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rapor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Proje
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Sebep
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {report.reporter?.profileImage ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover border border-gray-700"
                              src={report.reporter.profileImage}
                              alt={report.reporter.username}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                              <span className="text-gray-300 text-sm">
                                {report.reporter?.username?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-200">
                            {report.reporter ? (
                              <Link href={`/u/${report.reporter.username}`} className="hover:text-indigo-400 transition-colors">
                                {report.reporter.username}
                              </Link>
                            ) : (
                              <span className="text-gray-400">Anonim</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {report.reporter?.email || 'Anonim rapor'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-200">
                        <Link href={`/projects/${report.project.id}`} className="hover:text-indigo-400 transition-colors">
                          {report.project.title}
                        </Link>
                      </div>
                      <div className="text-xs text-gray-400">
                        <Link href={`/u/${report.project.user.username}`} className="hover:text-indigo-400 transition-colors">
                          {report.project.user.username}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-200">{translateReason(report.reason)}</div>
                      {report.details && (
                        <div className="text-xs text-gray-400 max-w-xs truncate" title={report.details}>
                          {report.details}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(report.status)}`}>
                        {translateStatus(report.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: tr })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <div className="dropdown dropdown-end">
                          <label tabIndex={0} className="btn btn-xs bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-200">
                            İşlem
                          </label>
                          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-gray-900 border border-gray-700 rounded-md w-52 text-sm text-gray-200">
                            <li>
                              <button 
                                className="flex items-center px-3 py-2 hover:bg-gray-800/70 rounded-md" 
                                onClick={() => updateReportStatus(report.id, 'REVIEWED')}
                                disabled={actionInProgress === report.id}
                              >
                                <FiEye className="mr-2 text-blue-400" />
                                İncelendi
                              </button>
                            </li>
                            <li>
                              <button 
                                className="flex items-center px-3 py-2 hover:bg-gray-800/70 rounded-md" 
                                onClick={() => updateReportStatus(report.id, 'IGNORED')}
                                disabled={actionInProgress === report.id}
                              >
                                <FiX className="mr-2 text-gray-400" />
                                Yok sayıldı
                              </button>
                            </li>
                            <li>
                              <button 
                                className="flex items-center px-3 py-2 hover:bg-gray-800/70 rounded-md" 
                                onClick={() => updateReportStatus(report.id, 'RESOLVED')}
                                disabled={actionInProgress === report.id}
                              >
                                <FiCheck className="mr-2 text-green-400" />
                                Çözüldü
                              </button>
                            </li>
                            <li className="border-t border-gray-700 my-1"></li>
                            <li>
                              <button 
                                className="flex items-center px-3 py-2 hover:bg-gray-800/70 rounded-md" 
                                onClick={() => suspendUser(report.project.user.id)}
                                disabled={actionInProgress === report.project.user.id}
                              >
                                <FiUserX className="mr-2 text-red-400" />
                                Kullanıcıyı Askıya Al
                              </button>
                            </li>
                            <li>
                              <button 
                                className="flex items-center px-3 py-2 hover:bg-gray-800/70 rounded-md text-red-300" 
                                onClick={() => deleteReport(report.id)}
                                disabled={actionInProgress === report.id}
                              >
                                <FiTrash2 className="mr-2" />
                                Raporu Sil
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-800/30 rounded-lg border border-gray-700 p-4">
          <div className="text-sm text-gray-400">
            Toplam {pagination.totalReports} rapor
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={pagination.currentPage === 1 || loading}
              className="px-3 py-1 border border-gray-700 bg-gray-800 hover:bg-gray-700 rounded-md text-sm text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Önceki sayfa"
            >
              Önceki
            </button>
            <span className="px-3 py-1 text-sm text-gray-300 bg-gray-800/50 border border-gray-700 rounded-md">
              Sayfa {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button 
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={pagination.currentPage === pagination.totalPages || loading}
              className="px-3 py-1 border border-gray-700 bg-gray-800 hover:bg-gray-700 rounded-md text-sm text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Sonraki sayfa"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 