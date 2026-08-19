import React from 'react';
import { X, Sparkles, User, Users, Baby, TrendingUp, Tag, ArrowRight, Grid, Lock } from 'lucide-react';
import { CollectionCategory, Product } from '../types';

interface CollectionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: CollectionCategory;
  onSelectCategory: (category: CollectionCategory) => void;
  products: Product[];
  currentProductId: string;
  onSelectProduct: (product: Product) => void;
  onOpenCategoryCatalog: (category: CollectionCategory) => void;
  onOpenAdmin?: () => void;
}

export const CollectionsDrawer: React.FC<CollectionsDrawerProps> = ({
  isOpen,
  onClose,
  activeCategory,
  onSelectCategory,
  products,
  currentProductId,
  onSelectProduct,
  onOpenCategoryCatalog,
  onOpenAdmin,
}) => {
  const categories: { id: CollectionCategory; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'Men',
      label: "Men's Collection",
      icon: <User className="w-5 h-5 stroke-[1.5]" />,
      count: products.filter((p) => p.category === 'Men' || p.gender === 'Men').length,
    },
    {
      id: 'Women',
      label: "Women's Collection",
      icon: <Users className="w-5 h-5 stroke-[1.5]" />,
      count: products.filter((p) => p.category === 'Women' || p.gender === 'Women').length,
    },
    {
      id: 'Kids',
      label: "Kids & Young Explorers",
      icon: <Baby className="w-5 h-5 stroke-[1.5]" />,
      count: products.filter((p) => p.category === 'Kids' || p.gender === 'Kids').length,
    },
    {
      id: 'New Arrivals',
      label: 'New Arrivals',
      icon: <Sparkles className="w-5 h-5 stroke-[1.5]" />,
      count: products.filter((p) => p.isNewArrival).length,
    },
    {
      id: 'Trending',
      label: 'Trending Pieces',
      icon: <TrendingUp className="w-5 h-5 stroke-[1.5]" />,
      count: products.filter((p) => p.isTrending).length,
    },
    {
      id: 'Sale',
      label: 'Archival Sale',
      icon: <Tag className="w-5 h-5 stroke-[1.5]" />,
      count: products.filter((p) => p.isSale || p.originalPrice).length,
    },
  ];

  const filteredProducts = products.filter((p) => {
    if (activeCategory === 'Men') return p.category === 'Men' || p.gender === 'Men';
    if (activeCategory === 'Women') return p.category === 'Women' || p.gender === 'Women';
    if (activeCategory === 'Kids') return p.category === 'Kids' || p.gender === 'Kids';
    if (activeCategory === 'New Arrivals') return p.isNewArrival;
    if (activeCategory === 'Trending') return p.isTrending;
    if (activeCategory === 'Sale') return p.isSale || p.originalPrice;
    return true;
  });

  return (
    <>
      {/* Backdrop */}
      <div
        id="collections-backdrop"
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <aside
        id="nav-drawer"
        aria-label="Collections Navigation Drawer"
        className={`fixed inset-y-0 right-0 z-[70] flex flex-col p-6 md:p-8 h-full w-full max-w-[360px] md:max-w-[420px] bg-[#f5f3f3] border-l border-[#e5e5e5] shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-[#e5e5e5] pb-5">
          <div>
            <h2 className="font-display text-[26px] md:text-[30px] tracking-[0.04em] uppercase text-[#1b1c1c] font-light">
              COLLECTIONS
            </h2>
            <p className="text-[11px] text-[#747878] font-mono mt-0.5">SELECT CATEGORY OR PIECE</p>
          </div>
          <button
            id="close-drawer"
            aria-label="Close collections menu"
            onClick={onClose}
            className="text-[#1b1c1c] hover:opacity-60 transition-opacity p-2 -mr-2 cursor-pointer"
          >
            <X className="w-6 h-6 stroke-[1.5]" />
          </button>
        </div>

        {/* Navigation Categories */}
        <nav className="flex flex-col gap-2 mb-6">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <div key={cat.id} className="flex items-center gap-1">
                <button
                  id={`cat-btn-${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex-1 flex items-center justify-between py-3 px-3.5 text-left transition-colors font-display text-[15px] cursor-pointer ${
                    isActive
                      ? 'text-[#1b1c1c] bg-[#e3e2e2] font-semibold'
                      : 'text-[#5d5f5f] hover:bg-[#eae8e7] hover:text-[#1b1c1c]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={isActive ? 'text-[#1b1c1c]' : 'text-[#747878]'}>
                      {cat.icon}
                    </span>
                    <span>{cat.label}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#747878]">
                    {cat.count}
                  </span>
                </button>

                <button
                  onClick={() => {
                    onOpenCategoryCatalog(cat.id);
                    onClose();
                  }}
                  title={`View all ${cat.label}`}
                  className="p-3 bg-white border border-[#e5e5e5] hover:bg-[#1b1c1c] hover:text-white transition-colors cursor-pointer text-[#1b1c1c]"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </nav>

        {/* Action Button to Open Full Category Catalog */}
        <button
          onClick={() => {
            onOpenCategoryCatalog(activeCategory);
            onClose();
          }}
          className="w-full bg-[#1b1c1c] text-white font-display text-[11px] uppercase tracking-[0.15em] py-3.5 mb-6 flex items-center justify-center gap-2 hover:bg-[#5d5f5f] transition-colors cursor-pointer"
        >
          <span>Browse All {activeCategory} ({filteredProducts.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {/* Category Product Highlights */}
        <div className="pt-4 border-t border-[#e5e5e5] flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className="font-display text-[11px] uppercase tracking-[0.15em] text-[#747878] font-semibold">
              Curated {activeCategory} Pieces
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {filteredProducts.map((product) => {
              const isCurrent = product.id === currentProductId;
              return (
                <div
                  key={product.id}
                  id={`item-card-${product.id}`}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className={`group flex items-center gap-3.5 p-2.5 border transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-[#1b1c1c] bg-white shadow-xs'
                      : 'border-[#e5e5e5] bg-white/60 hover:bg-white hover:border-[#747878]'
                  }`}
                >
                  <div className="w-13 h-17 bg-[#efeded] flex-shrink-0 overflow-hidden">
                    <img
                      src={product.images[0].src}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-display font-medium text-[#1b1c1c] truncate">
                      {product.title}
                    </p>
                    <p className="text-[12px] font-mono text-[#5d5f5f] mt-0.5">
                      ${product.price.toFixed(2)}
                      {product.originalPrice && (
                        <span className="line-through text-[#747878] ml-2 text-[11px]">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </p>
                    <span className="text-[10px] text-[#747878] uppercase tracking-wider mt-0.5 block">
                      {product.subCategory} • {product.sizes.join('/')}
                    </span>
                  </div>
                  <div className="text-[#1b1c1c] opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Editorial note in drawer */}
        <div className="mt-6 pt-4 border-t border-[#e5e5e5] text-[11px] text-[#747878] leading-relaxed flex flex-col gap-2">
          <div>
            <p className="uppercase tracking-[0.1em] font-display font-semibold text-[#1b1c1c] mb-0.5">
              European Atelier Standard
            </p>
            Complimentary express carbon-neutral delivery on all orders.
          </div>

          {onOpenAdmin && (
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="text-[10px] font-mono text-[#9a9d9d] hover:text-[#1b1c1c] text-left pt-2 border-t border-[#e5e5e5]/50 flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Atelier Management Login</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
