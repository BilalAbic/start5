'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { FiAlertTriangle, FiX, FiLoader } from 'react-icons/fi';

type ReportReason = 'SPAM' | 'INAPPROPRIATE' | 'COPYRIGHT' | 'OTHER';

interface ReportProjectButtonProps {
  projectId: string;
  className?: string;
}

export default function ReportProjectButton({ projectId, className = '' }: ReportProjectButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('SPAM');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle modal visibility animation
  useEffect(() => {
    if (isModalOpen) {
      // Slight delay for animation to work
      setTimeout(() => {
        setIsVisible(true);
      }, 10);
    } else {
      setIsVisible(false);
    }
  }, [isModalOpen]);

  const handleCloseModal = () => {
    setIsVisible(false);
    // Wait for animation to finish before fully closing
    setTimeout(() => {
      setIsModalOpen(false);
      setReason('SPAM');
      setDetails('');
      setError(null);
    }, 200);
  };

  // Handle Escape key press and click outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen && !isSubmitting) {
        handleCloseModal();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && isModalOpen && !isSubmitting) {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          reason,
          details: details.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Bir hata oluştu.');
      }

      toast.success('Raporunuz başarıyla gönderildi. İncelemeye alınacaktır.');
      handleCloseModal();
    } catch (error) {
      console.error('Error reporting project:', error);
      setError(error instanceof Error ? error.message : 'Proje raporlanırken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonOptions = [
    { value: 'SPAM', label: 'Spam / Yanıltıcı İçerik' },
    { value: 'INAPPROPRIATE', label: 'Uygunsuz İçerik' },
    { value: 'COPYRIGHT', label: 'Telif Hakkı İhlali' },
    { value: 'OTHER', label: 'Diğer' },
  ];

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`text-red-500 hover:text-red-600 font-medium flex items-center gap-1 ${className}`}
        aria-label="Projeyi rapor et"
      >
        <FiAlertTriangle className="h-5 w-5" />
        <span>Rapor Et</span>
      </button>

      {isModalOpen && (
        <div 
          className={`fixed inset-0 bg-black transition-opacity duration-200 ease-in-out flex items-center justify-center z-50 p-4 backdrop-blur-sm ${
            isVisible ? 'bg-opacity-70 opacity-100' : 'bg-opacity-0 opacity-0'
          }`}
        >
          <div 
            ref={modalRef} 
            className={`bg-gray-800 border border-gray-700 rounded-xl shadow-xl w-full max-w-md mx-auto transition-transform duration-200 ease-in-out ${
              isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-700 p-4">
              <h3 className="text-xl font-bold text-white">Projeyi Raporla</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
                aria-label="Kapat"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5">
              <p className="text-gray-300 mb-6">
                Bu projeyi uygunsuz veya politikalarımıza aykırı olduğu için mi raporlamak istiyorsunuz?
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-400 rounded-md flex items-start">
                  <FiAlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-3">
                    Raporlama Sebebi
                  </label>
                  
                  <div className="space-y-2 sm:space-y-3">
                    {reasonOptions.map((option) => (
                      <label 
                        key={option.value} 
                        className="flex items-center p-2 sm:p-3 rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={option.value}
                          checked={reason === option.value}
                          onChange={() => setReason(option.value as ReportReason)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700"
                        />
                        <span className="ml-3 text-gray-200 text-sm sm:text-base">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="details" className="block text-sm font-medium text-gray-200 mb-2">
                    Detaylar <span className="text-gray-400">(İsteğe Bağlı)</span>
                  </label>
                  <textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Lütfen neden bu projeyi raporladığınıza dair ek bilgi verin..."
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 sm:gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-3 sm:px-4 py-2 bg-gray-700 text-gray-200 hover:bg-gray-600 rounded-lg transition-colors text-sm sm:text-base"
                    disabled={isSubmitting}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-60 flex items-center justify-center min-w-[80px] sm:min-w-[100px] text-sm sm:text-base"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <FiLoader className="animate-spin mr-2" />
                        <span>Gönderiliyor</span>
                      </>
                    ) : (
                      'Rapor Et'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 