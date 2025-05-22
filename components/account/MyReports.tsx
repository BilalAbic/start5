'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FiAlertTriangle, FiFilter, FiRefreshCw, FiInbox, FiExternalLink, FiInfo } from 'react-icons/fi';

// Types
type Report = {
  id: string;
  projectId: string;
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
      profileImage: string | null;
    };
  };
};

type Filter = {
  status: string | null;
  reason: string | null;
};

export default function MyReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filter>({ status: null, reason: null });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReports: 0,
  });

  // Fetch reports based on filters and pagination
  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = `/api/user/reports?page=${pagination.currentPage}`;
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.reason) url += `&reason=${filters.reason}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Raporlar yüklenirken bir hata oluştu');
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
      toast.error(error instanceof Error ? error.message : 'Raporlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
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
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
          <div className="flex items-center justify-between">
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
      <FiInbox className="h-12 w-12 text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-300 mb-2">Henüz bir rapor göndermediniz</h3>
      <p className="text-gray-400 mb-4">
        Uygunsuz veya politikalarımıza aykırı projeleri rapor etmek için projeler sayfasını ziyaret edin.
      </p>
      <Link 
        href="/explore"
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-medium transition-colors inline-flex items-center"
      >
        <FiExternalLink className="mr-2" />
        Projeleri Keşfet
      </Link>
    </div>
  );

  // Empty state for filtered reports
  const renderFilteredEmptyState = () => (
    <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-8 text-center">
      <FiAlertTriangle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-300 mb-2">Rapor bulunamadı</h3>
      <p className="text-gray-400 mb-4">Seçili filtrelere uygun rapor bulunmuyor.</p>
      <button 
        onClick={resetFilters}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-medium transition-colors inline-flex items-center"
      >
        <FiFilter className="mr-2" />
        Filtreleri Temizle
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <FiAlertTriangle className="mr-2 text-indigo-400" />
          Rapor Sonuçlarım
        </h1>
        <button 
          onClick={fetchReports} 
          className="inline-flex items-center px-3 py-2 border border-gray-700 rounded-md bg-gray-800 hover:bg-gray-700 text-sm font-medium text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto justify-center"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <option value="INAPPROPRIATE">Uygunsuz İçerik</option>
              <option value="COPYRIGHT">Telif Hakkı İhlali</option>
              <option value="OTHER">Diğer</option>
            </select>
          </div>
          
          {(filters.status || filters.reason) && (
            <div className="self-end mb-[2px]">
              <button 
                onClick={resetFilters}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-gray-200 transition-colors w-full"
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
        filters.status || filters.reason ? renderFilteredEmptyState() : renderEmptyState()
      ) : (
        <div className="space-y-4">
          {/* Cards for mobile view */}
          <div className="block sm:hidden">
            {reports.map((report) => (
              <div key={report.id} className="bg-gray-800/30 border border-gray-700 rounded-lg mb-4 overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-200">
                        <Link href={`/projects/${report.project.id}`} className="hover:text-indigo-400 transition-colors">
                          {report.project.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-400">
                        <Link href={`/u/${report.project.user.username}`} className="hover:text-indigo-400 transition-colors">
                          @{report.project.user.username}
                        </Link>
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(report.status)}`}>
                      {translateStatus(report.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Sebep:</span>
                      <span className="ml-2 text-gray-200">{translateReason(report.reason)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Tarih:</span>
                      <span className="ml-2 text-gray-200">
                        {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: tr })}
                      </span>
                    </div>
                  </div>
                  
                  {report.details && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-sm text-gray-400 line-clamp-2">{report.details}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Table for desktop view */}
          <div className="hidden sm:block bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800/50">
                  <tr>
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
                        <div className="text-sm text-gray-200">
                          <Link href={`/projects/${report.project.id}`} className="hover:text-indigo-400 transition-colors">
                            {report.project.title}
                          </Link>
                        </div>
                        <div className="text-xs text-gray-400">
                          <Link href={`/u/${report.project.user.username}`} className="hover:text-indigo-400 transition-colors">
                            @{report.project.user.username}
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
                        <Link 
                          href={`/projects/${report.project.id}`}
                          className="inline-flex items-center px-2 py-1 border border-gray-700 rounded-md bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-200 transition-colors"
                        >
                          <FiExternalLink className="mr-1" />
                          Görüntüle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
      
      {/* Status info */}
      <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center mb-3">
          <FiInfo className="mr-2 text-gray-400" />
          <h2 className="font-medium text-gray-200">Rapor Durumları Hakkında</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-400 mr-2"></span>
            <span className="text-gray-400">Beklemede:</span>
            <span className="ml-2 text-gray-200">Raporunuz henüz inceleme aşamasındadır.</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
            <span className="text-gray-400">İncelendi:</span>
            <span className="ml-2 text-gray-200">Raporunuz incelenmiş ve değerlendirme altındadır.</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
            <span className="text-gray-400">Yok sayıldı:</span>
            <span className="ml-2 text-gray-200">Raporunuz politikalarımıza göre uygun bulunmamıştır.</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-green-400 mr-2"></span>
            <span className="text-gray-400">Çözüldü:</span>
            <span className="ml-2 text-gray-200">Raporunuz onaylanmış ve gerekli işlemler yapılmıştır.</span>
          </div>
        </div>
      </div>
    </div>
  );
} 