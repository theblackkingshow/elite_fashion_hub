import React, { useState } from 'react';
import {
  Star,
  ArrowRight,
  Heart,
  Plus,
  Minus,
  Check,
  Ruler,
  Truck,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Product } from '../types';

interface ProductInfoProps {
  product: Product;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  onAddToCart: (product: Product, size: string) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onOpenSizeGuide: () => void;
  onCategoryClick: (cat: string) => void;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  selectedSize,
  onSelectSize,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onOpenSizeGuide,
  onCategoryClick,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [fabricOpen, setFabricOpen] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1500);
  };

  return (
    <div id="product-info-panel" className="flex flex-col pt-6 lg:pt-0 lg:pl-8 xl:pl-12">
      <div className="sticky top-[96px]">
        {/* Breadcrumbs & Brand */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <nav
            id="product-breadcrumbs"
            className="flex items-center gap-2 font-display text-[11px] text-[#5d5f5f] uppercase tracking-[0.15em]"
          >
            <button
              onClick={() => onCategoryClick(product.category)}
              className="hover:text-[#1b1c1c] transition-colors cursor-pointer"
            >
              {product.category}
            </button>
            <span className="text-[#c4c7c7]">/</span>
            <span className="hover:text-[#1b1c1c] transition-colors cursor-pointer">
              {product.subCategory}
            </span>
          </nav>

          {/* Badges */}
          <div className="flex items-center gap-1.5">
            {product.officialStore && (
              <span className="inline-flex items-center gap-1 bg-[#1b1c1c] text-white text-[9px] font-mono uppercase px-2 py-0.5 tracking-wider">
                <ShieldCheck className="w-2.5 h-2.5" />
                Official Store
              </span>
            )}
            {product.jumiaExpress && (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-mono uppercase px-2 py-0.5 tracking-wider font-semibold">
                <Zap className="w-2.5 h-2.5 text-amber-700" />
                Express
              </span>
            )}
          </div>
        </div>

        {/* Brand Name */}
        {product.brand && (
          <span className="text-[12px] font-display uppercase tracking-[0.2em] text-[#747878] font-semibold block mb-1">
            {product.brand}
          </span>
        )}

        {/* Title & Price */}
        <h1
          id="product-title"
          className="font-display text-[26px] md:text-[32px] text-[#1b1c1c] mb-2 font-normal leading-[1.25] tracking-[0.01em]"
        >
          {product.title}
        </h1>

        <div className="flex items-baseline gap-3 mb-3 md:mb-4">
          <p id="product-price" className="font-mono text-[22px] md:text-[24px] font-semibold text-[#1b1c1c]">
            ${product.price.toFixed(2)} AUD
          </p>
          {product.originalPrice && (
            <div className="flex items-center gap-2">
              <span className="line-through text-[#747878] text-[15px] font-mono">
                ${product.originalPrice.toFixed(2)} AUD
              </span>
              <span className="text-rose-700 text-[11px] font-mono uppercase bg-rose-50 px-1.5 py-0.5 border border-rose-200 font-semibold">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Low Stock & Inventory Urgency Alert */}
        {(product.isLowStock || (product.stockCount !== undefined && product.stockCount <= 4)) && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>
              <strong>Low Inventory:</strong> Only {product.stockCount || 2} pieces remaining in Australian Atelier inventory.
            </span>
          </div>
        )}

        {/* Star Rating */}
        <div id="product-rating-row" className="flex items-center gap-1 mb-6 md:mb-8">
          <div className="flex items-center text-[#1b1c1c]">
            {[1, 2, 3, 4].map((star) => (
              <Star key={star} className="w-4 h-4 fill-[#1b1c1c] stroke-[#1b1c1c]" />
            ))}
            <div className="relative">
              <Star className="w-4 h-4 text-[#c4c7c7] stroke-[#c4c7c7]" />
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star className="w-4 h-4 fill-[#1b1c1c] stroke-[#1b1c1c]" />
              </div>
            </div>
          </div>
          <span className="font-display text-[12px] text-[#5d5f5f] ml-2 tracking-wider">
            ({product.rating.toFixed(1)})
          </span>
          <span className="text-[12px] text-[#747878] ml-2 font-mono">
            • {product.reviewCount} customer reviews
          </span>
        </div>

        {/* Description */}
        <div className="mb-8 md:mb-10">
          <p
            id="product-description"
            className="font-body text-[15px] md:text-[16px] text-[#444748] leading-[1.65]"
          >
            {product.description}
          </p>
        </div>

        {/* Size Selection */}
        <div className="mb-8 md:mb-10">
          <div className="flex justify-between items-end mb-3">
            <span className="font-display text-[12px] uppercase tracking-[0.15em] text-[#1b1c1c] font-semibold">
              Select Size / Dimension
            </span>
            <button
              id="btn-size-guide"
              onClick={onOpenSizeGuide}
              className="font-display text-[12px] text-[#5d5f5f] underline hover:text-[#1b1c1c] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Size Guide</span>
            </button>
          </div>

          <div id="size-selector-grid" className="flex flex-wrap gap-2.5">
            {product.sizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  id={`size-btn-${size.toLowerCase().replace(/\s+/g, '-')}`}
                  aria-pressed={isSelected}
                  onClick={() => onSelectSize(size)}
                  className={`h-12 px-5 font-mono text-[13px] uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center border ${
                    isSelected
                      ? 'bg-[#1b1c1c] text-[#ffffff] border-[#1b1c1c] shadow-xs'
                      : 'bg-transparent text-[#1b1c1c] border-[#c4c7c7] hover:border-[#1b1c1c]'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: Add to Bag & Wishlist */}
        <div className="flex gap-4 mb-8 md:mb-10">
          <button
            id="btn-add-to-cart"
            onClick={handleAdd}
            className="flex-1 bg-[#1b1c1c] text-[#ffffff] font-display text-[13px] uppercase tracking-[0.2em] py-5 px-8 flex justify-center items-center gap-3 transition-colors hover:bg-[#5d5f5f] cursor-pointer relative overflow-hidden group shadow-sm"
          >
            {addedAnimation ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Added to Bag</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Add to Shopping Bag</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>

          <button
            id="btn-toggle-wishlist"
            aria-label="Toggle Wishlist"
            onClick={() => onToggleWishlist(product)}
            className={`w-14 md:w-16 border flex items-center justify-center transition-all cursor-pointer ${
              isWishlisted
                ? 'border-[#1b1c1c] bg-[#1b1c1c] text-white'
                : 'border-[#c4c7c7] hover:border-[#1b1c1c] text-[#1b1c1c] hover:bg-[#efeded]'
            }`}
          >
            <Heart
              className={`w-5 h-5 stroke-[1.5] ${
                isWishlisted ? 'fill-white text-white' : ''
              }`}
            />
          </button>
        </div>

        {/* Fast Specs Summary Box */}
        <div className="bg-[#efeded]/60 p-4 border border-[#e5e5e5] mb-8 space-y-2 text-[13px] font-mono text-[#5d5f5f]">
          <div className="flex justify-between">
            <span>SKU Reference:</span>
            <span className="text-[#1b1c1c] font-semibold">{product.sku}</span>
          </div>
          <div className="flex justify-between">
            <span>Fabric / Material:</span>
            <span className="text-[#1b1c1c] text-right max-w-[220px] truncate">{product.fabric}</span>
          </div>
          <div className="flex justify-between">
            <span>Cut / Silhouette:</span>
            <span className="text-[#1b1c1c] text-right">{product.silhouette}</span>
          </div>
        </div>

        {/* Accordions */}
        <div className="border-t border-[#e5e5e5] divide-y divide-[#e5e5e5]">
          {/* Details & Construction Accordion */}
          <div>
            <button
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="w-full py-4 flex justify-between items-center text-left font-display text-[13px] uppercase tracking-[0.15em] text-[#1b1c1c] font-medium hover:text-[#5d5f5f] transition-colors cursor-pointer"
            >
              <span>Tailoring Details & Construction</span>
              {detailsOpen ? (
                <Minus className="w-4 h-4 stroke-[1.5]" />
              ) : (
                <Plus className="w-4 h-4 stroke-[1.5]" />
              )}
            </button>
            {detailsOpen && (
              <div className="pb-5 text-[14px] text-[#5d5f5f] font-body space-y-2.5 animate-in fade-in duration-200">
                <ul className="list-disc list-inside space-y-1.5">
                  {product.details.map((detail, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Fabric & Care Accordion */}
          <div>
            <button
              onClick={() => setFabricOpen(!fabricOpen)}
              className="w-full py-4 flex justify-between items-center text-left font-display text-[13px] uppercase tracking-[0.15em] text-[#1b1c1c] font-medium hover:text-[#5d5f5f] transition-colors cursor-pointer"
            >
              <span>Fabric Composition & Care</span>
              {fabricOpen ? (
                <Minus className="w-4 h-4 stroke-[1.5]" />
              ) : (
                <Plus className="w-4 h-4 stroke-[1.5]" />
              )}
            </button>
            {fabricOpen && (
              <div className="pb-5 text-[14px] text-[#5d5f5f] font-body space-y-3 animate-in fade-in duration-200">
                <div>
                  <strong className="text-[#1b1c1c] block mb-1 font-display text-[12px] uppercase tracking-wider">
                    Textile:
                  </strong>
                  <p>{product.fabric}</p>
                </div>
                <div>
                  <strong className="text-[#1b1c1c] block mb-1 font-display text-[12px] uppercase tracking-wider">
                    Care Guidelines:
                  </strong>
                  <ul className="list-disc list-inside space-y-1">
                    {product.careInstructions.map((care, idx) => (
                      <li key={idx}>{care}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Shipping & Delivery Accordion */}
          <div>
            <button
              onClick={() => setShippingOpen(!shippingOpen)}
              className="w-full py-4 flex justify-between items-center text-left font-display text-[13px] uppercase tracking-[0.15em] text-[#1b1c1c] font-medium hover:text-[#5d5f5f] transition-colors cursor-pointer"
            >
              <span>Delivery & Free Returns</span>
              {shippingOpen ? (
                <Minus className="w-4 h-4 stroke-[1.5]" />
              ) : (
                <Plus className="w-4 h-4 stroke-[1.5]" />
              )}
            </button>
            {shippingOpen && (
              <div className="pb-5 text-[14px] text-[#5d5f5f] font-body space-y-3 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-[#1b1c1c] mt-0.5 flex-shrink-0" />
                  <p>{product.shippingAndReturns.shipping}</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <RotateCcw className="w-4 h-4 text-[#1b1c1c] mt-0.5 flex-shrink-0" />
                  <p>{product.shippingAndReturns.returns}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
