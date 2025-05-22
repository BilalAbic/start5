import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import UserProfileCard from '@/components/projects/UserProfileCard';
import FeaturedProject from '@/components/projects/FeaturedProject';
import ProjectGrid from '@/components/projects/ProjectGrid';
import { UserProfileResponse } from '@/types/user';

type Props = {
  params: Promise<{ username: string }>
};

// Helper for building absolute URLs
function getApiUrl(path: string) {
  // For client-side rendering, we can use relative URLs
  if (typeof window !== 'undefined') {
    return path;
  }
  
  // For server components, we need an absolute URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
    ? process.env.NEXT_PUBLIC_BASE_URL
    : process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : '';
      
  // Always return absolute URL for server components
  return `${baseUrl}${path}`; 
}

// SEO Metadata
export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params;
  const username = params.username;

  // Fetch user data
  try {
    const response = await fetch(getApiUrl(`/api/profile/${username}`), {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return {
        title: 'Kullanıcı Bulunamadı | Start5',
        description: 'Bu kullanıcı bulunamadı veya mevcut değil.',
      };
    }
    
    const profileData: UserProfileResponse = await response.json();
    const user = profileData.user;
    
    // Build display name
    const displayName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.username;
      
    // Add admin badge if user is admin
    const titlePrefix = user.role === 'ADMIN' ? '👑 ' : '';
    
    return {
      title: `${titlePrefix}${displayName} (@${user.username}) | Start5`,
      description: `${displayName} adlı kullanıcının profili ve projeleri. ${user.projectCount} paylaşılan proje.`,
      openGraph: {
        title: `${titlePrefix}${displayName} (@${user.username}) | Start5`,
        description: `${displayName} adlı kullanıcının profili ve projeleri. ${user.projectCount} paylaşılan proje.`,
        images: [user.profileImage || '/images/default-profile.png'],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${titlePrefix}${displayName} (@${user.username}) | Start5`,
        description: `${displayName} adlı kullanıcının profili ve projeleri. ${user.projectCount} paylaşılan proje.`,
        images: [user.profileImage || '/images/default-profile.png'],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Kullanıcı Profili | Start5',
      description: 'Kullanıcı profili.',
    };
  }
}

export default async function UserProfilePage(props: Props) {
  const params = await props.params;
  const username = params.username;

  // Fetch user profile data
  try {
    const response = await fetch(getApiUrl(`/api/profile/${username}`), {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      notFound(); // This will render the closest not-found page
    }
    
    const profileData: UserProfileResponse = await response.json();
    const { user, projects, latestProject, topLanguages } = profileData;
    
    return (
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column 1: User Profile Card */}
          <div className="lg:col-span-4">
            <UserProfileCard user={user} topLanguages={topLanguages} />
          </div>
          
          {/* Column 2-3: Latest Project & Projects Grid */}
          <div className="lg:col-span-8 space-y-6">
            {/* Featured Project */}
            {latestProject && <FeaturedProject project={latestProject} />}
            
            {/* Projects Heading */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Tüm Projeler</h2>
              <span className="text-gray-400 text-sm">Toplam: {projects.length}</span>
            </div>
            
            {/* Projects Grid */}
            <ProjectGrid projects={projects} />
            
            {/* No Projects Message */}
            {projects.length === 0 && (
              <div className="bg-gray-900 rounded-lg p-6 text-center shadow-lg border border-gray-700">
                <p className="text-gray-400">Bu kullanıcının henüz paylaşılmış bir projesi bulunmamaktadır.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error fetching user profile:', error);
    notFound(); // Render not-found page on error
  }
} 