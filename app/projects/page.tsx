import { getCurrentUser } from '@/lib/auth';
import ProjectList from '@/components/projects/ProjectList';
import { FiPlusCircle } from 'react-icons/fi';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Define Project interface to match ProjectList component
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

// Transform DB projects to component-compatible projects
function transformProjects(dbProjects: any[]): Project[] {
  return dbProjects.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    githubUrl: p.githubUrl,
    demoUrl: p.demoUrl || undefined,
    isPublic: p.isPublic,
    status: p.status,
    tags: p.tags,
    createdAt: p.createdAt.toISOString(),
  }));
}

export default async function ProjectsPage() {
  const userPayload = await getCurrentUser();
  
  // Redirect to login if not authenticated
  if (!userPayload) {
    redirect('/login?callbackUrl=/projects');
  }
  
  // Fetch projects directly from the database
  const dbProjects = await prisma.project.findMany({
    where: { userId: userPayload.userId },
    include: { media: true },
    orderBy: { createdAt: 'desc' }
  });
  
  // Transform to the expected format
  const projects = transformProjects(dbProjects);

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