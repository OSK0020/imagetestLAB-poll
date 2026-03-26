'use client';

import React from 'react';
import { ExternalLink, Image as ImageIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageItem } from '@/hooks/usePollinations';

interface BentoGalleryProps {
  images: ImageItem[];
  onOpenImage: (url: string) => void;
  isUniform?: boolean;
}

export default function BentoGallery({ images, onOpenImage, isUniform = false }: BentoGalleryProps) {
  const handleDownload = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${prompt.slice(0, 20).replace(/[^a-z0-9]/gi, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className={cn("max-w-6xl mx-auto px-4 py-8", isUniform && "max-w-full")}>
      <div className={cn(
        "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
        isUniform && "lg:grid-cols-3"
      )}>
        {images.map((img) => (
          <div
            key={img.id}
            className="relative group overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-pointer aspect-square"
            onClick={() => onOpenImage(img.url)}
          >
            <img
              src={img.url}
              alt={img.prompt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <span className="bg-purple-600 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded text-white w-fit mb-1">
                {img.model}
              </span>
              <p className="text-white text-xs line-clamp-2 mb-2">
                {img.prompt}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); window.open(img.url, '_blank'); }}
                  className="flex items-center gap-1 text-[10px] bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Open
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload(img.url, img.prompt); }}
                  className="flex items-center gap-1 text-[10px] bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded transition-colors"
                >
                  <Download className="w-3 h-3" /> Save
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="col-span-full h-16" />
      )}
    </div>
  );
}
