import { Media } from './index';

export interface UserProfile {
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  bio?: string | null;
  website?: string | null;
  github?: string | null;
  twitter?: string | null;
  role?: string;
  createdAt: string | Date;
  projectCount: number;
}

export interface UserProfileResponse {
  user: UserProfile;
  projects: UserProfileProject[];
  latestProject: UserProfileProject | null;
  topLanguages: string[];
}

export interface UserProfileProject {
  id: string;
  title: string;
  description: string;
  githubUrl: string;
  demoUrl?: string | null;
  status: 'GELISTIRILIYOR' | 'YAYINDA' | 'ARSIVDE';
  isPinned: boolean;
  tags: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  media: Media[];
} 