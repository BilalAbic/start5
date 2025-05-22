import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

// Types
type ProjectStats = {
  statusStats: Array<{
    status: string;
    count: number;
  }>;
  visibilityStats: {
    public: number;
    private: number;
  };
  monthlyTrends: Array<{
    month: string;
    count: number;
  }>;
  userProjectRatio: {
    totalUsers: number;
    totalProjects: number;
    avgProjectsPerUser: number;
  };
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const STATUS_LABELS: Record<string, string> = {
  'GELISTIRILIYOR': 'Geliştiriliyor',
  'YAYINDA': 'Yayında',
  'ARSIVDE': 'Arşivde'
};

const STATUS_COLORS: Record<string, string> = {
  'GELISTIRILIYOR': '#FFBB28',
  'YAYINDA': '#00C49F',
  'ARSIVDE': '#777777'
};

const ProjectCharts = () => {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching project stats data...');
      const response = await fetch('/api/admin/dashboard/project-stats', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'İstatistikler alınırken bir sorun oluştu');
      }

      const data = await response.json();
      console.log('Stats data received:', data);
      
      // Validate the data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Geçersiz veri formatı');
      }
      
      // Check for the required fields
      if (!Array.isArray(data.statusStats) || 
          !data.visibilityStats || 
          !Array.isArray(data.monthlyTrends) ||
          !data.userProjectRatio) {
        console.error('Missing required fields in data', data);
        throw new Error('Eksik veri alanları');
      }
      
      setStats(data);
    } catch (err: any) {
      console.error('İstatistikler alınırken hata:', err);
      setError(err.message || 'İstatistikler yüklenirken bir hata oluştu');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format month names
  const formatMonthLabel = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Geçersiz Tarih';
      }
      return date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Hata';
    }
  };

  // Create data for visibility pie chart
  const createVisibilityData = () => {
    if (!stats?.visibilityStats) return [];
    return [
      { name: 'Public', value: stats.visibilityStats.public || 0 },
      { name: 'Private', value: stats.visibilityStats.private || 0 }
    ];
  };

  // Create data for status pie chart
  const createStatusData = () => {
    if (!stats?.statusStats) return [];
    return stats.statusStats.map(stat => ({
      name: STATUS_LABELS[stat.status] || stat.status,
      value: stat.count || 0,
      color: STATUS_COLORS[stat.status] || '#777777'
    }));
  };

  // Format monthly trends data
  const formatMonthlyData = () => {
    if (!stats?.monthlyTrends) return [];
    return stats.monthlyTrends.map(item => ({
      name: formatMonthLabel(item.month),
      value: Number(item.count) || 0
    }));
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent) {
      return null;
    }

    try {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text 
          x={x} 
          y={y} 
          fill="white" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          className="text-xs"
        >
          {`${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`}
        </text>
      );
    } catch (e) {
      console.error('Label rendering error:', e);
      return null;
    }
  };

  // Function to handle retry
  const handleRetry = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FiRefreshCw className="animate-spin text-indigo-500 mr-2" />
        <span className="text-gray-400">Grafik verileri yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 rounded-xl border border-red-800">
        <div className="flex items-center mb-4">
          <FiAlertCircle className="text-red-400 mr-2" />
          <span className="text-white">İstatistikler alınırken bir hata oluştu: {error}</span>
        </div>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-red-900/40 text-red-400 rounded hover:bg-red-900/60 transition-colors flex items-center mx-auto"
        >
          <FiRefreshCw className="mr-2" /> Tekrar Dene
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 bg-gray-800 rounded-xl text-center">
        <span className="text-gray-400">Veri bulunamadı</span>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-gray-700 text-gray-400 rounded hover:bg-gray-600 transition-colors flex items-center mx-auto mt-4"
        >
          <FiRefreshCw className="mr-2" /> Tekrar Dene
        </button>
      </div>
    );
  }

  // Create chart data
  let statusData = [];
  let visibilityData = [];
  let monthlyData = [];
  
  try {
    statusData = createStatusData();
    visibilityData = createVisibilityData();
    monthlyData = formatMonthlyData();
  } catch (e) {
    console.error('Error preparing chart data:', e);
  }
  
  if (statusData.length === 0 && visibilityData.length === 0 && monthlyData.length === 0) {
    return (
      <div className="p-6 bg-gray-800 rounded-xl text-center">
        <span className="text-gray-400">Grafik için yeterli veri bulunamadı</span>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-gray-700 text-gray-400 rounded hover:bg-gray-600 transition-colors flex items-center mx-auto mt-4"
        >
          <FiRefreshCw className="mr-2" /> Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Project Status Distribution */}
      {statusData.length > 0 && (
        <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
          <h3 className="text-lg font-medium text-white mb-4">Proje Durumlarına Göre Dağılım</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} proje`, 'Sayı']}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Public vs Private Projects */}
      {visibilityData.length > 0 && (
        <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
          <h3 className="text-lg font-medium text-white mb-4">Görünürlük Dağılımı</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visibilityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#4ade80" /> {/* Public */}
                  <Cell fill="#6366f1" /> {/* Private */}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} proje`, 'Sayı']}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monthly Trends */}
      {monthlyData.length > 0 && (
        <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl lg:col-span-2">
          <h3 className="text-lg font-medium text-white mb-4">Aylara Göre Proje Sayıları</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                  formatter={(value: any) => [`${value} proje`, 'Sayı']}
                />
                <Bar dataKey="value" name="Proje Sayısı" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl lg:col-span-2">
        <h3 className="text-lg font-medium text-white mb-4">Önemli Metrikler</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg text-center">
            <p className="text-gray-400 text-sm mb-1">Kullanıcı Başına Proje</p>
            <p className="text-2xl font-bold text-white">
              {(stats.userProjectRatio?.avgProjectsPerUser || 0).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg text-center">
            <p className="text-gray-400 text-sm mb-1">Toplam Kullanıcı</p>
            <p className="text-2xl font-bold text-white">
              {stats.userProjectRatio?.totalUsers || 0}
            </p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg text-center">
            <p className="text-gray-400 text-sm mb-1">Toplam Proje</p>
            <p className="text-2xl font-bold text-white">
              {stats.userProjectRatio?.totalProjects || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 flex justify-end">
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-indigo-900/40 text-indigo-400 rounded hover:bg-indigo-900/60 transition-colors flex items-center"
        >
          <FiRefreshCw className="mr-2" /> Verileri Yenile
        </button>
      </div>
    </div>
  );
};

export default ProjectCharts; 