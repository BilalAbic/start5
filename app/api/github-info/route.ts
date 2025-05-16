/**
 * GitHub API Entegrasyonu
 * 
 * Bu API route GitHub repository URL'inden repo bilgilerini alır:
 * - Proje adı
 * - Açıklama
 * - Etiketler (topics)
 * - Kullanılan diller (languages)
 * - Demo URL (homepage)
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// In-memory cache to avoid rate limiting
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 saat

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const repoUrl = url.searchParams.get('url');

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'GitHub URL parametresi gerekli' },
        { status: 400 }
      );
    }

    // GitHub URL formatını kontrol et
    const githubUrlPattern = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?.*$/;
    const match = repoUrl.match(githubUrlPattern);

    if (!match) {
      return NextResponse.json(
        { error: 'Geçerli bir GitHub repository URL adresi değil' },
        { status: 400 }
      );
    }

    const owner = match[1];
    const repo = match[2];

    // Cache kontrolü
    const cacheKey = `${owner}/${repo}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedData.data);
    }

    // GitHub API istekleri
    const [repoInfo, languages, topics] = await Promise.all([
      fetchRepoInfo(owner, repo),
      fetchLanguages(owner, repo),
      fetchTopics(owner, repo)
    ]);

    const result = {
      name: repoInfo.name,
      description: repoInfo.description,
      homepage: repoInfo.homepage || null,
      topics: topics,
      languages: Object.keys(languages)
    };

    // Veriyi cache'e kaydet
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('GitHub API error:', error);
    
    if (error.status === 404) {
      return NextResponse.json(
        { error: 'GitHub repository bulunamadı' },
        { status: 404 }
      );
    }
    
    if (error.status === 403) {
      return NextResponse.json(
        { error: 'GitHub API rate limit aşıldı. Lütfen daha sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Repository bilgileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

async function fetchRepoInfo(owner: string, repo: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: getGitHubHeaders(),
  });

  if (!response.ok) {
    const error = new Error(`GitHub API error: ${response.statusText}`);
    (error as any).status = response.status;
    throw error;
  }

  return await response.json();
}

async function fetchLanguages(owner: string, repo: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
    headers: getGitHubHeaders(),
  });

  if (!response.ok) {
    const error = new Error(`GitHub API error: ${response.statusText}`);
    (error as any).status = response.status;
    throw error;
  }

  return await response.json();
}

async function fetchTopics(owner: string, repo: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/topics`, {
    headers: {
      ...getGitHubHeaders(),
      'Accept': 'application/vnd.github.mercy-preview+json'
    },
  });

  if (!response.ok) {
    const error = new Error(`GitHub API error: ${response.statusText}`);
    (error as any).status = response.status;
    throw error;
  }

  const data = await response.json();
  return data.names || [];
}

function getGitHubHeaders() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || 'Start5-App';
  
  return {
    'User-Agent': userAgent,
    // GitHub personal access token eklenebilir (opsiyonel)
    // 'Authorization': `token ${process.env.GITHUB_TOKEN}`,
  };
} 