import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserProfile } from '@/types/user';
import { formatDate } from '@/lib/utils';
import { FaGithub, FaTwitter, FaGlobe, FaShieldAlt } from 'react-icons/fa';

interface UserProfileCardProps {
  user: UserProfile;
  topLanguages: string[];
}

export default function UserProfileCard({ user, topLanguages }: UserProfileCardProps) {
  // Format display name
  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.username;
  
  // Format join date
  const joinDate = formatDate(user.createdAt);
  
  // Check if user is admin
  const isAdmin = user.role === 'ADMIN';
  
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          {user.profileImage ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500">
              <Image 
                src={user.profileImage} 
                alt={displayName} 
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-indigo-600 text-white text-2xl font-bold border-2 border-indigo-500">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
          )}
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-white">{displayName}</h1>
              {isAdmin && (
                <div 
                  className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-2 py-1 rounded-full"
                  title="Platform Yöneticisi"
                >
                  <FaShieldAlt size={12} />
                  <span>Admin</span>
                </div>
              )}
            </div>
            <p className="text-indigo-300 font-medium">@{user.username}</p>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          {user.bio && (
            <div>
              <h2 className="text-sm font-medium text-gray-400">Hakkında</h2>
              <p className="text-white mt-1">{user.bio}</p>
            </div>
          )}
          
          <div>
            <h2 className="text-sm font-medium text-gray-400">Katılım Tarihi</h2>
            <p className="text-white">{joinDate}</p>
          </div>
          
          <div>
            <h2 className="text-sm font-medium text-gray-400">Toplam Proje Sayısı</h2>
            <p className="text-white">{user.projectCount}</p>
          </div>
          
          {/* Social Links */}
          {(user.website || user.github || user.twitter) && (
            <div>
              <h2 className="text-sm font-medium text-gray-400">Bağlantılar</h2>
              <div className="flex items-center gap-3 mt-2">
                {user.github && (
                  <Link 
                    href={user.github.startsWith('http') ? user.github : `https://github.com/${user.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-300 hover:text-indigo-400 transition-colors duration-200"
                    title="GitHub"
                  >
                    <FaGithub size={22} />
                  </Link>
                )}
                {user.twitter && (
                  <Link 
                    href={user.twitter.startsWith('http') ? user.twitter : `https://twitter.com/${user.twitter}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-300 hover:text-indigo-400 transition-colors duration-200"
                    title="Twitter"
                  >
                    <FaTwitter size={22} />
                  </Link>
                )}
                {user.website && (
                  <Link 
                    href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-300 hover:text-indigo-400 transition-colors duration-200"
                    title="Web Sitesi"
                  >
                    <FaGlobe size={22} />
                  </Link>
                )}
              </div>
            </div>
          )}
          
          {topLanguages.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-400">Çalıştığı Diller</h2>
              <div className="flex flex-wrap gap-2 mt-1">
                {topLanguages.map((language) => (
                  <span 
                    key={language}
                    className="px-2 py-1 bg-indigo-900/50 text-indigo-200 text-xs rounded-md"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 