import { cookies } from 'next/headers';
import { Media } from '@/types';
import { NextRequest } from 'next/server';
import { JWTPayload } from './auth';

type Project = {
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
  userId?: string;
  media?: Media[];
};

// Get all projects for the current user
export async function getProjects(): Promise<Project[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/projects`, {
      headers: {
        Cookie: cookies().toString(),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Get all public projects
export async function getPublicProjects(limit?: number): Promise<Project[]> {
  try {
    let url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/public-projects`;
    if (limit) {
      url += `?limit=${limit}`;
    }
    
    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch public projects');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching public projects:', error);
    return [];
  }
}

// Get a specific project by ID
export async function getProject(id: string): Promise<Project | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/projects/${id}`, {
      headers: {
        Cookie: cookies().toString(),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch project');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

// Get media for a project
export async function getProjectMedia(projectId: string): Promise<Media[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/projects/${projectId}/media`, {
      headers: {
        Cookie: cookies().toString(),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch project media');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching project media:', error);
    return [];
  }
}

/**
 * API hata yanıtı oluşturur
 */
export function errorResponse(
  message: string,
  status: number = 500,
  additionalData: Record<string, any> = {}
) {
  return Response.json(
    { error: message, ...additionalData },
    { status }
  );
}

/**
 * Kullanıcının giriş yapmış olup olmadığını kontrol eder
 */
export async function isAuthenticated(req: NextRequest): Promise<JWTPayload | null> {
  try {
    // Burada token kontrolü yapılır
    // Tüm rotalarda kullanılabilecek ortak bir yetkilendirme fonksiyonu
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return null;
    }

    // Token'ı çöz ve kullanıcı bilgilerini döndür
    // Not: Gerçek implementasyonda jose veya jsonwebtoken kullanılmalıdır
    const { isAuthenticated } = await import('./auth');
    return await isAuthenticated(req);

  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

/**
 * Kullanıcının admin olup olmadığını kontrol eder
 */
export async function isAdmin(req: NextRequest): Promise<boolean> {
  try {
    const user = await isAuthenticated(req);
    return user?.role === 'ADMIN';
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

/**
 * Admin API isteklerini yetkilendirir
 * Admin değilse 403 hatasını fırlatır
 */
export async function adminGuard(req: NextRequest): Promise<Response | null> {
  const isUserAdmin = await isAdmin(req);

  if (!isUserAdmin) {
    return errorResponse('Bu işlem için admin yetkileri gereklidir', 403);
  }

  return null; // Yetkilendirme başarılı
}

/**
 * Bir API route'u için gerekli yetkilendirme kontrollerini yapar
 * 
 * @param handler API handler fonksiyonu
 * @param options Yetkilendirme seçenekleri
 * @returns API yanıtı
 */
export function withAuth(
  handler: (req: NextRequest, user: JWTPayload) => Promise<Response>,
  options: { adminOnly?: boolean } = {}
) {
  return async (req: NextRequest) => {
    const user = await isAuthenticated(req);
    
    if (!user) {
      return errorResponse('Kimlik doğrulama gerekli', 401);
    }

    if (options.adminOnly && user.role !== 'ADMIN') {
      return errorResponse('Bu işlem için admin yetkileri gereklidir', 403);
    }

    return handler(req, user);
  };
} 