import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import { Media } from '@/types';

type MediaUploaderProps = {
  projectId: string;
  onUploadComplete: (media: Media[]) => void;
  maxFiles?: number;
};

const MediaUploader = ({ 
  projectId, 
  onUploadComplete,
  maxFiles = 10
}: MediaUploaderProps) => {
  const [files, setFiles] = useState<Array<{ file: File; preview: string; altText: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    // Check if adding these files would exceed the limit
    if (files.length + acceptedFiles.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} files. Please remove some files.`);
      return;
    }
    
    // Process each file
    const newFiles = acceptedFiles.map(file => {
      // Create a preview URL for the file
      const preview = URL.createObjectURL(file);
      
      return {
        file,
        preview,
        altText: ''
      };
    });
    
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, [files.length, maxFiles]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/gif': []
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });
  
  const removeFile = (index: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      // Release the object URL to avoid memory leaks
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
  
  const handleAltTextChange = (index: number, value: string) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles[index].altText = value;
      return newFiles;
    });
  };
  
  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    setError(null);
    setUploadError(null);
    
    try {
      // Convert files to base64
      const images = await Promise.all(
        files.map(async ({ file, altText }) => {
          return new Promise<{ base64: string; altText: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                base64: reader.result as string,
                altText
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );
      
      // Upload to server
      const response = await fetch(`/api/projects/${projectId}/media/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setUploadError(errorData.error || 'Bir hata oluştu');
        return;
      }
      
      const uploadedMedia = await response.json();
      
      // Clear files after successful upload
      setFiles([]);
      
      // Call the callback with the uploaded media
      onUploadComplete(uploadedMedia);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while uploading');
      setUploadError(err instanceof Error ? err.message : 'Bir hata oluştu');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      {uploadError && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
          {uploadError}
        </div>
      )}
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag & drop images here, or click to select files
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PNG, JPG, WEBP or GIF up to 10MB (max {maxFiles} files)
        </p>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative border rounded-md p-2">
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                  type="button"
                >
                  <FiX className="h-4 w-4 text-gray-600" />
                </button>
                
                <div className="h-40 relative">
                  <Image
                    src={file.preview}
                    alt="Preview"
                    className="rounded-md object-contain"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Alt Text (optional)
                  </label>
                  <input
                    type="text"
                    value={file.altText}
                    onChange={(e) => handleAltTextChange(index, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Describe this image"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={uploadFiles}
              disabled={isUploading}
              className={`px-4 py-2 rounded-md text-white ${
                isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload Images'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader; 