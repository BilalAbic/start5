import CommentList from '@/components/admin/comments/CommentList';

export const metadata = {
  title: 'Admin - Yorum Yönetimi',
  description: 'Platformdaki tüm yorumları yönetin.',
};

export default async function AdminCommentsPage() {

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 text-white min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Yorum Moderasyon Merkezi
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Platformdaki tüm projelere yapılan yorumları buradan yönetebilirsiniz.
        </p>
      </header>

      <CommentList />
      
    </div>
  );
} 