import { getPublicProjects } from '@/lib/api';
import ExploreClient from './ExploreClient';
import Link from 'next/link';
import { FiGithub, FiExternalLink, FiSearch, FiFolder } from 'react-icons/fi';
import Image from 'next/image';

// Define Project type
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
  user?: {
    id: string;
    email: string;
  };
  media?: { url: string; altText?: string | null }[];
}

export default async function ExplorePage() {
  // Fetch public projects
  let projects = (await getPublicProjects()) as any[];
  // user alanı olmayan projeleri filtrele
  projects = projects.filter(p => p.user && p.user.id && p.user.email);

  // Tüm etiketleri çıkar
  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags)));

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Projeleri Keşfet</h1>
              <p className="text-gray-400 mt-1">Topluluk projelerini inceleyin ve ilham alın</p>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <ExploreClient projects={projects} allTags={allTags} formatDate={formatDate} />
      </main>
    </div>
  );
} 