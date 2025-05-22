import { getPublicProjects } from '@/lib/api';
import ExploreClient from './ExploreClient';
import Link from 'next/link';
import { FiGithub, FiExternalLink, FiSearch, FiFolder, FiArrowRight } from 'react-icons/fi';
import Image from 'next/image';
import { Metadata } from 'next';

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
    username?: string;
  };
  media?: { url: string; altText?: string | null }[];
}

// Define pagination type
interface Pagination {
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

// Add metadata for better SEO
export const metadata: Metadata = {
  title: 'Keşfet - Topluluk Projeleri | Start5',
  description: 'Start5 geliştirici topluluğunun açık kaynak projelerini keşfedin, ilham alın, katkıda bulunun.',
  openGraph: {
    title: 'Topluluk Projelerini Keşfet | Start5',
    description: 'Start5 geliştirici topluluğunun açık kaynak projelerini keşfedin, ilham alın, katkıda bulunun.',
    url: '/explore',
    siteName: 'Start5',
    images: [
      {
        url: '/og-image-explore.jpg', // Replace with actual OG image path
        width: 1200,
        height: 630,
        alt: 'Start5 - Topluluk Projeleri',
      }
    ],
    locale: 'tr-TR',
    type: 'website',
  },
};

export default async function ExplorePage({
  searchParams: searchParamsProp,
}: {
  searchParams: Promise<{ page?: string; limit?: string; tag?: string; search?: string }>
}) {
  const searchParams = await searchParamsProp;

  // Parse pagination parameters with defaults
  const currentPage = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 24; // Show more projects per page
  const { tag, search } = searchParams;

  // Fetch public projects from API with pagination
  const result = await getPublicProjects(limit, currentPage, tag, search);
  const { projects, pagination } = result;
  
  // Filter projects with valid user data
  const validProjects = projects.filter(p => p.user && p.user.id);

  // Make sure each project has at least an empty tags array
  const normalizedProjects = validProjects.map(project => ({
    ...project,
    tags: project.tags || [],
  }));

  // Extract all unique tags from projects
  const allTags = Array.from(new Set(normalizedProjects.flatMap((p) => p.tags || [])));

  // Pre-format all dates to pass as data instead of function
  const formattedProjects = normalizedProjects.map(project => ({
    ...project,
    formattedDate: new Date(project.createdAt).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-800/50 border-b border-gray-700/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Topluluk Projelerini Keşfet
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start5 geliştiricilerinin açık kaynak projelerini inceleyin, ilham alın ve katkıda bulunun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all hover:scale-105 transform focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                aria-label="Kendi projeni eklemek için hemen kaydol"
              >
                Projeni Ekle
                <FiArrowRight className="ml-2" aria-hidden="true" />
              </Link>
              <a
                href="#projects"
                className="inline-flex items-center px-6 py-3 text-lg font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all hover:scale-105 transform focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
                aria-label="Mevcut topluluk projelerini keşfet"
              >
                Projeleri Keşfet
                <FiSearch className="ml-2" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="container mx-auto px-4 py-12">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8">
          <ExploreClient 
            projects={formattedProjects} 
            allTags={allTags}
            currentPage={pagination.page}
            limit={pagination.limit}
            totalPages={pagination.pageCount}
            totalProjects={pagination.total}
          />
        </div>
      </section>
    </div>
  );
} 