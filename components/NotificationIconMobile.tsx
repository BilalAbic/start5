import { useState, useEffect } from 'react';
import { BellIcon } from 'lucide-react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationIconMobile() {
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
          className={`flex flex-col items-center p-3 flex-1 ${
            isOpen ? 'text-blue-400' : 'text-gray-400'
          }`}
          aria-label="Bildirimler"
        >
          <div className="relative">
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-xs mt-1">Bildirimler</span>
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
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