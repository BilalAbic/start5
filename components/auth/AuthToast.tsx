'use client';

import { useEffect, useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';

type ToastType = 'success' | 'error';

interface AuthToastProps {
  type: ToastType;
  message: string;
  duration?: number; // milisaniye cinsinden
  onClose?: () => void;
}

export default function AuthToast({ 
  type, 
  message, 
  duration = 3000, 
  onClose 
}: AuthToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  if (!isVisible) return null;
  
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full shadow-lg rounded-lg overflow-hidden">
      <div 
        className={`p-4 flex items-center justify-between ${
          type === 'success' 
            ? 'bg-green-500/20 border border-green-500 text-green-400' 
            : 'bg-red-500/20 border border-red-500 text-red-400'
        }`}
      >
        <div className="flex items-center">
          {type === 'success' ? (
            <FiCheckCircle className="flex-shrink-0 h-5 w-5 mr-2" />
          ) : (
            <FiAlertCircle className="flex-shrink-0 h-5 w-5 mr-2" />
          )}
          <p className="text-sm">{message}</p>
        </div>
        <button 
          onClick={handleClose}
          className="ml-4 flex-shrink-0 focus:outline-none"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
} 