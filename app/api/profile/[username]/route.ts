import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, props: { params: Promise<{ username: string }> }) {
  const params = await props.params;
  try {
    const username = params.username;

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        bio: true,
        website: true,
        github: true,
        twitter: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            projects: {
              where: {
                isPublic: true,
              },
            },
          },
        },
      },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's public projects
    const projects = await prisma.project.findMany({
      where: {
        userId: user.id,
        isPublic: true,
      },
      include: {
        media: {
          take: 1, // Include only the first media item for preview
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Extract programming languages from project tags
    const allTags = projects.flatMap(project => project.tags);
    const languageCounts = allTags.reduce((acc: Record<string, number>, tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    // Sort languages by frequency
    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([language]) => language);

    // Get the latest project
    const latestProject = projects.length > 0 ? projects[0] : null;

    return NextResponse.json({
      user: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        bio: user.bio,
        website: user.website,
        github: user.github,
        twitter: user.twitter,
        role: user.role,
        createdAt: user.createdAt,
        projectCount: user._count.projects,
      },
      projects,
      latestProject,
      topLanguages,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
} 