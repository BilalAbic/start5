import { FiUsers, FiFolder, FiEye, FiClock, FiAlertTriangle } from 'react-icons/fi';

// Geçici statik veriler (Prisma entegrasyonu daha sonra yapılacak)
const MOCK_STATS = {
  totalUsers: 128,
  totalProjects: 342,
  activePublicProjects: 215,
  recentProjects: 24
};

export default function AdminDashboardPage() {
  const stats = MOCK_STATS;
  
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Platform genel görünümü ve istatistikler</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl border border-gray-800 ${card.color}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{card.title}</p>
                <h3 className="text-3xl font-bold text-white">{card.value}</h3>
              </div>
              <div>{card.icon}</div>
            </div>
          </div>
        ))}
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