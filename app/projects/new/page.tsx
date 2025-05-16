import ProjectForm from '@/components/projects/ProjectForm';

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Yeni Proje Oluştur</h1>
        <p className="text-gray-300">Yeni bir proje eklemek için aşağıdaki formu doldurun</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <ProjectForm />
      </div>
    </div>
  );
} 