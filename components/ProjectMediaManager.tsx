import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiTrash2, FiAlertCircle } from 'react-icons/fi';
import MediaUploader from './MediaUploader';
import { Media } from '@/types';

type ProjectMediaManagerProps = {
  projectId: string;
};

const ProjectMediaManager = ({ projectId }: ProjectMediaManagerProps) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});

  // Fetch project media
  useEffect(() => {
    const fetchMedia = async () => {
      setMediaError(null);
      try {
        const response = await fetch(`/api/projects/${projectId}/media`);
        
        if (!response.ok) {
          const errorData = await response.json();
          setMediaError(errorData.error || 'Bir hata oluştu');
          return [];
        }
        
        const data = await response.json();
        setMedia(data);
      } catch (error) {
        setMediaError(error instanceof Error ? error.message : 'Bir hata oluştu');
        return [];
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMedia();
  }, [projectId]);

  // Handle successful upload
  const handleUploadComplete = (uploadedMedia: Media[]) => {
    setMedia(prevMedia => [...uploadedMedia, ...prevMedia]);
  };

  // Delete media
  const deleteMedia = async (mediaId: string) => {
    setIsDeleting(prev => ({ ...prev, [mediaId]: true }));
    setMediaError(null);
    
    try {
      const response = await fetch(`/api/projects/${projectId}/media/${mediaId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setMediaError(errorData.error || 'Bir hata oluştu');
        return;
      }
      
      // Remove the deleted media from state
      setMedia(prevMedia => prevMedia.filter(item => item.id !== mediaId));
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setIsDeleting(prev => ({ ...prev, [mediaId]: false }));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Upload Images</h2>
        <MediaUploader 
          projectId={projectId} 
          onUploadComplete={handleUploadComplete}
        />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Project Images</h2>
        
        {mediaError && (
          <div className="p-3 mb-4 flex items-center text-sm text-red-700 bg-red-100 rounded-md">
            <FiAlertCircle className="mr-2 h-5 w-5" />
            {mediaError}
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading media...</p>
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-gray-500">No images uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <div key={item.id} className="relative border rounded-md p-2 group">
                <div className="h-40 relative">
                  <Image
                    src={item.url}
                    alt={item.altText || 'Project image'}
                    className="rounded-md object-contain"
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
                
                <div className="mt-2">
                  <p className="text-xs text-gray-500 truncate">
                    {item.altText || 'No description'}
                  </p>
                </div>
                
                <button
                  onClick={() => deleteMedia(item.id)}
                  disabled={isDeleting[item.id]}
                  className={`absolute top-3 right-3 p-1.5 rounded-full 
                    ${isDeleting[item.id] 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-white shadow-md opacity-0 group-hover:opacity-100 hover:bg-red-50'
                    } transition-opacity`}
                  type="button"
                >
                  <FiTrash2 className={`h-4 w-4 ${isDeleting[item.id] ? 'text-gray-500' : 'text-red-500'}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMediaManager; 