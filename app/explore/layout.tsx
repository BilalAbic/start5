import DashboardLayout from '../dashboard/layout';

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
} 