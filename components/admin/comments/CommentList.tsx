"use client";
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon as SearchIcon,
  FunnelIcon as FilterIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string | null;
  username: string | null;
}

interface Project {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
  project: Project;
  // reports?: any[]; // Raporlar için alan eklenebilir
}

interface ApiResponse {
  comments: Comment[];
  totalPages: number;
  currentPage: number;
  totalComments: number;
}

const ITEMS_PER_PAGE = 10;

export default function CommentList() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ userId: '', projectId: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchComments = useCallback(async (page = 1, currentFilters = filters, currentSortBy = sortBy, currentSortOrder = sortOrder) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
      });
      if (currentFilters.userId) params.append('userId', currentFilters.userId);
      if (currentFilters.projectId) params.append('projectId', currentFilters.projectId);
      // Arama terimi backend'e gönderilecekse burada eklenebilir
      // if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/comments?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Yorumlar yüklenirken bir hata oluştu.');
      }
      const data: ApiResponse = await response.json();
      setComments(data.comments);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]); // searchTerm'ü bağımlılıklardan çıkardık, çünkü filtreleme client-side yapılıyor

  useEffect(() => {
    fetchComments(currentPage, filters, sortBy, sortOrder);
  }, [fetchComments, currentPage, filters, sortBy, sortOrder]);

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Yorum silinirken bir hata oluştu.');
      }
      alert('Yorum başarıyla silindi.');
      // Yorumları yeniden yükle veya state'ten çıkar
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
      // Eğer son sayfadaki tek yorum silindiyse ve sayfa 1 değilse bir önceki sayfaya git
      if (comments.length === 1 && currentPage > 1) {
        setCurrentPage(prevPage => prevPage - 1);
      } else {
        fetchComments(currentPage, filters, sortBy, sortOrder); // Total comments vs. güncellemek için
      }
    } catch (err: any) {
      setError(err.message);
      alert(`Hata: ${err.message}`);
    }
  };

  const toggleExpandComment = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const applyFilters = () => {
    setCurrentPage(1); // Filtreler değiştiğinde ilk sayfaya dön
    fetchComments(1, filters, sortBy, sortOrder);
  };

  const clearFilters = () => {
    setFilters({ userId: '', projectId: '' });
    setSearchTerm('');
    setCurrentPage(1);
    fetchComments(1, { userId: '', projectId: '' }, sortBy, sortOrder);
  };

  const handleSort = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      setSortOrder(prevSortOrder => prevSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Sıralama değiştiğinde ilk sayfaya dön
    // fetchComments zaten sortBy veya sortOrder değiştiğinde tetiklenecek
  };

  // Client-side arama (Backend arama için fetchComments'e entegre edilebilir)
  const filteredComments = comments.filter(comment =>
    comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && comments.length === 0) {
    return <p className="text-center text-gray-400 py-10">Yorumlar yükleniyor...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 py-10">Hata: {error}</p>;
  }

  return (
    <div className="bg-gray-800 shadow-xl rounded-lg p-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Yorumlarda, kullanıcıda veya projede ara..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border border-gray-600"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center"
        >
          <FilterIcon className="h-5 w-5 mr-2" /> Filtreler {showFilters ? <ChevronUpIcon className="h-4 w-4 ml-1"/> : <ChevronDownIcon className="h-4 w-4 ml-1"/>}
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow">
            <label htmlFor="userIdFilter" className="block text-sm font-medium text-gray-300 mb-1">Kullanıcı ID</label>
            <input
              type="text"
              name="userId"
              id="userIdFilter"
              value={filters.userId}
              onChange={handleFilterChange}
              placeholder="Kullanıcı ID'si ile filtrele"
              className="w-full p-2 rounded-lg bg-gray-600 text-white border border-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex-grow">
            <label htmlFor="projectIdFilter" className="block text-sm font-medium text-gray-300 mb-1">Proje ID</label>
            <input
              type="text"
              name="projectId"
              id="projectIdFilter"
              value={filters.projectId}
              onChange={handleFilterChange}
              placeholder="Proje ID'si ile filtrele"
              className="w-full p-2 rounded-lg bg-gray-600 text-white border border-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold"
          >
            Filtrele
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white font-semibold"
          >
            Temizle
          </button>
        </div>
      )}

      {filteredComments.length === 0 && !loading ? (
        <div className="text-center py-10">
          <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="mt-2 text-xl font-semibold text-white">Yorum Bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-400">
            Filtrelerinizi değiştirmeyi veya yeni bir arama yapmayı deneyin.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-750">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('content')}>
                  Yorum İçeriği {sortBy === 'content' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('project')}>
                  Proje {sortBy === 'project' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('user')}>
                  Kullanıcı {sortBy === 'user' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>
                  Tarih {sortBy === 'createdAt' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rapor Durumu
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredComments.map((comment) => (
                <tr key={comment.id} className="hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 max-w-md">
                    <div
                        className={`overflow-hidden ${expandedComments.has(comment.id) ? '' : 'max-h-20'}`}
                        title={comment.content}
                    >
                        {comment.content}
                    </div>
                    {comment.content.length > 100 && (
                      <button
                        onClick={() => toggleExpandComment(comment.id)}
                        className="text-indigo-400 hover:text-indigo-300 text-xs mt-1 flex items-center"
                      >
                        {expandedComments.has(comment.id) ? 'Daralt' : 'Genişlet'}
                        {expandedComments.has(comment.id) ? <ChevronUpIcon className="h-4 w-4 ml-1"/> : <ChevronDownIcon className="h-4 w-4 ml-1"/>}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <Link href={`/projects/${comment.project.id}`} className="hover:text-indigo-400 transition-colors duration-150">
                      {comment.project.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {comment.user.username ? (
                        <Link href={`/u/${comment.user.username}`} className="hover:text-indigo-400 transition-colors duration-150">
                            {comment.user.name || comment.user.username} (@{comment.user.username})
                        </Link>
                    ) : (
                        <span>{comment.user.name || 'Bilinmeyen Kullanıcı'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(comment.createdAt).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {/* TODO: Rapor durumu buraya gelecek. Örn: comment.reports && comment.reports.length > 0 ? `${comment.reports.length} Rapor` : '-' */}
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-700 text-green-100">
                      Aktif {/* Veya Rapor Durumuna Göre Badge */}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-500 hover:text-red-400 transition-colors duration-150 p-1 rounded-md hover:bg-gray-700"
                      title="Yorumu Sil"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    {/* İsteğe bağlı butonlar */}
                    {/* <button className="text-yellow-500 hover:text-yellow-400 ml-2"><PencilIcon className="h-5 w-5" /></button> */}
                    {/* <button className="text-green-500 hover:text-green-400 ml-2"><CheckCircleIcon className="h-5 w-5" /></button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-white transition-colors duration-150"
          >
            Önceki
          </button>
          <span className="text-gray-400">
            Sayfa {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-white transition-colors duration-150"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
} 