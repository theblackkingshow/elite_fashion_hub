import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedProducts: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onMoveToCart: (product: Product, size: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  savedProducts,
  onRemoveFromWishlist,
  onMoveToCart,
  onSelectProduct,
}) => {
  return (
    <>
      {/* Backdrop */}
      <div
        id="wishlist-backdrop"
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Wishlist Drawer */}
      <aside
        id="wishlist-drawer"
        aria-label="Wishlist Drawer"
        className={`fixed inset-y-0 right-0 z-[70] flex flex-col p-6 md:p-8 h-full w-full max-w-[380px] md:max-w-[440px] bg-[#fbf9f9] border-l border-[#e5e5e5] shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-5 border-b border-[#e5e5e5]">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-[20px] md:text-[24px] tracking-[0.1em] uppercase text-[#1b1c1c] font-medium">
              Saved For Later
            </h2>
            <span className="text-[13px] font-mono text-[#747878]">
              ({savedProducts.length})
            </span>
          </div>
          <button
            aria-label="Close saved items"
            onClick={onClose}
            className="text-[#1b1c1c] hover:opacity-60 transition-opacity p-2 -mr-2 cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {savedProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4">
            <p className="font-display text-[18px] text-[#1b1c1c] uppercase tracking-wider mb-2">
              No saved items yet
            </p>
            <p className="text-[14px] text-[#747878] leading-relaxed mb-6 max-w-[240px]">
              Tap "Save For Later" on any piece to curate your personal archive.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-4 divide-y divide-[#e5e5e5]">
            {savedProducts.map((product) => (
              <div key={product.id} className="pt-4 first:pt-0 flex gap-4">
                <div
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="w-20 h-26 bg-[#efeded] flex-shrink-0 overflow-hidden cursor-pointer group"
                >
                  <img
                    src={product.images[0].src}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4
                        onClick={() => {
                          onSelectProduct(product);
                          onClose();
                        }}
                        className="font-display text-[14px] font-medium text-[#1b1c1c] pr-2 cursor-pointer hover:underline"
                      >
                        {product.title}
                      </h4>
                      <button
                        onClick={() => onRemoveFromWishlist(product.id)}
                        aria-label="Remove item"
                        className="text-[#747878] hover:text-[#1b1c1c] transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.5]" />
                      </button>
                    </div>
                    <p className="text-[13px] font-mono text-[#1b1c1c] mt-1">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => {
                        onMoveToCart(product, product.sizes[1] || product.sizes[0]);
                        onRemoveFromWishlist(product.id);
                      }}
                      className="flex-1 bg-[#1b1c1c] text-white text-[11px] font-display uppercase tracking-wider py-2 px-3 flex items-center justify-center gap-1.5 hover:bg-[#5d5f5f] transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Bag (Size {product.sizes[1] || product.sizes[0]})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </>
  );
};
