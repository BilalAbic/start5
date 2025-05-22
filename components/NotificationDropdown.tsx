import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  FileWarning, 
  FileCheck, 
  Bell, 
  BellOff,
  CheckSquare,
  Check,
  X
} from 'lucide-react';
import { useNotifications, Notification } from '@/lib/hooks/useNotifications';

interface NotificationDropdownProps {
  onClose: () => void;
  isSidebar?: boolean;
}

const typeIcons = {
  report: <FileWarning className="h-5 w-5 text-yellow-500" />,
  project: <FileCheck className="h-5 w-5 text-green-500" />,
  general: <Bell className="h-5 w-5 text-blue-500" />,
};

export default function NotificationDropdown({ onClose, isSidebar = false }: NotificationDropdownProps) {
  const router = useRouter();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Add escape key listener
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (notification.status === 'unread') {
      await markAsRead(notification.id);
    }
    
    // Navigate to link if provided
    if (notification.link) {
      router.push(notification.link);
      onClose();
    }
  };

  // Handle mark as read individually
  const handleMarkAsRead = async (event: React.MouseEvent, notificationId: string) => {
    event.stopPropagation();
    await markAsRead(notificationId);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    // If today, show time
    if (date.toDateString() === today.toDateString()) {
      return format(date, "'Bugün' HH:mm", { locale: tr });
    }
    
    // If yesterday, show "Dün"
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return format(date, "'Dün' HH:mm", { locale: tr });
    }
    
    // Otherwise show date
    return format(date, 'dd MMM yyyy', { locale: tr });
  };

  if (isSidebar) {
    return (
      <div
        ref={dropdownRef}
        className="fixed right-0 top-0 h-screen w-80 md:w-96 z-50 bg-gray-800 border-l border-gray-700 shadow-xl transform transition-all duration-300 ease-in-out"
        style={{ animation: 'slideInFromRight 0.3s ease-out' }}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-medium text-white text-lg">Bildirimler</h3>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && notifications.some(n => n.status === 'unread') && (
                <button
                  onClick={markAllAsRead}
                  className="p-2 text-sm text-blue-400 hover:bg-gray-700 rounded-md flex items-center"
                  title="Tümünü okundu işaretle"
                >
                  <CheckSquare className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:bg-gray-700 rounded-md"
                title="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <BellOff className="h-16 w-16 text-gray-500 mb-4" />
                <p className="text-gray-400 font-medium mb-1">Bildirim Yok</p>
                <p className="text-gray-500 text-sm">Henüz bildiriminiz bulunmuyor.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-700">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      p-4 hover:bg-gray-700/50 cursor-pointer transition-colors
                      ${notification.status === 'unread' ? 'bg-gray-700/30' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {typeIcons[notification.type as keyof typeof typeIcons] || 
                         typeIcons.general}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${
                          notification.status === 'unread' 
                            ? 'font-medium text-white' 
                            : 'text-gray-300'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      {notification.status === 'unread' && (
                        <button 
                          onClick={(e) => handleMarkAsRead(e, notification.id)}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-400 hover:bg-gray-600 rounded-full transition-colors"
                          title="Okundu olarak işaretle"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Original dropdown for navbar
  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 className="font-medium text-slate-900 dark:text-white">Bildirimler</h3>
        {notifications.length > 0 && (
          <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full">
            {notifications.filter(n => n.status === 'unread').length} okunmamış
          </span>
        )}
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center p-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-700 dark:border-slate-300"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <BellOff className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-2" />
            <p className="text-slate-500 dark:text-slate-400">Henüz bildiriminiz bulunmuyor.</p>
          </div>
        ) : (
          <>
            {notifications.some(n => n.status === 'unread') && (
              <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                <button 
                  onClick={markAllAsRead}
                  className="w-full text-sm text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md p-2 flex items-center justify-center transition-colors"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Tümünü okundu olarak işaretle
                </button>
              </div>
            )}
            <ul>
              {notifications.map((notification) => (
                <li 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    p-3 border-b border-slate-100 dark:border-slate-700 last:border-0 
                    hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors
                    ${notification.status === 'unread' ? 'bg-blue-50/50 dark:bg-slate-700/30' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {typeIcons[notification.type as keyof typeof typeIcons] || 
                       typeIcons.general}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${
                        notification.status === 'unread' 
                          ? 'font-medium text-slate-900 dark:text-white' 
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    {notification.status === 'unread' && (
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
} 