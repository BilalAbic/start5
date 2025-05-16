// Project type for example data
export interface Project {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  githubUrl?: string;
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
}

// User type
export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
} 