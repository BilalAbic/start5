import React from 'react';
import Image from 'next/image';
import { Media } from '@/types';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';

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

  return (
    <div className="w-full">
      <Carousel
        showArrows={true}
        showThumbs={true}
        showIndicators={media.length > 1}
        infiniteLoop={true}
        showStatus={false}
        className="project-gallery"
      >
        {media.map((item) => (
          <div key={item.id} className="relative h-80">
            <Image
              src={item.url}
              alt={item.altText || 'Project image'}
              fill
              className="object-contain"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default ProjectGallery; 