import React, { useState } from 'react';
import { Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface ProductGalleryProps {
  product: Product;
  onOpenLightbox: (index: number) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  product,
  onOpenLightbox,
}) => {
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);

  return (
    <div id="product-gallery-container" className="flex flex-col gap-1 w-full">
      {/* Desktop & Tablet 2x2 Grid (Exact screenshot match) */}
      <div className="hidden md:grid md:grid-cols-2 gap-1 md:gap-1.5">
        {product.images.map((image, index) => (
          <div
            key={index}
            id={`gallery-image-${index}`}
            onClick={() => onOpenLightbox(index)}
            className="aspect-[3/4] w-full bg-[#efeded] relative group overflow-hidden cursor-zoom-in"
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
              loading={index === 0 ? 'eager' : 'lazy'}
            />

            {/* Hover Editorial Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />

            {/* Bottom Caption & Expand Badge */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              {image.caption ? (
                <span className="bg-[#fbf9f9]/90 backdrop-blur-xs text-[#1b1c1c] text-[10px] uppercase font-mono tracking-wider px-2.5 py-1">
                  {image.caption}
                </span>
              ) : (
                <span />
              )}
              <div className="w-7 h-7 bg-[#1b1c1c] text-white flex items-center justify-center">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* View index tag in top corner */}
            <span className="absolute top-3 left-3 bg-[#fbf9f9]/80 backdrop-blur-xs text-[#747878] text-[9px] font-mono px-1.5 py-0.5 pointer-events-none">
              0{index + 1} / 0{product.images.length}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile Swipeable Gallery with Indicator */}
      <div className="md:hidden flex flex-col gap-2">
        <div
          onClick={() => onOpenLightbox(mobileActiveIndex)}
          className="aspect-[3/4] w-full bg-[#efeded] relative overflow-hidden cursor-zoom-in"
        >
          <img
            src={product.images[mobileActiveIndex]?.src}
            alt={product.images[mobileActiveIndex]?.alt}
            className="w-full h-full object-cover"
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setMobileActiveIndex((prev) =>
                prev === 0 ? product.images.length - 1 : prev - 1
              );
            }}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 flex items-center justify-center text-[#1b1c1c] shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setMobileActiveIndex((prev) =>
                prev === product.images.length - 1 ? 0 : prev + 1
              );
            }}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 flex items-center justify-center text-[#1b1c1c] shadow-xs cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 right-3 bg-black/75 text-white text-[10px] font-mono px-2 py-1">
            0{mobileActiveIndex + 1} / 0{product.images.length}
          </div>
        </div>

        {/* Mobile Thumbnails */}
        <div className="grid grid-cols-4 gap-1.5">
          {product.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMobileActiveIndex(idx)}
              className={`aspect-[3/4] bg-[#efeded] overflow-hidden border cursor-pointer ${
                mobileActiveIndex === idx ? 'border-[#1b1c1c]' : 'border-transparent opacity-60'
              }`}
            >
              <img src={img.src} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
