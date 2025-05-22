import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

// Add type assertion to include the Report model
const typedPrisma = prisma as PrismaClient & {
  report: any;
};

// POST: Create a new report
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json();
    
    // Validate request body
    const { projectId, reason, details } = body;
    
    if (!projectId || !reason) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Get the project to check if it exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }
    
    // Check for duplicate reports from the same user
    if (user?.userId) {
      const existingReport = await typedPrisma.report.findFirst({
        where: {
          projectId,
          reporterId: user.userId,
          status: { in: ["PENDING", "REVIEWED"] },
        },
      });
      
      if (existingReport) {
        return NextResponse.json(
          { message: "You have already reported this project" },
          { status: 409 }
        );
      }
    }
    
    // Create the report
    const report = await typedPrisma.report.create({
      data: {
        projectId,
        reason,
        details: details || null,
        reporterId: user?.userId || null,
        ownerId: project.userId, // Set the project owner as the report target
      },
    });
    
    return NextResponse.json(
      { message: "Report submitted successfully", report },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { message: "Error creating report" },
      { status: 500 }
    );
  }
}

// GET: List all reports (admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    
    // Check if user is admin
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const reason = searchParams.get("reason");
    
    // Build filter
    const filter: any = {};
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
                email: true,
                profileImage: true,
              },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            username: true,
            email: true,
            profileImage: true,
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
    console.error("Error getting reports:", error);
    return NextResponse.json(
      { message: "Error getting reports" },
      { status: 500 }
    );
  }
} 