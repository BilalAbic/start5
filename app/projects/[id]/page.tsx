import { Metadata, ResolvingMetadata } from 'next';
import { getProject } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { 
  FiGithub, 
  FiExternalLink, 
  FiArrowLeft, 
  FiLock, 
  FiGlobe, 
  FiEdit3, 
  FiTrash2, 
  FiShare2, 
  FiFlag, 
  FiPlus,
  FiCalendar
} from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import ProjectGallery from '@/components/projects/ProjectGallery';
import { Media } from '@/types';
import DeleteProjectButton from '@/components/projects/DeleteProjectButton';
import ShareButton from '@/components/projects/ShareButton';
import ProjectStatusBadge from '@/components/projects/ProjectStatusBadge';
import TagList from '@/components/projects/TagList';
import ClientReportButton from '@/components/projects/ClientReportButton';
import ProjectCommentsWrapper from '@/components/projects/ProjectCommentsWrapper';

type Props = {
  params: Promise<{ id: string }>;
};

// Generate metadata for SEO
export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params;
  const projectId = params.id;

  // Fetch project data
  const project = await getProject(projectId);

  // If project doesn't exist, return default metadata
  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
    };
  }

  // Determine the featured image URL for og:image
  const featuredImage = project.media && project.media.length > 0 
    ? project.media[0].url 
    : '/default-project-image.jpg';

  // Return metadata for the project
  return {
    title: `${project.title} | Start5`,
    description: project.description?.slice(0, 155) || 'View this project on Start5',
    openGraph: {
      title: project.title,
      description: project.description?.slice(0, 155) || 'View this project on Start5',
      images: [
        {
          url: featuredImage,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description?.slice(0, 155) || 'View this project on Start5',
      images: [featuredImage],
    },
  };
}

export default async function ProjectDetailPage(props: Props) {
  const params = await props.params;
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

  // Check if current user is the project owner
  const isOwner = currentUser && project.userId === currentUser.userId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      {/* Project Hero Section */}
      <header className="relative bg-gray-800 border-b border-gray-700 overflow-hidden">
        {project.media && project.media.length > 0 && (
          <div className="absolute inset-0 opacity-10">
            <Image 
              src={project.media[0].url} 
              alt={project.title} 
              fill 
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <Link
            href="/explore"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4 transition"
          >
            <FiArrowLeft className="mr-2" /> Keşfet'e Dön
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {project.isPublic ? (
                  <div className="flex items-center text-green-400 text-sm font-medium">
                    <FiGlobe className="mr-1" /> Public
                  </div>
                ) : (
                  <div className="flex items-center text-yellow-400 text-sm font-medium">
                    <FiLock className="mr-1" /> Private
                  </div>
                )}
                <ProjectStatusBadge status={project.status} />
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-2">{project.title}</h1>
              
              <div className="flex items-center text-gray-400 mb-4">
                <FiCalendar className="mr-2" /> 
                <time dateTime={project.createdAt}>{formatDate(project.createdAt)}</time>
              </div>
              
              {/* Project Owner */}
              {project.user && (
                <div className="flex items-center mt-4">
                  <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden mr-3">
                    <Image 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(project.user.username || project.user.email.split('@')[0])}&background=random`}
                      alt={project.user.username || project.user.email}
                      width={40}
                      height={40}
                    />
                  </div>
                  <Link href={`/u/${project.user.username || project.user.email.split('@')[0]}`} className="text-blue-400 hover:underline">
                    {project.user.username || project.user.email.split('@')[0]}
                  </Link>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                  <FiGithub className="mr-2" /> GitHub
                </a>
              )}
              
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
                >
                  <FiExternalLink className="mr-2" /> Demo
                </a>
              )}
              
              <ShareButton title={project.title} />
              
              {!isOwner && (
                <div className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                  <ClientReportButton projectId={project.id} className="p-0" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Media Gallery */}
            {project.media && project.media.length > 0 ? (
              <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 p-6">
                <h2 className="text-xl font-semibold mb-4">Galeri</h2>
                <ProjectGallery media={project.media as Media[]} />
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 p-6">
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-lg">Bu projede henüz görsel yok</p>
                  
                  {isOwner && (
                    <Link 
                      href={`/projects/${project.id}/media/upload`}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
                    >
                      <FiPlus className="mr-2" /> Görsel Ekle
                    </Link>
                  )}
                </div>
              </div>
            )}
            
            {/* Description */}
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4">Proje Hakkında</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-line">
                  {project.description || 'Bu proje için açıklama eklenmemiş.'}
                </p>
              </div>
            </div>

            {/* Comment Section */}
            <ProjectCommentsWrapper 
              projectId={project.id} 
              currentUser={currentUser}
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Controls */}
            {isOwner && (
              <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 p-6">
                <h2 className="text-xl font-semibold mb-4">Proje Yönetimi</h2>
                <div className="flex flex-col gap-3">
                  <Link
                    href={`/projects/${project.id}/edit`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors w-full justify-center"
                  >
                    <FiEdit3 className="mr-2" /> Düzenle
                  </Link>
                  
                  <Link
                    href={`/projects/${project.id}/media/upload`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors w-full justify-center"
                  >
                    <FiPlus className="mr-2" /> Görsel Ekle
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}