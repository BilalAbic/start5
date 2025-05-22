"use client";
import Link from 'next/link';
import { FiGithub, FiExternalLink, FiSearch, FiFolder, FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
  formattedDate: string;
  user?: {
    id: string;
    email: string;
    username?: string;
  };
  media?: { url: string; altText?: string | null }[];
}

// Skeleton loader component for project cards
const ProjectCardSkeleton = () => (
  <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 animate-pulse" role="status" aria-label="Proje yükleniyor">
    <div className="h-40 bg-gray-700" />
    <div className="p-5 space-y-4">
      <div className="h-6 bg-gray-700 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded" />
        <div className="h-4 bg-gray-700 rounded w-5/6" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-700 rounded" />
        <div className="h-6 w-16 bg-gray-700 rounded" />
      </div>
    </div>
  </div>
);

// Project card component for better organization and performance
const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <Link
      key={project.id}
      href={`/projects/${project.id}`}
      className="group relative bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
    >
      {/* Project Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-900">
        {project.media && project.media.length > 0 ? (
          <Image
            src={project.media[0]?.url || '/placeholder.png'}
            alt={project.media[0]?.altText || project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zMCAzMGMwLTkuOTQtOC4wNi0yMC0yMC0yMFY1MGgzMFYzMHoiIGZpbGw9IiMzMzMiLz48cGF0aCBkPSJNMzAgMzBjMCA5Ljk0IDguMDYgMjAgMjAgMjBWMTBIMzB2MjB6IiBmaWxsPSIjMjIyIi8+PC9nPjwvc3ZnPg=="
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center" aria-label="Bu proje için görsel yok">
            <FiFolder className="h-16 w-16 text-gray-700" aria-hidden="true" />
          </div>
        )}
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full backdrop-blur-sm">
            {project.status}
          </span>
        </div>
      </div>

      {/* Project Info */}
      <div className="p-5">
        <h2 className="text-xl font-semibold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
          {project.title}
        </h2>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {project.description?.slice(0, 120) || 'Açıklama yok'}
          {project.description && project.description.length > 120 ? '...' : ''}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(project.tags || []).slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                // Tag click handler passed via props
              }}
            >
              {tag}
            </span>
          ))}
          {(project.tags || []).length > 3 && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-400 rounded-lg">
              +{project.tags.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-400 border-t border-gray-700 pt-4">
          <div className="flex items-center">
            {project.user && (
              <span className="hover:text-blue-400 transition-colors">
                {project.user.username || project.user.email.split('@')[0]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <button
                type="button"
                className="text-gray-400 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
                }}
                aria-label={`${project.title} projesinin GitHub deposunu aç`}
              >
                <FiGithub aria-hidden="true" />
              </button>
            )}
            {project.demoUrl && (
              <button
                type="button"
                className="text-gray-400 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(project.demoUrl, '_blank', 'noopener,noreferrer');
                }}
                aria-label={`${project.title} projesinin demo sitesini aç`}
              >
                <FiExternalLink aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function ExploreClient({ 
  projects, 
  allTags,
  currentPage = 1,
  limit = 24,
  totalPages,
  totalProjects
}: {
  projects: Project[];
  allTags: string[];
  currentPage?: number;
  limit?: number;
  totalPages?: number;
  totalProjects?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Compute total pages and displayed projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesTag = tag ? (p.tags || []).includes(tag) : true;
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        (p.user?.email && p.user.email.toLowerCase().includes(search.toLowerCase()));
      return matchesTag && matchesSearch;
    });
  }, [projects, tag, search]);

  // Pagination logic
  const projectCount = totalProjects || filteredProjects.length;
  const pageCount = totalPages || Math.ceil(projectCount / limit);
  const displayedProjects = useMemo(() => {
    // If we have server-side pagination, just use the projects as-is
    if (totalPages && totalProjects) {
      return filteredProjects;
    }
    
    // Otherwise, handle client-side pagination
    const start = (currentPage - 1) * limit;
    const end = start + limit;
    return filteredProjects.slice(start, end);
  }, [filteredProjects, currentPage, limit, totalPages, totalProjects]);

  // Handle page changes
  const changePage = (page: number) => {
    if (page < 1 || page > pageCount) return;
    
    setIsLoading(true);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    
    // Update the URL with the new page number
    router.push(`/explore?${params.toString()}`);
    
    // Scroll to the top of the projects section
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
    
    // Simulate loading state
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // "/" key to focus search field
      if (e.key === "/" && searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current.focus();
      }
      // "Escape" key to clear filters
      if (e.key === "Escape") {
        setSearch("");
        setTag(null);
        setShowFilters(false);
      }
      // Arrow keys for pagination
      if (e.key === "ArrowLeft" && currentPage > 1) {
        changePage(currentPage - 1);
      }
      if (e.key === "ArrowRight" && currentPage < pageCount) {
        changePage(currentPage + 1);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, pageCount]);

  // Handle search and tag changes
  useEffect(() => {
    // Reset to first page when filters change
    if (currentPage !== 1) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      router.push(`/explore?${params.toString()}`);
    }
  }, [search, tag]);

  // Handle tag selection
  const handleTagSelect = useCallback((selectedTag: string) => {
    setTag(tag === selectedTag ? null : selectedTag);
  }, [tag]);

  return (
    <>
      {/* Search and Filters */}
      <div className="space-y-4 mb-8" aria-label="Proje arama ve filtreleme">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" aria-hidden="true" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder='Projelerde ara... (Kısayol: "/")'
              className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-xl border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Proje ara"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-3 bg-gray-700 rounded-xl border border-gray-600 text-white hover:bg-gray-600 transition-colors"
            aria-expanded={showFilters}
            aria-controls="filter-panel"
            aria-label={showFilters ? "Filtreleri kapat" : "Filtreleri aç"}
          >
            <FiFilter className="mr-2" aria-hidden="true" />
            Filtreler
            {tag && <span className="ml-2 px-2 py-0.5 bg-blue-500 rounded-full text-xs">1</span>}
          </button>
        </div>

        {/* Tag Filters */}
        {showFilters && (
          <div 
            id="filter-panel"
            className="p-4 bg-gray-700 rounded-xl border border-gray-600 animate-fadeIn transition-all"
            role="region"
            aria-label="Etiket filtreleri"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">Etiketler</h3>
              {tag && (
                <button
                  onClick={() => setTag(null)}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                  aria-label="Etiket filtresini temizle"
                >
                  Temizle
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => handleTagSelect(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    tag === t
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-600'
                  }`}
                  aria-pressed={tag === t}
                  aria-label={`${t} etiketini ${tag === t ? 'kaldır' : 'filtrele'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div role="alert" className="bg-red-900/50 border border-red-700 text-red-200 rounded-xl p-4 mb-6">
          <p className="flex items-center">
            <FiX className="mr-2" aria-hidden="true" /> {error}
          </p>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-400" aria-live="polite">
          {projectCount === 0
            ? 'Hiç sonuç bulunamadı'
            : `${projectCount} proje bulundu ${search || tag ? '(filtrelendi)' : ''}`}
        </p>
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      ) : projectCount === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 text-center">
          <FiSearch className="mx-auto h-12 w-12 text-gray-600 mb-4" aria-hidden="true" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">Proje Bulunamadı</h3>
          <p className="text-gray-400 mb-6">
            Arama kriterlerinize uygun proje bulunamadı. Farklı anahtar kelimeler deneyebilir veya filtreleri temizleyebilirsiniz.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setTag(null);
            }}
            className="inline-flex items-center px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Tüm filtreleri temizle ve tüm projeleri göster"
          >
            <FiX className="mr-2" aria-hidden="true" />
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <>
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            aria-label={`Projeler sayfası ${currentPage}/${pageCount}`}
          >
            {displayedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          
          {/* Pagination Controls */}
          {pageCount > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-4">
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-white bg-gray-800 hover:bg-gray-700'
                }`}
                aria-label="Önceki sayfa"
                aria-disabled={currentPage === 1}
              >
                <FiChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              
              <div className="text-gray-300">
                <span className="font-medium">{currentPage}</span>
                <span className="mx-1">/</span>
                <span>{pageCount}</span>
              </div>
              
              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === pageCount}
                className={`p-2 rounded-lg ${
                  currentPage === pageCount
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-white bg-gray-800 hover:bg-gray-700'
                }`}
                aria-label="Sonraki sayfa"
                aria-disabled={currentPage === pageCount}
              >
                <FiChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Keyboard Shortcut Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Klavye kısayolları: <kbd className="px-2 py-1 bg-gray-800 rounded-md">←</kbd> önceki sayfa, <kbd className="px-2 py-1 bg-gray-800 rounded-md">→</kbd> sonraki sayfa, <kbd className="px-2 py-1 bg-gray-800 rounded-md">/</kbd> ara</p>
      </div>
    </>
  );
} 