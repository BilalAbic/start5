import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserProfileProject } from '@/types/user';

interface ProjectGridProps {
  projects: UserProfileProject[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-center shadow-lg border border-gray-700">
        <p className="text-gray-400">Bu kullanıcının henüz paylaşılmış bir projesi bulunmamaktadır.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: UserProfileProject }) {
  const hasMedia = project.media && project.media.length > 0;
  
  return (
    <Link 
      href={`/projects/${project.id}`}
      className="group block bg-gray-900 rounded-lg overflow-hidden shadow-lg h-full flex flex-col border border-gray-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-indigo-900/20 hover:shadow-xl hover:-translate-y-1"
    >
      {hasMedia ? (
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={project.media[0].url}
            alt={project.media[0].altText || project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-50"></div>
          
          {/* Status Badge */}
          <div className="absolute top-2 right-2 z-10">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
              project.status === 'YAYINDA' 
                ? 'bg-green-900/80 text-green-200' : 
              project.status === 'GELISTIRILIYOR' 
                ? 'bg-yellow-900/80 text-yellow-200' : 
                'bg-gray-800/80 text-gray-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                project.status === 'YAYINDA' ? 'bg-green-400' : 
                project.status === 'GELISTIRILIYOR' ? 'bg-yellow-400' : 'bg-gray-400'
              }`}></span>
              {project.status === 'YAYINDA' ? 'Yayında' : 
               project.status === 'GELISTIRILIYOR' ? 'Geliştiriliyor' : 'Arşivde'}
            </span>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-48 bg-gray-800 flex items-center justify-center group-hover:bg-gray-750 transition-colors duration-300">
          <span className="text-gray-500">Görsel yok</span>
          
          {/* Status Badge */}
          <div className="absolute top-2 right-2 z-10">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
              project.status === 'YAYINDA' 
                ? 'bg-green-900/80 text-green-200' : 
              project.status === 'GELISTIRILIYOR' 
                ? 'bg-yellow-900/80 text-yellow-200' : 
                'bg-gray-800/80 text-gray-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                project.status === 'YAYINDA' ? 'bg-green-400' : 
                project.status === 'GELISTIRILIYOR' ? 'bg-yellow-400' : 'bg-gray-400'
              }`}></span>
              {project.status === 'YAYINDA' ? 'Yayında' : 
               project.status === 'GELISTIRILIYOR' ? 'Geliştiriliyor' : 'Arşivde'}
            </span>
          </div>
        </div>
      )}
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-white mb-2 group-hover:text-indigo-300 transition-colors duration-300">{project.title}</h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-2 flex-1">{project.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag}
              className="px-2 py-0.5 bg-indigo-900/50 text-indigo-200 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded-md">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
        
        <div className="mt-auto flex justify-end">
          <span className="text-indigo-400 text-sm font-medium group-hover:text-indigo-300 transition-colors duration-300 flex items-center">
            Detaylar 
            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
} 