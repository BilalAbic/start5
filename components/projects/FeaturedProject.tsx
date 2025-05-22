import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserProfileProject } from '@/types/user';
import { formatDate } from '@/lib/utils';
import { FaGithub, FaExternalLinkAlt, FaRegClock } from 'react-icons/fa';

interface FeaturedProjectProps {
  project: UserProfileProject;
}

export default function FeaturedProject({ project }: FeaturedProjectProps) {
  const hasMedia = project.media && project.media.length > 0;
  
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950/30 rounded-lg overflow-hidden shadow-lg border border-gray-700 hover:border-indigo-500/50 transition-all duration-300">
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
          <h2 className="text-lg font-medium text-indigo-300 flex items-center">
            <span className="inline-block w-3 h-3 bg-indigo-400 rounded-full mr-2"></span>
            Son Eklenen Proje
          </h2>
          <span className="text-sm text-gray-400 flex items-center">
            <FaRegClock className="mr-1.5" />
            {formatDate(project.createdAt)}
          </span>
        </div>
        
        <div className="md:flex gap-6">
          {/* Media Column */}
          {hasMedia && (
            <div className="md:w-2/5 mb-4 md:mb-0">
              <div className="relative w-full h-52 md:h-full min-h-[200px] rounded-lg overflow-hidden">
                <Image
                  src={project.media[0].url}
                  alt={project.media[0].altText || project.title}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-50"></div>
                 
                <div className="absolute top-2 right-2 z-10">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    project.status === 'YAYINDA' ? 'bg-green-900/80 text-green-200' : 
                    project.status === 'GELISTIRILIYOR' ? 'bg-yellow-900/80 text-yellow-200' : 
                    'bg-gray-800/80 text-gray-300'
                  }`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                      project.status === 'YAYINDA' ? 'bg-green-400' : 
                      project.status === 'GELISTIRILIYOR' ? 'bg-yellow-400' : 'bg-gray-500'
                    }`}></span>
                    {project.status === 'YAYINDA' ? 'Yayında' : 
                    project.status === 'GELISTIRILIYOR' ? 'Geliştiriliyor' : 'Arşivde'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Content Column */}
          <div className={`${hasMedia ? 'md:w-3/5' : 'w-full'} flex flex-col`}>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3 hover:text-indigo-300 transition-colors duration-300">
              <Link href={`/projects/${project.id}`}>
                {project.title}
              </Link>
            </h3>
            
            <p className="text-gray-300 mb-4 line-clamp-3">
              {project.description}
            </p>
            
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tags.slice(0, 5).map((tag) => (
                <span 
                  key={tag}
                  className="px-2 py-1 bg-indigo-900/50 text-indigo-200 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 5 && (
                <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-md">
                  +{project.tags.length - 5}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-auto">
              {project.githubUrl && (
                <a 
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 transition-all hover:shadow-md flex items-center"
                >
                  <FaGithub className="mr-2" />
                  GitHub
                </a>
              )}
              
              {project.demoUrl && (
                <a 
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 transition-all hover:shadow-md flex items-center"
                >
                  <FaExternalLinkAlt className="mr-2" size={12} />
                  Demo
                </a>
              )}
              
              <Link 
                href={`/projects/${project.id}`}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-all hover:shadow-md ml-auto flex items-center"
              >
                Detaylar
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 