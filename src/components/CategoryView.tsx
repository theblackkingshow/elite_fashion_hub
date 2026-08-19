import React, { useState, useMemo } from 'react';
import { Sparkles, ArrowRight, Filter, SlidersHorizontal, ArrowLeft, Heart, ShoppingBag, ShieldCheck, Zap, Search, X } from 'lucide-react';
import { CollectionCategory, Product, SubCategory } from '../types';

interface CategoryViewProps {
  category: CollectionCategory;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickAddToCart: (product: Product, size: string) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onBackToFeatured: () => void;
  onSelectCategory: (cat: CollectionCategory) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  category,
  products,
  onSelectProduct,
  onQuickAddToCart,
  onToggleWishlist,
  wishlistIds,
  onBackToFeatured,
  onSelectCategory,
  searchQuery = '',
  onClearSearch,
}) => {
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const subCategories: SubCategory[] = [
    'All',
    'Dresses & Jumpsuits',
    'Outerwear',
    'Blazers & Tailoring',
    'Afro-Chic & Traditional',
    'Shirts & Polos',
    'Tops & Blouses',
    'Trousers & Denim',
    'Footwear & Sneakers',
    'Watches & Jewelry',
    'Leather & Bags',
    'Activewear & Streetwear',
  ];

  const categoryDescriptions: Record<CollectionCategory, { title: string; subtitle: string }> = {
    'Men': {
      title: "Men's Fashion & Tailoring",
      subtitle: 'Executive three-piece suits, Italian Oxford brogues, Egyptian cotton shirts, piqué polos, and precision streetwear.',
    },
    'Women': {
      title: "Women's Fashion & Coutures",
      subtitle: 'Silk satin evening gowns, authentic Ankara wax flare dresses, tailored houndstooth blazers, and luxury leather handbags.',
    },
    'Kids': {
      title: "Kids & Young Explorers Collection",
      subtitle: 'Premium organic cotton denim, hypoallergenic merino wool knits, festive Ankara sets, tiered cotton sundresses, and flexible retro sneakers.',
    },
    'New Arrivals': {
      title: 'New Arrivals • Season Drops',
      subtitle: 'Fresh runway releases, afro-modern Dashiki kimonos, retro platform court sneakers, and limited atelier creations.',
    },
    'Trending': {
      title: 'Trending Essentials & Best-Sellers',
      subtitle: 'Top-rated timepieces, 18K gold jewelry sets, croc-embossed totes, and polarized sunglasses dominating customer wardrobes.',
    },
    'Sale': {
      title: 'Flash Privilege • Clearance Deals',
      subtitle: 'Verified genuine fashion reductions, flash sales up to 50% off, and official store privileged pricing.',
    },
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // If there's an active global search query, search across the entire catalog by name, category, or description
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCategory =
          p.category.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q) ||
          (p.gender ? p.gender.toLowerCase().includes(q) : false) ||
          (p.brand ? p.brand.toLowerCase().includes(q) : false);
        const matchesDescription =
          p.description.toLowerCase().includes(q) ||
          p.details.some((d) => d.toLowerCase().includes(q)) ||
          p.fabric.toLowerCase().includes(q);

        return matchesTitle || matchesCategory || matchesDescription;
      }

      // Otherwise filter by category tab
      if (category === 'Men') return p.category === 'Men' || p.gender === 'Men' || p.gender === 'Unisex';
      if (category === 'Women') return p.category === 'Women' || p.gender === 'Women' || p.gender === 'Unisex';
      if (category === 'Kids') return p.category === 'Kids' || p.gender === 'Kids';
      if (category === 'New Arrivals') return p.isNewArrival || p.category === 'New Arrivals';
      if (category === 'Trending') return p.isTrending || p.category === 'Trending';
      if (category === 'Sale') return p.isSale || p.originalPrice;
      return true;
    });

    if (selectedSubCategory !== 'All') {
      result = result.filter((p) => p.subCategory === selectedSubCategory);
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [category, products, selectedSubCategory, sortBy, searchQuery]);

  const headerInfo = categoryDescriptions[category] || {
    title: `${category} Collection`,
    subtitle: 'Jumia fashion catalog curation.',
  };

  return (
    <div id="category-catalog-page" className="w-full pt-[88px] pb-24 px-5 md:px-14 max-w-[1440px] mx-auto">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToFeatured}
            className="flex items-center gap-1.5 text-[11px] font-display uppercase tracking-[0.15em] text-[#5d5f5f] hover:text-[#1b1c1c] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Featured Garment</span>
          </button>
          <span className="text-[#c4c7c7]">/</span>
          <span className="text-[11px] font-display uppercase tracking-[0.15em] font-semibold text-[#1b1c1c]">
            {searchQuery ? `Search: "${searchQuery}"` : category}
          </span>
        </div>

        {/* Quick category switcher tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['New Arrivals', 'Men', 'Women', 'Kids', 'Trending', 'Sale'] as CollectionCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                if (onClearSearch) onClearSearch();
                onSelectCategory(cat);
                setSelectedSubCategory('All');
              }}
              className={`px-3 py-1.5 text-[11px] font-display uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                !searchQuery && category === cat
                  ? 'bg-[#1b1c1c] text-white font-medium'
                  : 'bg-white border border-[#e5e5e5] text-[#5d5f5f] hover:border-[#1b1c1c] hover:text-[#1b1c1c]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Active Search Query Notice Banner */}
      {searchQuery && (
        <div className="mb-8 p-4 bg-[#efeded]/70 border border-[#1b1c1c] flex flex-col sm:flex-row justify-between sm:items-center gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#1b1c1c]" />
            <div>
              <span className="text-[11px] font-display uppercase tracking-wider text-[#747878] block">
                Live Search Filter Active
              </span>
              <p className="text-[14px] font-body text-[#1b1c1c]">
                Showing results for <span className="font-semibold">"{searchQuery}"</span> across name, category, brand, and description ({filteredProducts.length} items found)
              </p>
            </div>
          </div>
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="self-start sm:self-auto px-3 py-1.5 bg-white border border-[#1b1c1c] text-[11px] font-display uppercase tracking-wider text-[#1b1c1c] hover:bg-[#1b1c1c] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-3 h-3" />
              <span>Clear Search</span>
            </button>
          )}
        </div>
      )}

      {/* Category Hero Banner */}
      {!searchQuery && (
        <div className="mb-10">
          <h1 className="font-display text-[32px] md:text-[44px] uppercase tracking-[0.03em] font-light text-[#1b1c1c] mb-3">
            {headerInfo.title}
          </h1>
          <p className="font-body text-[15px] md:text-[16px] text-[#5d5f5f] max-w-3xl leading-relaxed">
            {headerInfo.subtitle}
          </p>
        </div>
      )}

      {/* Subcategory & Sorting Bar */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-10 pb-4 border-b border-[#e5e5e5]">
        {/* Subcategories horizontal scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {subCategories.map((sub) => {
            const isSelected = selectedSubCategory === sub;
            return (
              <button
                key={sub}
                onClick={() => setSelectedSubCategory(sub)}
                className={`px-3 py-1.5 text-[11px] font-display uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'border-b-2 border-[#1b1c1c] text-[#1b1c1c] font-semibold bg-[#efeded]/50'
                    : 'text-[#747878] hover:text-[#1b1c1c]'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center justify-between md:justify-end gap-4 text-[12px] flex-shrink-0">
          <span className="font-mono text-[#747878] text-[11px]">
            {filteredProducts.length} items
          </span>
          <div className="flex items-center gap-2">
            <span className="font-display uppercase tracking-wider text-[#5d5f5f] text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#e5e5e5] px-2.5 py-1.5 text-[11px] font-display uppercase tracking-wider text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c] cursor-pointer"
            >
              <option value="featured">Curated Best</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center border border-[#e5e5e5] bg-white">
          <p className="font-display text-[18px] uppercase tracking-wider text-[#1b1c1c] mb-2">
            No products match your search criteria
          </p>
          <p className="text-[14px] text-[#747878] mb-6">
            {searchQuery
              ? `No items found matching "${searchQuery}". Try different keywords or browse all categories.`
              : 'Try selecting a different filter or explore all pieces.'}
          </p>
          <div className="flex justify-center gap-3">
            {searchQuery && onClearSearch && (
              <button
                onClick={onClearSearch}
                className="border border-[#1b1c1c] bg-[#1b1c1c] text-white px-6 py-2.5 text-[11px] font-display uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
              >
                Clear Search
              </button>
            )}
            <button
              onClick={() => setSelectedSubCategory('All')}
              className="border border-[#1b1c1c] px-6 py-2.5 text-[11px] font-display uppercase tracking-wider hover:bg-[#1b1c1c] hover:text-white transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          {filteredProducts.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
            const isHovered = hoveredProduct === product.id;
            const displayImage = isHovered && product.images[1] ? product.images[1].src : product.images[0].src;

            return (
              <div
                key={product.id}
                id={`catalog-product-${product.id}`}
                className="group flex flex-col"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Image Container */}
                <div
                  onClick={() => onSelectProduct(product)}
                  className="aspect-[3/4] w-full bg-[#efeded] relative overflow-hidden cursor-pointer"
                >
                  <img
                    src={displayImage}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
                    {product.isSale && (
                      <span className="bg-[#1b1c1c] text-white text-[9px] font-mono uppercase tracking-widest px-2 py-0.5">
                        Sale
                      </span>
                    )}
                    {product.jumiaExpress && (
                      <span className="bg-amber-400 text-[#1b1c1c] font-bold text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 shadow-xs">
                        Express
                      </span>
                    )}
                    {product.isNewArrival && !product.isSale && (
                      <span className="bg-white/90 backdrop-blur-xs text-[#1b1c1c] text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border border-[#e5e5e5]">
                        New Season
                      </span>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product);
                    }}
                    aria-label="Save to Wishlist"
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#1b1c1c] hover:bg-white transition-colors cursor-pointer shadow-xs"
                  >
                    <Heart
                      className={`w-4 h-4 stroke-[1.5] ${
                        isWishlisted ? 'fill-[#1b1c1c] text-[#1b1c1c]' : ''
                      }`}
                    />
                  </button>

                  {/* Quick Add Overlay on Hover */}
                  <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-xs p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-1.5">
                    <span className="font-display text-[10px] uppercase tracking-wider text-[#747878] text-center">
                      Quick Add Size:
                    </span>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickAddToCart(product, sz);
                          }}
                          className="px-2 py-1 border border-[#e5e5e5] text-[10px] font-mono hover:border-[#1b1c1c] hover:bg-[#1b1c1c] hover:text-white transition-colors cursor-pointer"
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Info Text */}
                <div className="mt-3 flex flex-col">
                  {product.brand && (
                    <span className="text-[10px] font-display uppercase tracking-wider text-[#747878] font-semibold">
                      {product.brand}
                    </span>
                  )}

                  <h3
                    onClick={() => onSelectProduct(product)}
                    className="font-display text-[14px] text-[#1b1c1c] font-medium hover:underline cursor-pointer leading-snug line-clamp-1 mt-0.5"
                  >
                    {product.title}
                  </h3>

                  <p className="text-[12px] text-[#5d5f5f] line-clamp-1 mt-0.5">
                    {product.description}
                  </p>

                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="font-mono text-[14px] text-[#1b1c1c] font-semibold">
                      ${product.price.toFixed(2)}
                    </p>
                    {product.originalPrice && (
                      <span className="line-through text-[#747878] text-[11px] font-mono">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                    {product.originalPrice && (
                      <span className="text-rose-700 text-[10px] font-mono font-semibold">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
