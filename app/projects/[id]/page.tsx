import { getProject } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { FiGithub, FiExternalLink, FiArrowLeft, FiLock, FiGlobe } from 'react-icons/fi';
import Link from 'next/link';
import ProjectGallery from '@/components/ProjectGallery';
import { Media } from '@/types';

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const projectId = params.id;
  const currentUser = await getCurrentUser();
  
  // Fetch the project
  const project = await getProject(projectId);
  
  // If project doesn't exist, return 404
  if (!project) {
    notFound();
  }
  
  // If project is private and user is not the owner, redirect to login
  if (!project.isPublic && (!currentUser || project.userId !== currentUser.userId)) {
    redirect('/login?message=This+project+is+private');
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };
  
  // Get status badge component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GELISTIRILIYOR':
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
            Geliştiriliyor
          </span>
        );
      case 'YAYINDA':
        return (
          <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400">
            Yayında
          </span>
        );
      case 'ARSIVDE':
        return (
          <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-400">
            Arşivde
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/explore"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
          >
            <FiArrowLeft className="mr-2" /> Back to Explore
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">{project.title}</h1>
              <p className="text-gray-400 mt-1">
                {formatDate(project.createdAt)}
              </p>
            </div>
            
            <div className="mt-3 sm:mt-0 flex items-center space-x-3">
              {project.isPublic ? (
                <div className="flex items-center text-green-400">
                  <FiGlobe className="mr-1" /> Public
                </div>
              ) : (
                <div className="flex items-center text-yellow-400">
                  <FiLock className="mr-1" /> Private
                </div>
              )}
              {getStatusBadge(project.status)}
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          {/* Project Content */}
          <div className="p-6">
            {/* Media Gallery */}
            {project.media && project.media.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Gallery</h2>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <ProjectGallery media={project.media as Media[]} />
                </div>
              </div>
            )}
            
            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">About this project</h2>
              <p className="text-gray-300 whitespace-pre-line">
                {project.description || 'No description provided'}
              </p>
            </div>
            
            {/* Tags */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {project.tags.length > 0 ? (
                  project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-md"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400">No technologies listed</p>
                )}
              </div>
            </div>
            
            {/* Links */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Links</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                  >
                    <FiGithub className="mr-2" /> View on GitHub
                  </a>
                )}
                
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    <FiExternalLink className="mr-2" /> Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Owner Edit Controls */}
        {currentUser && project.userId === currentUser.userId && (
          <div className="mt-6 flex justify-end">
            <Link
              href={`/dashboard/projects/${project.id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Edit Project
            </Link>
          </div>
        )}
      </main>
    </div>
  );
} 