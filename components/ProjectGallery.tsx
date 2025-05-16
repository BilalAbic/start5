import React from 'react';
import Image from 'next/image';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import { Media } from '@/types';

type ProjectGalleryProps = {
  media: Media[];
};

const ProjectGallery = ({ media }: ProjectGalleryProps) => {
  // If no media, return a placeholder
  if (!media || media.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500">No media available for this project</p>
      </div>
    );
  }

  // Format data for react-image-gallery
  const images = media.map((item) => ({
    original: item.url,
    thumbnail: item.url,
    originalAlt: item.altText || 'Project image',
    thumbnailAlt: item.altText || 'Project thumbnail',
  }));

  return (
    <div className="w-full">
      <ImageGallery
        items={images}
        showPlayButton={false}
        showFullscreenButton={true}
        showThumbnails={true}
        showNav={true}
        showBullets={media.length > 1}
      />
    </div>
  );
};

export default ProjectGallery; 