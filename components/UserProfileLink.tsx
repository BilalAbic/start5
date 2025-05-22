import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface UserProfileLinkProps {
  username: string;
  profileImage?: string | null;
  displayName?: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export default function UserProfileLink({
  username,
  profileImage,
  displayName,
  size = 'md',
  showName = true
}: UserProfileLinkProps) {
  // Size classes mapping
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg'
  };
  
  const avatarSize = sizeClasses[size];
  
  return (
    <Link
      href={`/u/${username}`}
      className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
    >
      {profileImage ? (
        <div className={`relative ${avatarSize} rounded-full overflow-hidden`}>
          <Image 
            src={profileImage} 
            alt={displayName || username} 
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className={`flex items-center justify-center ${avatarSize} rounded-full bg-indigo-600 text-white font-medium`}>
          {username.substring(0, 1).toUpperCase()}
        </div>
      )}
      
      {showName && (
        <span className="text-indigo-400 hover:text-indigo-300 font-medium">
          @{username}
        </span>
      )}
    </Link>
  );
} 