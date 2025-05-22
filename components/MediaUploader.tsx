import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { FiUpload, FiX, FiImage, FiAlertCircle, FiCheck } from 'react-icons/fi';
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
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const reasons: string[] = [];
      rejectedFiles.forEach(file => {
        file.errors.forEach((err: any) => {
          if (err.code === 'file-too-large') {
            reasons.push(`${file.file.name}: Dosya boyutu çok büyük (maks. 10MB)`);
          } else if (err.code === 'file-invalid-type') {
            reasons.push(`${file.file.name}: Geçersiz dosya formatı`);
          } else {
            reasons.push(`${file.file.name}: ${err.message}`);
          }
        });
      });
      
      if (reasons.length > 0) {
        setError(reasons.join(', '));
      }
      return;
    }
    
    // Check if adding these files would exceed the limit
    if (files.length + acceptedFiles.length > maxFiles) {
      setError(`En fazla ${maxFiles} dosya yükleyebilirsiniz. Lütfen bazı dosyaları kaldırın.`);
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
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: maxFiles,
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
    setUploadProgress(0);
    
    try {
      // Convert files to base64
      const totalFiles = files.length;
      let processedFiles = 0;
      
      const images = await Promise.all(
        files.map(async ({ file, altText }) => {
          return new Promise<{ base64: string; altText: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              processedFiles++;
              setUploadProgress(Math.round((processedFiles / totalFiles) * 50)); // First 50% - reading files
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
      
      setUploadProgress(75); // Reading done, now processing server-side
      
      if (!response.ok) {
        const errorData = await response.json();
        setUploadError(errorData.error || 'Bir hata oluştu');
        return;
      }
      
      const uploadedMedia = await response.json();
      setUploadProgress(100); // Complete!
      
      // Clear files after successful upload
      files.forEach(file => URL.revokeObjectURL(file.preview));
      setFiles([]);
      
      // Call the callback with the uploaded media
      onUploadComplete(uploadedMedia);
      
    } catch (err: any) {
      setError(err.message || 'Yükleme sırasında bir hata oluştu');
      setUploadError(err instanceof Error ? err.message : 'Bir hata oluştu');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-400 bg-red-500/10 rounded-md border border-red-500/20 flex items-center">
          <FiAlertCircle className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {uploadError && (
        <div className="p-3 text-sm text-red-400 bg-red-500/10 rounded-md border border-red-500/20 flex items-center">
          <FiAlertCircle className="mr-2 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-400 hover:bg-gray-700/50'
        }`}
      >
        <input {...getInputProps()} />
        <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-300">
          Görselleri sürükleyip bırakın veya dosya seçmek için tıklayın
        </p>
        <p className="text-xs text-gray-400 mt-1">
          PNG, JPG, WEBP veya GIF (maks. 10MB, {maxFiles} dosya)
        </p>
      </div>
      
      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Yükleniyor...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative border border-gray-600 rounded-md p-2 bg-gray-700">
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-3 right-3 bg-gray-900/70 rounded-full p-1 shadow-md hover:bg-red-500/70 transition-colors z-10"
                  type="button"
                  aria-label="Görseli kaldır"
                >
                  <FiX className="h-4 w-4 text-white" />
                </button>
                
                <div className="h-40 relative">
                  <Image
                    src={file.preview}
                    alt="Önizleme"
                    className="rounded-md object-contain"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Görsel Açıklaması (opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={file.altText}
                    onChange={(e) => handleAltTextChange(index, e.target.value)}
                    className="block w-full rounded-md bg-gray-800 border-gray-600 text-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Bu görseli açıklayın"
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
              className={`px-4 py-2 rounded-md text-white flex items-center ${
                isUploading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isUploading ? (
                <>Yükleniyor...</>
              ) : (
                <>
                  <FiUpload className="mr-2" /> 
                  Görselleri Yükle ({files.length})
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader; 