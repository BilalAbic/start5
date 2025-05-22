import { useState, useEffect } from 'react';
import { BellIcon } from 'lucide-react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationIconSidebar() {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when dropdown is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center p-2 w-full text-sm font-medium rounded-md transition-colors text-gray-400 hover:text-white"
          aria-label="Bildirimler"
          title="Bildirimler"
        >
          <span className="relative mr-2">
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </span>
          <span>Bildirimler</span>
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:bg-opacity-30" 
          style={{ animation: 'fadeIn 0.2s ease-out' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Notification Dropdown */}
      {isOpen && (
        <NotificationDropdown 
          onClose={() => setIsOpen(false)}
          isSidebar={true}
        />
      )}
    </>
  );
} 