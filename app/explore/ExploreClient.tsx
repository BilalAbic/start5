"use client";
import Link from 'next/link';
import { FiGithub, FiExternalLink, FiSearch, FiFolder } from 'react-icons/fi';
import Image from 'next/image';
import { useState } from 'react';

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

export default function ExploreClient({ projects, allTags, formatDate }: {
  projects: Project[];
  allTags: string[];
  formatDate: (dateString: string) => string;
}) {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState<string | null>(null);

  const filtered = projects.filter((p) => {
    const matchesTag = tag ? p.tags.includes(tag) : true;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex-1 flex items-center bg-gray-800 rounded-md px-3 py-2">
          <FiSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Projelerde ara..."
            className="bg-transparent outline-none text-white flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${!tag ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-blue-900'}`}
            onClick={() => setTag(null)}
          >
            Tümü
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${tag === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-blue-900'}`}
              onClick={() => setTag(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-xl text-gray-300">Aradığınız kriterlere uygun proje bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors group"
            >
              {/* Proje görseli */}
              {project.media && project.media.length > 0 ? (
                <div className="relative h-40 w-full">
                  <Image
                    src={project.media[0]?.url || '/placeholder.png'}
                    alt={project.media[0]?.altText || project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-40 w-full bg-gray-700 flex items-center justify-center text-gray-400 text-4xl">
                  <FiFolder />
                </div>
              )}
              <div className="p-5">
                <h2 className="text-xl font-semibold text-white mb-2 line-clamp-1">{project.title}</h2>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {project.description || 'Açıklama yok'}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded-md text-xs cursor-pointer hover:bg-blue-600/40"
                      onClick={e => {
                        e.preventDefault();
                        setTag(tag);
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  {project.user ? (
                    <Link
                      href={`/profile/${project.user.id}`}
                      className="hover:underline hover:text-blue-400"
                      onClick={e => e.stopPropagation()}
                    >
                      {project.user.email.split('@')[0]}
                    </Link>
                  ) : (
                    <span>Kullanıcı Yok</span>
                  )}
                  <div>{formatDate(project.createdAt)}</div>
                </div>
                <div className="mt-4 flex gap-3">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-gray-300 hover:text-white"
                      onClick={e => e.stopPropagation()}
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
                      onClick={e => e.stopPropagation()}
                    >
                      <FiExternalLink className="mr-1" />
                      Demo
                    </a>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
} 