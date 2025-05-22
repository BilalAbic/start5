'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiEdit2, FiTrash2, FiEye, FiGithub, FiExternalLink } from 'react-icons/fi';

interface Project {
  id: string;
  title: string;
  description: string;
  githubUrl: string;
  demoUrl?: string;
  isPublic: boolean;
  status: string;
  tags: string[];
  createdAt: string;
}

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GELISTIRILIYOR':
        return (
          <span className="px-2 py-1 text-xs rounded-md bg-yellow-500/20 text-yellow-400">
            Geliştiriliyor
          </span>
        );
      case 'YAYINDA':
        return (
          <span className="px-2 py-1 text-xs rounded-md bg-green-500/20 text-green-400">
            Yayında
          </span>
        );
      case 'ARSIVDE':
        return (
          <span className="px-2 py-1 text-xs rounded-md bg-gray-500/20 text-gray-400">
            Arşivde
          </span>
        );
      default:
        return null;
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      // Reload the page to refresh the project list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Proje silinirken bir hata oluştu');
    } finally {
      setDeleteConfirmId(null);
    }
  };
  
  const fetchProject = async (id: string) => {
    setFetchError(null);
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        setFetchError(errorData.error || 'Bir hata oluştu');
        return null;
      }
      return await response.json();
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : 'Bir hata oluştu');
      return null;
    }
  };
  
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-300 mb-4">Henüz hiç projeniz bulunmuyor.</p>
        <Link 
          href="/projects/new" 
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          İlk Projeni Oluştur
        </Link>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div key={project.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <div className="p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-white">{project.title}</h3>
              {getStatusBadge(project.status)}
            </div>
            
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {project.description || 'Açıklama bulunmuyor'}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded-md text-xs"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length === 0 && (
                <span className="text-gray-400 text-xs">Etiket bulunmuyor</span>
              )}
            </div>
            
            <div className="flex items-center text-gray-400 text-sm mb-4">
              <span>Oluşturulma: {formatDate(project.createdAt)}</span>
              <span className="mx-2">•</span>
              <span>{project.isPublic ? 'Herkese Açık' : 'Gizli'}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.githubUrl && (
                <a 
                  href={project.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-gray-300 hover:text-white"
                >
                  <FiGithub className="mr-1" />
                  GitHub
                </a>
              )}
              
              {project.demoUrl && (
                <a 
                  href={project.demoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-gray-300 hover:text-white"
                >
                  <FiExternalLink className="mr-1" />
                  Demo
                </a>
              )}
            </div>
            
            <div className="flex justify-between border-t border-gray-700 pt-4">
              <div className="space-x-2">
                <Link href={`/projects/${project.id}`} className="text-gray-300 hover:text-white">
                  <FiEye />
                </Link>
                <Link href={`/projects/${project.id}/edit`} className="text-gray-300 hover:text-white">
                  <FiEdit2 />
                </Link>
              </div>
              
              {deleteConfirmId === project.id ? (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
                  >
                    Eminim
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmId(null)}
                    className="text-xs bg-gray-600 hover:bg-gray-500 text-white py-1 px-2 rounded"
                  >
                    İptal
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setDeleteConfirmId(project.id)}
                  className="text-gray-300 hover:text-red-400"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 