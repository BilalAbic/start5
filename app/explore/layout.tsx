import { Metadata } from 'next';
import DashboardLayout from '../dashboard/layout';

export const metadata: Metadata = {
  title: 'Keşfet | Start5',
  description: 'Start5 geliştirici topluluğunun açık kaynak projelerini keşfedin, ilham alın ve katkıda bulunun.',
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"
        aria-hidden="true"
      />
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-gray-900/95 to-gray-900/90 pointer-events-none"
        aria-hidden="true"
      />
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
} 