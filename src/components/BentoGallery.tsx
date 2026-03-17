'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Image as ImageIcon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageItem {
  id: string;
  url: string;
  prompt: string;
  model: string;
}

interface BentoGalleryProps {
  images: ImageItem[];
  onOpenImage: (url: string) => void;
}

export default function BentoGallery({ images, onOpenImage }: BentoGalleryProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 auto-rows-[300px]">
        <AnimatePresence mode="popLayout">
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.6,
                delay: index * 0.05,
                ease: [0.23, 1, 0.32, 1]
              }}
              className={cn(
                "group relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5 backdrop-blur-sm cursor-pointer",
                index % 5 === 0 ? "md:col-span-2 md:row-span-2" : "",
                index % 7 === 0 ? "md:row-span-2" : ""
              )}
              onClick={() => onOpenImage(img.url)}
            >
              {/* Image Container */}
              <div className="absolute inset-0 z-0">
                <img
                  src={img.url}
                  alt={img.prompt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              </div>

              {/* Overlay Content */}
              <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-purple-600/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white">
                    {img.model}
                  </span>
                </div>
                <p className="text-white font-medium text-lg line-clamp-2 leading-snug mb-4">
                  "{img.prompt}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <ExternalLink className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Static Badge (Top Right) */}
              <div className="absolute top-4 right-4 z-20 opacity-100 group-hover:opacity-0 transition-opacity">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-xl">
                  <ImageIcon className="w-4 h-4 text-white/70" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {images.length === 0 && (
          <div className="col-span-full h-96 flex flex-col items-center justify-center text-slate-400 dark:text-gray-400 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem]">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-xl font-medium opacity-50">Enter a prompt to see the magic happen.</p>
          </div>
        )}
      </div>
    </div>
  );
}
