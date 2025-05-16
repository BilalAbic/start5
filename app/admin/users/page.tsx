'use client';

import { useState } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiUserX, FiUserCheck } from 'react-icons/fi';

// Kullanıcı tipi tanımlaması
type User = {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  status: 'active' | 'suspended';
};

// Geçici statik kullanıcı verileri
const MOCK_USERS: User[] = [
  { 
    id: '1', 
    email: 'admin@start5.com', 
    role: 'ADMIN', 
    createdAt: '2023-05-20T10:00:00Z',
    status: 'active'
  },
  { 
    id: '2', 
    email: 'developer1@gmail.com', 
    role: 'USER', 
    createdAt: '2023-06-15T10:00:00Z',
    status: 'active'
  },
  { 
    id: '3', 
    email: 'developer2@gmail.com', 
    role: 'USER', 
    createdAt: '2023-07-22T10:00:00Z',
    status: 'active' 
  },
  { 
    id: '4', 
    email: 'designer1@outlook.com', 
    role: 'USER', 
    createdAt: '2023-09-10T10:00:00Z',
    status: 'suspended'
  },
  { 
    id: '5', 
    email: 'moderator@start5.com', 
    role: 'ADMIN', 
    createdAt: '2023-10-05T10:00:00Z',
    status: 'active'
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState('');
  
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
  const handleRoleChange = (userId: string) => {
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
  const confirmAction = () => {
    if (!selectedUser) return;
    
    if (actionType === 'delete') {
      setUsers(users.filter((user) => user.id !== selectedUser.id));
    } else if (actionType === 'role') {
      setUsers(users.map((user) => {
        if (user.id === selectedUser.id) {
          return { 
            ...user, 
            role: user.role === 'ADMIN' ? 'USER' : 'ADMIN'
          };
        }
        return user;
      }));
    } else if (actionType === 'status') {
      setUsers(users.map((user) => {
        if (user.id === selectedUser.id) {
          return { 
            ...user, 
            status: user.status === 'active' ? 'suspended' : 'active'
          };
        }
        return user;
      }));
    }
    setShowConfirmDialog(false);
    setSelectedUser(null);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h1>
        
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
      
      {/* Kullanıcı tablosu */}
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
              {filteredUsers.map((user) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
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