'use client';

import { useState } from 'react';
import { FiSave, FiAlertCircle, FiGithub, FiLoader } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface FormError {
  field: string;
  message: string;
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
  };
}

export default function ProjectForm({ project }: ProjectFormProps = {}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    githubUrl: project?.githubUrl || '',
    demoUrl: project?.demoUrl || '',
    isPublic: project?.isPublic ?? true,
    status: project?.status || 'GELISTIRILIYOR',
    tags: project?.tags || [],
  });

  const [errors, setErrors] = useState<FormError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isLoadingGitHub, setIsLoadingGitHub] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Clear error for this field when user types
    setErrors(prev => prev.filter(error => error.field !== name));
    
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
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.push({
        field: 'description',
        message: 'Açıklama 500 karakterden uzun olamaz'
      });
    }
    
    if (formData.githubUrl && !/^https:\/\/github\.com\/.+\/.+/.test(formData.githubUrl)) {
      newErrors.push({
        field: 'githubUrl',
        message: 'Geçerli bir GitHub URL giriniz (https://github.com/kullanici/repo)'
      });
    }
    
    if (formData.demoUrl && !/^https?:\/\//.test(formData.demoUrl)) {
      newErrors.push({
        field: 'demoUrl',
        message: 'Geçerli bir URL giriniz'
      });
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const url = project?.id 
        ? `/api/projects/${project.id}` 
        : '/api/projects';
      const method = project?.id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setErrors(prev => [...prev, {
          field: 'form',
          message: errorData.error || 'Bir hata oluştu',
        }]);
        setIsSubmitting(false);
        return;
      }
      const savedProject = await response.json();
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/projects');
        router.refresh();
      }, 1500);
    } catch (error) {
      setErrors(prev => [...prev, {
        field: 'form',
        message: error instanceof Error ? error.message : 'Bir hata oluştu',
      }]);
    } finally {
      setIsSubmitting(false);
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

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="space-y-6">
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
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              getFieldError('title') ? 'border-red-500' : 'border-gray-600'
            }`}
          />
          {getFieldError('title') && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <FiAlertCircle className="mr-1" />
              {getFieldError('title')}
            </p>
          )}
        </div>
        
        {/* Project Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">
            Açıklama
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
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
            GitHub URL <span className="text-gray-400">(opsiyonel)</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              id="githubUrl"
              name="githubUrl"
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
          </div>
        </div>
        
        {/* Public/Private Toggle */}
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
            Projeyi herkese açık yap
          </label>
        </div>
        
        {/* Form-level Error */}
        {getFieldError('form') && (
          <div className="p-3 bg-red-500/20 border border-red-500 text-red-400 rounded-md">
            {getFieldError('form')}
          </div>
        )}
        
        {/* Success Message */}
        {submitSuccess && (
          <div className="p-3 bg-green-500/20 border border-green-500 text-green-400 rounded-md">
            Proje başarıyla kaydedildi!
          </div>
        )}
        
        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors ${
              isSubmitting 
                ? 'bg-blue-700 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <FiSave className="mr-2" />
            {isSubmitting ? 'Kaydediliyor...' : project?.id ? 'Projeyi Güncelle' : 'Projeyi Kaydet'}
          </button>
        </div>
      </div>
    </form>
  );
} 