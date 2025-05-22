import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { createNotification } from "@/lib/utils/notificationService";

// Add type assertion to include the Report model
const typedPrisma = prisma as PrismaClient & {
  report: any;
};

// Helper function to generate status message for notifications
function getStatusMessage(status: string): string {
  switch (status) {
    case "REVIEWED":
      return "Raporunuz incelendi. İlgili ekibimiz konu üzerinde çalışıyor.";
    case "IGNORED":
      return "Raporunuz incelendi ancak herhangi bir ihlal tespit edilmedi.";
    case "RESOLVED":
      return "Raporunuz incelendi ve gerekli işlemler tamamlandı.";
    default:
      return "Raporunuzun durumu güncellendi.";
  }
}

// GET: Get a specific report (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    
    // Check if user is admin
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }
    
    const reportId = params.id;
    
    const report = await typedPrisma.report.findUnique({
      where: { id: reportId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            userId: true,
            status: true,
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                profileImage: true,
                status: true,
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
    });
    
    if (!report) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(report);
  } catch (error) {
    console.error("Error getting report:", error);
    return NextResponse.json(
      { message: "Error getting report" },
      { status: 500 }
    );
  }
}

// PATCH: Update a report status (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    
    // Check if user is admin
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { status } = body;
    
    // Validate status
    if (!status || !["PENDING", "REVIEWED", "IGNORED", "RESOLVED"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status value" },
        { status: 400 }
      );
    }
    
    const reportId = params.id;
    
    // Check if report exists and fetch reporter info
    const existingReport = await typedPrisma.report.findUnique({
      where: { id: reportId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        reporter: true
      }
    });
    
    if (!existingReport) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }
    
    // Only create notification if status has changed and it's not PENDING
    const statusChanged = existingReport.status !== status && status !== "PENDING";
    
    // Update report status
    const updatedReport = await typedPrisma.report.update({
      where: { id: reportId },
      data: { 
        status,
        updatedAt: new Date(),
      },
    });
    
    // Create notification for the reporter if status changed and reporter exists
    if (statusChanged && existingReport.reporter && existingReport.reporterId) {
      // Generate notification message and link
      const message = getStatusMessage(status);
      const projectTitle = existingReport.project?.title || "Bir proje";
      const fullMessage = `${projectTitle} için ${message}`;
      
      // Create notification link to account reports page
      const link = "/account/reports";
      
      await createNotification({
        userId: existingReport.reporterId,
        type: "report",
        message: fullMessage,
        link
      });
    }
    
    return NextResponse.json({
      message: "Report status updated successfully",
      report: updatedReport,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { message: "Error updating report" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a report (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    
    // Check if user is admin
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }
    
    const reportId = params.id;
    
    // Check if report exists
    const existingReport = await typedPrisma.report.findUnique({
      where: { id: reportId },
    });
    
    if (!existingReport) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }
    
    // Delete the report
    await typedPrisma.report.delete({
      where: { id: reportId },
    });
    
    return NextResponse.json({
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { message: "Error deleting report" },
      { status: 500 }
    );
  }
} 