'use client';

import { useState } from 'react';
import { FiSave } from 'react-icons/fi';

export default function ProjectForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true,
    githubUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    // In a real app, you would:
    // 1. Validate form data
    // 2. Submit to API endpoint
    // 3. Handle success/error
    // 4. Redirect to projects list
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Project Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-1">
            Proje Adı
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* GitHub URL */}
        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-200 mb-1">
            GitHub URL <span className="text-gray-400">(opsiyonel)</span>
          </label>
          <input
            type="url"
            id="githubUrl"
            name="githubUrl"
            placeholder="https://github.com/username/project"
            value={formData.githubUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
        
        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
          >
            <FiSave className="mr-2" />
            Projeyi Kaydet
          </button>
        </div>
      </div>
    </form>
  );
} 