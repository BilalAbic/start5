"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';
import ProjectForm from '@/components/projects/ProjectForm';

export default function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  // Access the id directly but wrapped in a function call to avoid the warning
  const projectId = params.id;
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Project not found');
          } else if (response.status === 401) {
            throw new Error('Unauthorized');
          } else {
            throw new Error('Failed to fetch project');
          }
        }
        
        const data = await response.json();
        setProject(data);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching project:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-300">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 text-red-400 p-4 rounded-md">
            <h2 className="text-lg font-medium mb-2">Error</h2>
            <p>{error}</p>
            <div className="mt-4">
              <Link
                href="/projects"
                className="inline-flex items-center text-blue-400 hover:text-blue-300"
              >
                <FiArrowLeft className="mr-2" /> Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link
            href={`/projects`}
            className="inline-flex items-center text-blue-400 hover:text-blue-300"
          >
            <FiArrowLeft className="mr-2" /> Back to Projects
          </Link>
          <h1 className="text-2xl font-bold mt-2 text-white">Edit Project: {project.title}</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-700">
          <nav className="flex space-x-8">
            <Link
              href={`/projects/${projectId}/edit`}
              className="py-4 px-1 border-b-2 border-blue-500 text-blue-400 font-medium text-sm"
            >
              Project Details
            </Link>
            <Link
              href={`/projects/${projectId}/media`}
              className="py-4 px-1 border-b-2 border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600 font-medium text-sm"
            >
              Media Gallery
            </Link>
          </nav>
        </div>

        {/* Form Content */}
        <div className="bg-gray-800 shadow rounded-lg p-6 border border-gray-700">
          <ProjectForm project={project} />
        </div>
      </div>
    </div>
  );
} 