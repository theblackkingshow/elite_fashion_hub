import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Product } from '../types';

interface LightboxModalProps {
  product: Product;
  activeImageIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  product,
  activeImageIndex,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImageIndex === null) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        onNavigate((activeImageIndex - 1 + product.images.length) % product.images.length);
      }
      if (e.key === 'ArrowRight') {
        onNavigate((activeImageIndex + 1) % product.images.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImageIndex, product.images.length, onClose, onNavigate]);

  if (activeImageIndex === null) return null;

  const currentImg = product.images[activeImageIndex];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8">
      {/* Top Header controls */}
      <div className="absolute top-4 left-6 right-6 flex justify-between items-center text-white z-20">
        <div className="font-display text-[13px] uppercase tracking-[0.15em] font-light">
          {product.title} • <span className="font-mono">{activeImageIndex + 1} / {product.images.length}</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close Lightbox"
          className="text-white hover:opacity-70 p-2 cursor-pointer transition-opacity"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() =>
          onNavigate((activeImageIndex - 1 + product.images.length) % product.images.length)
        }
        aria-label="Previous image"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 p-3 transition-colors z-20 cursor-pointer hidden md:flex items-center justify-center"
      >
        <ChevronLeft className="w-8 h-8 stroke-[1.25]" />
      </button>

      <button
        onClick={() =>
          onNavigate((activeImageIndex + 1) % product.images.length)
        }
        aria-label="Next image"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 p-3 transition-colors z-20 cursor-pointer hidden md:flex items-center justify-center"
      >
        <ChevronRight className="w-8 h-8 stroke-[1.25]" />
      </button>

      {/* Main Image Container */}
      <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center">
        <img
          src={currentImg.src}
          alt={currentImg.alt}
          className="max-h-[78vh] w-auto object-contain shadow-2xl"
        />

        {currentImg.caption && (
          <div className="mt-4 text-center text-white/80 font-display text-[12px] uppercase tracking-[0.15em]">
            {currentImg.caption}
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {product.images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate(idx)}
            className={`w-10 h-14 bg-black/40 overflow-hidden border cursor-pointer transition-all ${
              activeImageIndex === idx ? 'border-white scale-105' : 'border-white/30 opacity-60 hover:opacity-100'
            }`}
          >
            <img src={img.src} alt="thumb" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};
