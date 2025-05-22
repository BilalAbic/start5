'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiAlertCircle, FiGithub, FiLoader, FiUpload, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import MediaUploader from '@/components/MediaUploader';
import { Media } from '@/types';

const MAX_MEDIA = 10; // Maximum number of media items allowed per project

interface FormError {
  field: string;
  message: string;
}

interface TempMedia {
  url: string;
  publicId: string;
  altText: string | null;
  isTemporary: boolean;
}

interface ProjectFormProps {
  project?: {
    id: string;
    title: string;
    description: string;
    githubUrl: string;
    demoUrl?: string;
    isPublic: boolean;
    status: string;
    tags: string[];
    media?: Media[];
    isPinned: boolean;
    version: string;
  };
}

export default function ProjectForm({ project }: ProjectFormProps = {}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    githubUrl: project?.githubUrl || '',
    demoUrl: project?.demoUrl || '',
    isPublic: project?.isPublic ?? false,
    status: project?.status || 'GELISTIRILIYOR',
    tags: project?.tags || [],
    isPinned: project?.isPinned ?? false,
    version: project?.version || '',
  });
  
  const [tempMedia, setTempMedia] = useState<TempMedia[]>([]);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isLoadingGitHub, setIsLoadingGitHub] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Clear error for this field when user types
    setErrors(prev => prev.filter(error => error.field !== name));
    
    // Mark form as dirty
    setIsDirty(true);
    
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormError[] = [];
    
    // Title validation
    if (!formData.title.trim()) {
      newErrors.push({
        field: 'title',
        message: 'Proje adı gerekli'
      });
    } else if (formData.title.length < 3) {
      newErrors.push({
        field: 'title',
        message: 'Proje adı en az 3 karakter olmalı'
      });
    } else if (formData.title.length > 100) {
      newErrors.push({
        field: 'title',
        message: 'Proje adı en fazla 100 karakter olabilir'
      });
    }
    
    // Description validation
    if (!formData.description.trim()) {
      newErrors.push({
        field: 'description',
        message: 'Proje açıklaması gerekli'
      });
    } else if (formData.description.length > 500) {
      newErrors.push({
        field: 'description',
        message: 'Açıklama 500 karakterden uzun olamaz'
      });
    }
    
    // GitHub URL validation
    if (!formData.githubUrl.trim()) {
      newErrors.push({
        field: 'githubUrl',
        message: 'GitHub URL gerekli'
      });
    } else {
      try {
        const url = new URL(formData.githubUrl);
        if (!url.hostname.includes('github.com')) {
          newErrors.push({
            field: 'githubUrl',
            message: 'Geçerli bir GitHub URL giriniz (https://github.com/kullanici/repo)'
          });
        }
      } catch {
        newErrors.push({
          field: 'githubUrl',
          message: 'Geçerli bir URL giriniz'
        });
      }
    }
    
    // Demo URL validation (optional)
    if (formData.demoUrl) {
      try {
        new URL(formData.demoUrl);
      } catch {
        newErrors.push({
          field: 'demoUrl',
          message: 'Geçerli bir URL giriniz'
        });
      }
    }
    
    // Version validation (optional)
    if (formData.version && !/^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/i.test(formData.version)) {
      newErrors.push({
        field: 'version',
        message: 'Geçerli bir versiyon numarası giriniz (örn: v1.0.0)'
      });
    }
    
    // Tags validation
    if (formData.tags.some(tag => tag.length > 50)) {
      newErrors.push({
        field: 'tags',
        message: 'Etiketler 50 karakterden uzun olamaz'
      });
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccessMessage(false);
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('[class*="border-red-500"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setIsSaving(true);
    try {
      // Prepare form data with proper types
      const formDataToSend = {
        ...formData,
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        demoUrl: formData.demoUrl.trim() || null, // Ensure empty string becomes null
        version: formData.version.trim() || null, // Ensure empty string becomes null
      };

      const url = project?.id 
        ? `/api/projects/${project.id}` 
        : '/api/projects';
      const method = project?.id ? 'PUT' : 'POST';
      
      // Show loading state in button
      setIsSubmitting(true);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSend),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle validation errors from backend
        if (response.status === 400) {
          setErrors(prev => {
            const newErrors = [...prev];
            if (data.errors) {
              data.errors.forEach((error: any) => {
                newErrors.push({
                  field: error.path[0] || 'form',
                  message: error.message
                });
              });
            } else {
              newErrors.push({
                field: data.field || 'form',
                message: data.error || 'Bir hata oluştu'
              });
            }
            return newErrors;
          });
          setIsSubmitting(false);
          return;
        }
        
        // Handle other errors
        throw new Error(data.error || 'Bir hata oluştu');
      }
      
      // Handle successful submission
      const savedProject = data;
      
      // If we have temporary media uploads, attach them to the new project
      if (tempMedia.length > 0 && !project?.id) {
        try {
          const attachMediaResponse = await fetch(`/api/projects/${savedProject.id}/media/attach`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              mediaItems: tempMedia.map(item => ({
                publicId: item.publicId,
                url: item.url,
                altText: item.altText
              }))
            }),
          });
          
          if (!attachMediaResponse.ok) {
            const mediaError = await attachMediaResponse.json();
            throw new Error(mediaError.error || 'Medya eklenirken bir hata oluştu');
          }
        } catch (mediaError) {
          console.error('Error attaching media to project:', mediaError);
          setErrors(prev => [...prev, {
            field: 'media',
            message: mediaError instanceof Error ? mediaError.message : 'Medya eklenirken bir hata oluştu'
          }]);
          // Continue with success flow even if media attachment fails
        }
      }
      
      setShowSuccessMessage(true);
      setIsDirty(false);
      
      // Show success message and redirect
      setTimeout(() => {
        if (tempMedia.length > 0 && !project?.id) {
          router.push(`/projects/${savedProject.id}/media`);
        } else {
          router.push(`/projects/${savedProject.id}`);
        }
        router.refresh();
      }, 2000); // Increased timeout for better feedback
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(prev => [...prev, {
        field: 'form',
        message: error instanceof Error ? error.message : 'Bir hata oluştu',
      }]);
      
      // Scroll to form error
      const formError = document.querySelector('[class*="bg-red-500"]');
      formError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      setIsSaving(false);
    }
  };

  const getFieldError = (fieldName: string): string | null => {
    const error = errors.find(e => e.field === fieldName);
    return error ? error.message : null;
  };

  // GitHub'dan bilgileri getirme fonksiyonu
  const fetchGitHubInfo = async () => {
    if (!formData.githubUrl || !/^https:\/\/github\.com\/.+\/.+/.test(formData.githubUrl)) {
      setErrors(prev => [...prev, {
        field: 'githubUrl',
        message: 'Geçerli bir GitHub URL giriniz (https://github.com/kullanici/repo)'
      }]);
      return;
    }
    
    setIsLoadingGitHub(true);
    setErrors(prev => prev.filter(error => error.field !== 'githubUrl' && error.field !== 'github-api'));
    
    try {
      const response = await fetch(`/api/github-info?url=${encodeURIComponent(formData.githubUrl)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'GitHub bilgileri alınamadı');
      }
      
      const data = await response.json();
      
      // Form bilgilerini güncelle
      setFormData(prev => ({
        ...prev,
        title: data.name || prev.title,
        description: data.description || prev.description,
        demoUrl: data.homepage || prev.demoUrl,
        tags: [...new Set([...prev.tags, ...data.topics, ...data.languages])]
      }));
    } catch (error) {
      console.error('GitHub API error:', error);
      setErrors(prev => [...prev, {
        field: 'github-api',
        message: error instanceof Error ? error.message : 'GitHub bilgileri alınamadı'
      }]);
    } finally {
      setIsLoadingGitHub(false);
    }
  };
  
  // Handle successful media upload
  const handleUploadComplete = (media: any[]) => {
    // Validate media count
    if (media.length + (tempMedia?.length || 0) > MAX_MEDIA) {
      setErrors(prev => [...prev, {
        field: 'media',
        message: `En fazla ${MAX_MEDIA} görsel yükleyebilirsiniz.`
      }]);
      return;
    }

    // Check if the media has the isTemporary flag (from temp uploads)
    if (media.length > 0 && media[0].isTemporary) {
      setTempMedia(prevMedia => {
        const newMedia = [...prevMedia, ...media];
        // Ensure we don't exceed max media count
        return newMedia.slice(0, MAX_MEDIA);
      });
    } else {
      // Regular media uploads for existing projects
      setTempMedia([]);
    }

    // Clear any previous media-related errors
    setErrors(prev => prev.filter(error => error.field !== 'media'));
  };

  // Handle media removal
  const handleRemoveMedia = (index: number) => {
    setTempMedia(prev => prev.filter((_, i) => i !== index));
  };

  // Add media preview section
  const renderMediaPreview = () => {
    if (tempMedia.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-200 mb-2">Yüklenen Görseller</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {tempMedia.map((media, index) => (
            <div key={index} className="relative group">
              <img
                src={media.url}
                alt={media.altText || 'Proje görseli'}
                className="w-full h-32 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => handleRemoveMedia(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiTrash2 className="text-white" size={16} />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-400">
          {tempMedia.length} / {MAX_MEDIA} görsel yüklendi
        </p>
      </div>
    );
  };

  // Add unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Add loading overlay component
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex items-center space-x-4">
        <FiLoader className="animate-spin text-blue-500" size={24} />
        <p className="text-white">Kaydediliyor...</p>
      </div>
    </div>
  );

  return (
    <>
      {isSaving && <LoadingOverlay />}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto relative">
        {/* Form Status Bar */}
        <div className={`sticky top-0 z-10 mb-6 transition-all duration-300 transform ${
          isDirty ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}>
          <div className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-between">
            <span className="text-sm">Kaydedilmemiş değişiklikler var</span>
            <button
              type="submit"
              disabled={isSaving}
              className="px-3 py-1 bg-white text-blue-600 rounded-md text-sm hover:bg-blue-50 transition-colors"
            >
              Kaydet
            </button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="bg-green-500/20 border border-green-500 text-green-400 rounded-md p-4 mb-6 flex items-center">
            <FiCheckCircle className="mr-2" />
            <span>Proje başarıyla kaydedildi! Yönlendiriliyorsunuz...</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Zorunlu Alan Bilgisi */}
          <div className="text-right text-sm text-gray-400">
            <span className="text-red-400">*</span> Zorunlu alanlar
          </div>
          
          {/* Project Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-1">
              Proje Adı <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              maxLength={100}
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                getFieldError('title') ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            <div className="flex justify-between mt-1">
              {getFieldError('title') && (
                <p className="text-sm text-red-400 flex items-center">
                  <FiAlertCircle className="mr-1" />
                  {getFieldError('title')}
                </p>
              )}
              <p className="text-xs text-gray-400 ml-auto">
                {formData.title.length}/100 karakter
              </p>
            </div>
          </div>
          
          {/* Project Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">
              Açıklama <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                getFieldError('description') ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {getFieldError('description') && (
              <p className="mt-1 text-sm text-red-400 flex items-center">
                <FiAlertCircle className="mr-1" />
                {getFieldError('description')}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              {formData.description.length}/500 karakter
            </p>
          </div>
          
          {/* GitHub URL */}
          <div>
            <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-200 mb-1">
              GitHub URL <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                id="githubUrl"
                name="githubUrl"
                required
                placeholder="https://github.com/username/project"
                value={formData.githubUrl}
                onChange={handleChange}
                className={`flex-1 px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldError('githubUrl') ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              <button
                type="button"
                onClick={fetchGitHubInfo}
                disabled={isLoadingGitHub || !formData.githubUrl}
                className={`px-4 py-2 rounded-md focus:outline-none flex items-center justify-center 
                  ${isLoadingGitHub ? 'bg-blue-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              >
                {isLoadingGitHub ? (
                  <><FiLoader className="animate-spin mr-2" /> Yükleniyor...</>
                ) : (
                  <><FiGithub className="mr-2" /> Bilgileri GitHub'dan Getir</>
                )}
              </button>
            </div>
            {getFieldError('githubUrl') && (
              <p className="mt-1 text-sm text-red-400 flex items-center">
                <FiAlertCircle className="mr-1" />
                {getFieldError('githubUrl')}
              </p>
            )}
            {getFieldError('github-api') && (
              <p className="mt-1 text-sm text-red-400 flex items-center">
                <FiAlertCircle className="mr-1" />
                {getFieldError('github-api')}
              </p>
            )}
          </div>
          
          {/* Demo URL */}
          <div>
            <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-200 mb-1">
              Demo URL <span className="text-gray-400">(opsiyonel)</span>
            </label>
            <input
              type="url"
              id="demoUrl"
              name="demoUrl"
              placeholder="https://your-demo-site.com"
              value={formData.demoUrl}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                getFieldError('demoUrl') ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {getFieldError('demoUrl') && (
              <p className="mt-1 text-sm text-red-400 flex items-center">
                <FiAlertCircle className="mr-1" />
                {getFieldError('demoUrl')}
              </p>
            )}
          </div>
          
          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-200 mb-1">
              Etiketler <span className="text-gray-400">(opsiyonel)</span>
            </label>
            <div className="flex">
              <input
                type="text"
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Etiket ekle ve Enter'a bas"
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Ekle
              </button>
            </div>
            
            {/* Tag List */}
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="bg-blue-500/30 text-blue-200 px-2 py-1 rounded-md flex items-center text-sm">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-200 hover:text-white focus:outline-none"
                  >
                    &times;
                  </button>
                </div>
              ))}
              {formData.tags.length === 0 && (
                <p className="text-sm text-gray-400">
                  Projeniz için uygun etiketler ekleyin (JavaScript, React, vs.)
                </p>
              )}
            </div>
          </div>
          
          {/* Media Upload */}
          {!project?.id && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-200">
                  Proje Görselleri <span className="text-gray-400">(opsiyonel)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowMediaUploader(!showMediaUploader)}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                >
                  <FiUpload className="mr-1" /> {showMediaUploader ? 'Gizle' : 'Görsel Ekle'}
                </button>
              </div>
              
              {showMediaUploader && (
                <div className="border border-gray-700 rounded-md p-4 bg-gray-800">
                  <MediaUploader 
                    projectId="temp" 
                    onUploadComplete={handleUploadComplete}
                    maxFiles={MAX_MEDIA - tempMedia.length}
                  />
                </div>
              )}
              
              {renderMediaPreview()}
              
              {getFieldError('media') && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <FiAlertCircle className="mr-1" />
                  {getFieldError('media')}
                </p>
              )}
              
              <p className="mt-1 text-xs text-gray-400">
                Not: Proje oluşturulduktan sonra da görsel ekleyebilirsiniz.
              </p>
            </div>
          )}
          
          {/* Version Input - Add before status field */}
          <div>
            <label htmlFor="version" className="block text-sm font-medium text-gray-200 mb-1">
              Versiyon <span className="text-gray-400">(opsiyonel)</span>
            </label>
            <input
              type="text"
              id="version"
              name="version"
              placeholder="örn: v1.0.0"
              value={formData.version}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Project Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-200 mb-1">
              Proje Durumu
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="GELISTIRILIYOR">Geliştiriliyor</option>
              <option value="YAYINDA">Yayında</option>
              <option value="ARSIVDE">Arşivde</option>
            </select>
          </div>
          
          {/* Public/Private Toggle */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-600 bg-gray-700 focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-200">
                Projeyi herkese açık yap (kamusal olarak Explore sayfasında görünür)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPinned"
                name="isPinned"
                checked={formData.isPinned}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-600 bg-gray-700 focus:ring-blue-500"
              />
              <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-200">
                Projeyi profilimde üste sabitle
              </label>
            </div>
          </div>
          
          {/* Form-level Error */}
          {getFieldError('form') && (
            <div className="p-3 bg-red-500/20 border border-red-500 text-red-400 rounded-md">
              {getFieldError('form')}
            </div>
          )}
          
          {/* Submit Button */}
          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className={`inline-flex items-center px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors ${
                isSaving || !isDirty
                  ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSaving ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  {project?.id ? 'Projeyi Güncelle' : 'Projeyi Kaydet'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
} 