export interface Media {
  id: string;
  projectId: string;
  url: string;
  publicId: string;
  altText?: string | null;
  createdAt?: string;
}

export interface Comment {
  id: string;
  content: string;
  projectId: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    username?: string;
    email: string;
    profileImage?: string | null;
  };
} 