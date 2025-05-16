import { getCurrentUser } from '@/lib/auth';
import ProjectList from '@/components/projects/ProjectList';
import { Project } from '@/lib/types';
import { FiPlusCircle } from 'react-icons/fi';
import Link from 'next/link';

// Example projects data
const exampleProjects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Website',
    description: 'Full-featured online shopping platform using Next.js and Prisma',
    isPublic: true,
    githubUrl: 'https://github.com/user/ecommerce',
    userId: '1',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-02-01'),
  },
  {
    id: '2',
    title: 'Portfolio App',
    description: 'Personal portfolio website built with React and Tailwind CSS',
    isPublic: false,
    githubUrl: 'https://github.com/user/portfolio',
    userId: '1',
    createdAt: new Date('2023-03-10'),
  },
  {
    id: '3',
    title: 'Task Manager',
    description: 'Task and project management application with team collaboration features',
    isPublic: true,
    userId: '1',
    createdAt: new Date('2023-04-20'),
    updatedAt: new Date('2023-05-05'),
  },
];

export default async function ProjectsPage() {
  const userPayload = await getCurrentUser();
  
  // In a real app, you'd fetch projects from the database
  const projects = exampleProjects;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projelerim</h1>
          <p className="text-gray-300">Tüm projelerinizi burada yönetebilirsiniz</p>
        </div>
        
        <Link
          href="/projects/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FiPlusCircle className="mr-2" />
          Yeni Proje
        </Link>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        {projects.length > 0 ? (
          <ProjectList projects={projects} />
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 mb-4">Henüz hiç projeniz bulunmuyor</p>
            <Link
              href="/projects/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiPlusCircle className="mr-2" />
              İlk Projenizi Oluşturun
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 