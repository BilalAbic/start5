"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiTrash2 } from 'react-icons/fi';

type DeleteProjectButtonProps = {
  projectId: string;
}

const DeleteProjectButton = ({ projectId }: DeleteProjectButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Redirect to dashboard after successful deletion
      router.push('/dashboard');
      router.refresh();
      
    } catch (error) {
      console.error('Error deleting project:', error);
      setIsDeleting(false);
      alert('Proje silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirmation(true)}
        className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md transition-colors w-full justify-center"
        disabled={isDeleting}
      >
        <FiTrash2 className="mr-2" />
        {isDeleting ? 'Siliniyor...' : 'Sil'}
      </button>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Projeyi Sil</h3>
            <p className="text-gray-300 mb-6">
              Bu projeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm proje verileri silinecektir.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md transition-colors flex items-center"
                disabled={isDeleting}
              >
                {isDeleting && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteProjectButton; 