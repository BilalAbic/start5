import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

// Add type assertion to include the Report model
const typedPrisma = prisma as PrismaClient & {
  report: any;
};

// GET: List reports submitted by the authenticated user
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    
    // Check if user is authenticated
    if (!user || !user.userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const reason = searchParams.get("reason");
    
    // Build filter
    const filter: any = { reporterId: user.userId };
    if (status) filter.status = status;
    if (reason) filter.reason = reason;
    
    // Get reports with pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    const reports = await typedPrisma.report.findMany({
      where: filter,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            userId: true,
            user: {
              select: {
                id: true,
                username: true,
                profileImage: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
    });
    
    const totalReports = await typedPrisma.report.count({
      where: filter,
    });
    
    return NextResponse.json({
      reports,
      totalReports,
      currentPage: page,
      totalPages: Math.ceil(totalReports / limit),
    });
  } catch (error) {
    console.error("Error getting user reports:", error);
    return NextResponse.json(
      { message: "Error getting reports" },
      { status: 500 }
    );
  }
} 