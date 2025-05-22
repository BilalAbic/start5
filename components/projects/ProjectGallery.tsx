"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Media } from '@/types';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import { FiX, FiMaximize2 } from 'react-icons/fi';

type ProjectGalleryProps = {
  media: Media[];
};

const ProjectGallery = ({ media }: ProjectGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // If no media, return a placeholder
  if (!media || media.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 border border-gray-700 rounded-lg bg-gray-800">
        <p className="text-gray-400">Bu proje için görsel bulunmamaktadır</p>
      </div>
    );
  }

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto'; // Allow scrolling again
  };

  return (
    <div className="w-full">
      {/* Main Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {media.map((item, index) => (
          <div 
            key={item.id} 
            className="relative aspect-video bg-gray-700 rounded-md overflow-hidden cursor-pointer group"
            onClick={() => openLightbox(index)}
          >
            <Image
              src={item.url}
              alt={item.altText || 'Proje görseli'}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
              <FiMaximize2 className="text-white text-2xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center" onClick={closeLightbox}>
          <button 
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
          >
            <FiX className="text-white text-2xl" />
          </button>
          
          <div className="w-full max-w-5xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
            <Carousel
              showArrows={true}
              showThumbs={media.length > 1}
              showIndicators={media.length > 1}
              infiniteLoop={true}
              showStatus={false}
              selectedItem={activeIndex}
              className="lightbox-carousel"
            >
              {media.map((item) => (
                <div key={item.id} className="relative h-[70vh]">
                  <Image
                    src={item.url}
                    alt={item.altText || 'Proje görseli'}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectGallery; 