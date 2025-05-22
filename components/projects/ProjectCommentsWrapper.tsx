'use client';

import dynamic from 'next/dynamic';
import { JWTPayload } from '@/lib/auth'; // Assuming JWTPayload is the type for currentUser

// Dynamically import the CommentSection component
const CommentSection = dynamic(() => import('@/components/projects/CommentSection'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8 animate-pulse">
      <div className="h-7 w-32 bg-gray-700 rounded mb-6"></div>
      <div className="h-24 bg-gray-700 rounded mb-4"></div>
      <div className="flex justify-end">
        <div className="h-10 w-24 bg-gray-700 rounded"></div>
      </div>
    </div>
  ),
});

type ProjectCommentsWrapperProps = {
  projectId: string;
  currentUser: JWTPayload | null;
};

export default function ProjectCommentsWrapper({ projectId, currentUser }: ProjectCommentsWrapperProps) {
  return (
    <CommentSection
      projectId={projectId}
      isAuthenticated={!!currentUser}
      currentUserId={currentUser?.userId}
    />
  );
} 