'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiUserX, FiUserCheck, FiLoader } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

// Kullanıcı tipi tanımlaması
type User = {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  status?: 'active' | 'suspended';
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  // API'den kullanıcıları getir - useCallback ile tanımlayarak gereksiz yeniden oluşturmaları önlüyoruz
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
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
          throw new Error(errorData.error || 'Kullanıcılar alınırken bir sorun oluştu');
        } catch (jsonError) {
          throw new Error('Kullanıcılar alınırken bir sorun oluştu');
        }
      }
      
      const data = await response.json();
      
      // API'den gelen kullanıcı verileri için status alanı olmayabilir, varsayılan olarak active ekleyelim
      const usersWithStatus = data.map((user: User) => ({
        ...user,
        status: user.status || 'active'
      }));
      
      setUsers(usersWithStatus);
      setError(null);
    } catch (err: any) {
      console.error('Kullanıcılar alınırken hata:', err);
      setError(err.message || 'Kullanıcıları yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
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
          router.push('/login?redirect=/admin/users');
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
  
  // isAdmin değiştiğinde veya authChecked true olduğunda kullanıcıları getir
  useEffect(() => {
    // Sadece admin ise ve yetkilendirme kontrolü tamamlandıysa kullanıcıları getir
    if (isAdmin === true && authChecked) {
      fetchUsers();
    }
  }, [isAdmin, authChecked, fetchUsers]);
  
  // Kullanıcı listesini manuel olarak yenile
  const refreshUsers = () => {
    fetchUsers();
  };
  
  // Kullanıcı arama fonksiyonu
  const filteredUsers = users.filter((user) => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Kullanıcı silme işlemi
  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setActionType('delete');
      setShowConfirmDialog(true);
    }
  };
  
  // Kullanıcı rolü değiştirme işlemi
  const handleRoleChange = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setActionType('role');
      setShowConfirmDialog(true);
    }
  };
  
  // Kullanıcı hesap durumu değiştirme
  const handleStatusChange = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setActionType('status');
      setShowConfirmDialog(true);
    }
  };
  
  // İşlemi onayla
  const confirmAction = async () => {
    if (!selectedUser) return;
    
    setProcessing(true);
    
    try {
      if (actionType === 'delete') {
        // API üzerinden silme işlemi
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: selectedUser.id,
            action: 'deleteUser'
          }),
        });
        
        if (!response.ok) {
          // Hata durumuna göre özel mesajlar
          if (response.status === 401 || response.status === 403) {
            throw new Error('Bu işlemi yapmak için yetkiniz bulunmamaktadır.');
          }
          
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Kullanıcı silinirken bir hata oluştu');
        }
        
        // UI'ı güncelle - kullanıcıyı listeden kaldır
        setUsers(users.filter((user) => user.id !== selectedUser.id));
      } else if (actionType === 'role') {
        const newRole = selectedUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
        
        // API üzerinden rol değiştirme
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: selectedUser.id,
            role: newRole,
            action: 'changeRole'
          }),
        });
        
        if (!response.ok) {
          // Hata durumuna göre özel mesajlar
          if (response.status === 401 || response.status === 403) {
            throw new Error('Bu işlemi yapmak için yetkiniz bulunmamaktadır.');
          }
          
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Rol güncellenirken bir hata oluştu');
        }
        
        const updatedUser = await response.json();
        
        // UI'ı güncelle
        setUsers(users.map((user) => {
          if (user.id === selectedUser.id) {
            return { 
              ...updatedUser
            };
          }
          return user;
        }));
      } else if (actionType === 'status') {
        // Kullanıcının durumunu değiştir
        const newStatus = selectedUser.status === 'active' ? 'suspended' : 'active';
        
        // API üzerinden durum değiştirme
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: selectedUser.id,
            status: newStatus,
            action: 'changeStatus'
          }),
        });
        
        if (!response.ok) {
          // Hata durumuna göre özel mesajlar
          if (response.status === 401 || response.status === 403) {
            throw new Error('Bu işlemi yapmak için yetkiniz bulunmamaktadır.');
          }
          
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Kullanıcı durumu güncellenirken bir hata oluştu');
        }
        
        const updatedUser = await response.json();
        
        // UI'ı güncelle
        setUsers(users.map((user) => {
          if (user.id === selectedUser.id) {
            return { 
              ...updatedUser
            };
          }
          return user;
        }));
      }
    } catch (err: any) {
      console.error('İşlem yapılırken hata:', err);
      setError(err.message || 'İşlem yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setProcessing(false);
      setShowConfirmDialog(false);
      setSelectedUser(null);
      setActionType('');
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h1>
        
        <div className="flex space-x-2">
          {isAdmin === true && (
            <button
              onClick={refreshUsers}
              className="px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-600"
              disabled={loading}
            >
              {loading ? <FiLoader className="animate-spin" /> : 'Yenile'}
            </button>
          )}
          
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>
      
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
      
      {/* Yetki kontrolü */}
      {isAdmin === false && (
        <div className="bg-indigo-900/30 border border-indigo-800 text-indigo-300 px-4 py-8 rounded-lg mb-6 text-center">
          <h3 className="text-xl font-bold mb-2">Yetkisiz Erişim</h3>
          <p>Bu sayfaya erişim için admin yetkileri gereklidir. Lütfen admin hesabı ile giriş yapın.</p>
          <div className="mt-4">
            <a href="/login?redirect=/admin/users" className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg">
              Giriş Sayfasına Git
            </a>
          </div>
        </div>
      )}
      
      {/* Yükleniyor göstergesi */}
      {loading && isAdmin !== false ? (
        <div className="flex items-center justify-center p-12">
          <FiLoader className="h-8 w-8 text-indigo-500 animate-spin" />
          <span className="ml-2 text-gray-300">Kullanıcılar yükleniyor...</span>
        </div>
      ) : (
        /* Kullanıcı tablosu - sadece admin ise ve yükleniyor değilse göster */
        isAdmin === true && !loading && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kayıt Tarihi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-800/30">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">{user.id.substring(0, 6)}...</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' ? 'bg-indigo-900/60 text-indigo-300' : 'bg-gray-700 text-gray-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active' ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'
                          }`}>
                            {user.status === 'active' ? 'Aktif' : 'Askıya Alındı'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleRoleChange(user.id)}
                            className="text-indigo-400 hover:text-indigo-300"
                            title="Rol Değiştir"
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(user.id)}
                            className={`${user.status === 'active' ? 'text-amber-400 hover:text-amber-300' : 'text-green-400 hover:text-green-300'}`}
                            title={user.status === 'active' ? 'Askıya Al' : 'Aktifleştir'}
                          >
                            {user.status === 'active' ? <FiUserX className="h-5 w-5" /> : <FiUserCheck className="h-5 w-5" />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-500 hover:text-red-400"
                            title="Kullanıcıyı Sil"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                        {searchTerm ? 'Aramanızla eşleşen kullanıcı bulunamadı.' : 'Henüz hiç kullanıcı yok.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
      
      {/* Onay Dialog */}
      {showConfirmDialog && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              {actionType === 'delete' 
                ? 'Kullanıcıyı Sil' 
                : actionType === 'role' 
                  ? 'Kullanıcı Rolünü Değiştir'
                  : 'Kullanıcı Durumunu Değiştir'}
            </h3>
            <p className="text-gray-300 mb-6">
              {actionType === 'delete' 
                ? `${selectedUser.email} kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.` 
                : actionType === 'role' 
                  ? `${selectedUser.email} kullanıcısının rolünü "${selectedUser.role === 'ADMIN' ? 'USER' : 'ADMIN'}" olarak değiştirmek istediğinize emin misiniz?`
                  : `${selectedUser.email} kullanıcısının durumunu "${selectedUser.status === 'active' ? 'askıya alınmış' : 'aktif'}" olarak değiştirmek istediğinize emin misiniz?`}
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowConfirmDialog(false)} 
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
                disabled={processing}>
                İptal
              </button>
              <button 
                onClick={confirmAction} 
                disabled={processing}
                className={`px-4 py-2 rounded-lg ${
                  actionType === 'delete' 
                    ? 'bg-red-700 hover:bg-red-600 text-white' 
                    : 'bg-indigo-700 hover:bg-indigo-600 text-white'
                } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {processing ? (
                  <span className="flex items-center">
                    <FiLoader className="animate-spin mr-2" />
                    İşleniyor...
                  </span>
                ) : (
                  'Onayla'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 