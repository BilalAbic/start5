import React from 'react';

type ProjectStatusBadgeProps = {
  status: string;
};

const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  switch (status) {
    case 'GELISTIRILIYOR':
      return (
        <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium">
          Geliştiriliyor
        </span>
      );
    case 'YAYINDA':
      return (
        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
          Yayında
        </span>
      );
    case 'ARSIVDE':
      return (
        <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 text-sm font-medium">
          Arşivde
        </span>
      );
    case 'PLANLANAN':
      return (
        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">
          Planlanıyor
        </span>
      );
    case 'DURDURULDU':
      return (
        <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-medium">
          Durduruldu
        </span>
      );
    default:
      return null;
  }
};

export default ProjectStatusBadge; 