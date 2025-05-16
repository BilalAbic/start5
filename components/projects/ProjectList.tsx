'use client';

import { Project } from '@/lib/types';
import { FiGlobe, FiLock, FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi';

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  // Handle edit button click (would navigate to edit page in real app)
  const handleEdit = (id: string) => {
    console.log(`Edit project with ID: ${id}`);
    // In a real app: router.push(`/projects/edit/${id}`);
  };

  // Handle delete button click (would show confirmation modal in real app)
  const handleDelete = (id: string) => {
    console.log(`Delete project with ID: ${id}`);
    // In a real app: show confirmation dialog and then delete
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-3 px-4 text-gray-400 font-medium">Proje Adı</th>
            <th className="py-3 px-4 text-gray-400 font-medium hidden md:table-cell">Açıklama</th>
            <th className="py-3 px-4 text-gray-400 font-medium">Durum</th>
            <th className="py-3 px-4 text-gray-400 font-medium hidden md:table-cell">Oluşturulma</th>
            <th className="py-3 px-4 text-gray-400 font-medium text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
              <td className="py-3 px-4 font-medium text-white">
                {project.title}
                {project.githubUrl && (
                  <a 
                    href={project.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center ml-2 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <FiExternalLink size={14} />
                  </a>
                )}
              </td>
              <td className="py-3 px-4 text-gray-300 hidden md:table-cell">
                {project.description.length > 60 
                  ? `${project.description.substring(0, 60)}...` 
                  : project.description}
              </td>
              <td className="py-3 px-4">
                {project.isPublic ? (
                  <span className="inline-flex items-center text-green-500">
                    <FiGlobe className="mr-1" /> Public
                  </span>
                ) : (
                  <span className="inline-flex items-center text-amber-500">
                    <FiLock className="mr-1" /> Private
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-gray-300 hidden md:table-cell">
                {new Date(project.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-right space-x-2">
                <button 
                  onClick={() => handleEdit(project.id)}
                  className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(project.id)}
                  className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                >
                  <FiTrash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 