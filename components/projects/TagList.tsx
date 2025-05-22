import React from 'react';
import Link from 'next/link';

type TagListProps = {
  tags: string[];
};

const TagList = ({ tags }: TagListProps) => {
  if (!tags || tags.length === 0) {
    return (
      <p className="text-gray-400">Teknoloji bilgisi eklenmemiş</p>
    );
  }

  const tagColors = [
    'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30',
    'bg-green-500/20 text-green-300 hover:bg-green-500/30',
    'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30',
    'bg-pink-500/20 text-pink-300 hover:bg-pink-500/30',
    'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30',
    'bg-red-500/20 text-red-300 hover:bg-red-500/30',
    'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30',
    'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30',
  ];

  // Get a consistent color based on the tag name
  const getColorClass = (tag: string) => {
    const index = tag.length % tagColors.length;
    return tagColors[index];
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <Link 
          key={index}
          href={`/explore?tag=${encodeURIComponent(tag)}`}
        >
          <span
            className={`${getColorClass(tag)} px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors`}
          >
            {tag}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default TagList; 