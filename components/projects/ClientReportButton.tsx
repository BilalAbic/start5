'use client';

import dynamic from 'next/dynamic';

// Dynamically import ReportProjectButton with ssr:false in this client component
const ReportProjectButton = dynamic(() => import('@/components/projects/ReportProjectButton'), { 
  ssr: false 
});

interface ClientReportButtonProps {
  projectId: string;
  className?: string;
}

export default function ClientReportButton({ projectId, className }: ClientReportButtonProps) {
  return <ReportProjectButton projectId={projectId} className={className} />;
} 