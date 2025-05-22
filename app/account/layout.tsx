import DashboardLayout from '../dashboard/layout';
import ClientToaster from '@/components/auth/ClientToaster';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      {children}
      <ClientToaster />
    </DashboardLayout>
  );
} 