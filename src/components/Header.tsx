import React, { useState, useRef, useEffect } from 'react';
import { Menu, ShoppingBag, Heart, Search, X, ArrowRight, ShieldCheck, Zap, User as UserIcon } from 'lucide-react';
import { CollectionCategory, Product, UserProfile } from '../types';

interface HeaderProps {
  onOpenCollections: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  cartCount: number;
  wishlistCount: number;
  onLogoClick: () => void;
  onSelectCategory: (cat: CollectionCategory) => void;
  activeCategory?: CollectionCategory | null;
  isCatalogView?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  userProfile?: UserProfile | null;
  onOpenAccount?: () => void;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCollections,
  onOpenCart,
  onOpenWishlist,
  cartCount,
  wishlistCount,
  onLogoClick,
  onSelectCategory,
  activeCategory,
  isCatalogView,
  searchQuery,
  onSearchChange,
  products = [],
  onSelectProduct,
  userProfile,
  onOpenAccount,
  onOpenAuth,
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories: CollectionCategory[] = ['Men', 'Women', 'Kids', 'New Arrivals', 'Trending', 'Sale'];

  // Quick live search matching for dropdown preview
  const searchMatches = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return products
      .filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const catMatch = p.category.toLowerCase().includes(q) || p.subCategory.toLowerCase().includes(q);
        const brandMatch = p.brand ? p.brand.toLowerCase().includes(q) : false;
        const descMatch = p.description.toLowerCase().includes(q);
        const fabricMatch = p.fabric.toLowerCase().includes(q);
        return titleMatch || catMatch || brandMatch || descMatch || fabricMatch;
      })
      .slice(0, 5);
  }, [searchQuery, products]);

  // Focus input when search is opened
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    onSearchChange('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleProductClick = (prod: Product) => {
    if (onSelectProduct) {
      onSelectProduct(prod);
    }
    setIsDropdownOpen(false);
    setIsSearchExpanded(false);
  };

  return (
    <header
      id="main-header"
      className="fixed top-0 left-0 w-full flex justify-between items-center px-4 md:px-10 lg:px-14 h-[72px] bg-[#fbf9f9]/95 backdrop-blur-md z-50 border-b border-[#e5e5e5]"
    >
      {/* Left Section: Menu & Category Navigation */}
      <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
        <button
          id="btn-open-menu"
          aria-label="Open Collections Menu"
          onClick={onOpenCollections}
          className="text-[#1b1c1c] hover:opacity-60 transition-opacity p-2 -ml-2 flex items-center justify-center cursor-pointer group"
        >
          <Menu className="w-6 h-6 stroke-[1.5] group-hover:scale-105 transition-transform" />
          <span className="hidden xl:inline-block ml-2 text-[11px] uppercase tracking-[0.18em] text-[#1b1c1c] font-medium font-display">
            Collections
          </span>
        </button>

        {/* Desktop Category Navigation */}
        <nav className="hidden lg:flex items-center gap-5">
          {categories.map((cat) => {
            const isActive = isCatalogView && activeCategory === cat && !searchQuery;
            return (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  if (searchQuery) onSearchChange('');
                }}
                className={`text-[11px] uppercase tracking-[0.18em] font-display transition-colors cursor-pointer py-1 ${
                  isActive
                    ? 'text-[#1b1c1c] font-bold border-b-2 border-[#1b1c1c]'
                    : 'text-[#5d5f5f] hover:text-[#1b1c1c]'
                } ${cat === 'Sale' ? 'text-rose-900 font-medium' : ''}`}
              >
                {cat}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Center Section: Logo (Hidden or compact when search is heavily expanded on mobile) */}
      <div className={`flex items-center justify-center transition-all ${isSearchExpanded ? 'hidden md:flex' : 'flex'}`}>
        <button
          id="btn-logo-home"
          onClick={() => {
            onLogoClick();
            if (searchQuery) onSearchChange('');
          }}
          className="font-display text-[20px] md:text-[24px] tracking-[0.22em] uppercase text-[#1b1c1c] font-light text-center cursor-pointer hover:opacity-80 transition-opacity"
        >
          ELITE FASHION HUB
        </button>
      </div>

      {/* Right Section: Real-Time Search Bar, Wishlist & Cart */}
      <div className="flex items-center gap-2 md:gap-4 relative">
        {/* Real-time Search Input Container */}
        <div className="relative flex items-center">
          <div
            className={`flex items-center border transition-all duration-300 ${
              isSearchExpanded || searchQuery
                ? 'w-[200px] sm:w-[260px] md:w-[320px] lg:w-[340px] bg-white border-[#1b1c1c] shadow-xs'
                : 'w-9 h-9 md:w-[220px] bg-transparent border-transparent md:border-[#e5e5e5] md:bg-white/60 hover:border-[#1b1c1c]'
            }`}
          >
            <button
              id="btn-search-trigger"
              aria-label="Search"
              onClick={() => {
                setIsSearchExpanded(true);
                searchInputRef.current?.focus();
              }}
              className="w-9 h-9 flex items-center justify-center text-[#1b1c1c] hover:opacity-70 transition-opacity cursor-pointer flex-shrink-0"
            >
              <Search className="w-4 h-4 stroke-[1.5]" />
            </button>

            <input
              id="header-search-input"
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsDropdownOpen(true);
                setIsSearchExpanded(true);
              }}
              onFocus={() => {
                setIsSearchExpanded(true);
                if (searchQuery.trim()) setIsDropdownOpen(true);
              }}
              placeholder="Search products, category, fabric..."
              className={`w-full text-[12px] font-body text-[#1b1c1c] placeholder:text-[#8e9191] placeholder:text-[11px] placeholder:font-display placeholder:uppercase placeholder:tracking-wider focus:outline-none pr-2 ${
                isSearchExpanded || searchQuery ? 'block' : 'hidden md:block'
              }`}
            />

            {searchQuery && (
              <button
                id="btn-clear-search"
                aria-label="Clear Search"
                onClick={handleClear}
                className="w-7 h-7 flex items-center justify-center text-[#747878] hover:text-[#1b1c1c] transition-colors cursor-pointer mr-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Live Search Quick Suggestion Dropdown */}
          {isDropdownOpen && searchQuery.trim().length > 0 && (
            <div
              ref={dropdownRef}
              id="header-search-dropdown"
              className="absolute top-[100%] right-0 mt-2 w-[320px] sm:w-[380px] bg-white border border-[#1b1c1c] shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="p-3 border-b border-[#f0f0f0] bg-[#fafafa] flex justify-between items-center text-[11px] font-display uppercase tracking-wider text-[#5d5f5f]">
                <span>Matching Products ({searchMatches.length})</span>
                <span className="font-mono text-[10px] text-[#747878]">Real-time Filter</span>
              </div>

              {searchMatches.length === 0 ? (
                <div className="p-6 text-center text-[#747878]">
                  <p className="text-[13px] font-body mb-1">No products found for "{searchQuery}"</p>
                  <p className="text-[11px] font-display uppercase tracking-wider text-[#8e9191]">
                    Try searching by garment name, category, or fabric
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#f0f0f0] max-h-[360px] overflow-y-auto">
                  {searchMatches.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleProductClick(item)}
                      className="p-3 flex items-center gap-3 hover:bg-[#efeded]/70 cursor-pointer transition-colors group"
                    >
                      <img
                        src={item.images[0]?.src}
                        alt={item.title}
                        className="w-12 h-14 object-cover bg-[#efeded] flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        {item.brand && (
                          <span className="text-[9px] font-display uppercase tracking-wider text-[#747878] block">
                            {item.brand}
                          </span>
                        )}
                        <h4 className="text-[13px] font-display font-medium text-[#1b1c1c] truncate group-hover:underline">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-[#747878] font-mono">
                            {item.category} • {item.subCategory}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-mono text-[13px] font-semibold text-[#1b1c1c]">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View Full Filtered Catalog Footer */}
              <div className="p-2.5 bg-[#fbf9f9] border-t border-[#e5e5e5] text-center">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsSearchExpanded(false);
                  }}
                  className="w-full py-1.5 text-[11px] font-display uppercase tracking-wider text-[#1b1c1c] hover:bg-[#1b1c1c] hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Filter Whole Catalog</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id="btn-open-wishlist"
          aria-label="Saved items"
          onClick={onOpenWishlist}
          className="relative text-[#1b1c1c] hover:opacity-60 transition-opacity p-2 flex items-center justify-center cursor-pointer flex-shrink-0"
        >
          <Heart className="w-5 h-5 stroke-[1.5]" />
          {wishlistCount > 0 && (
            <span
              id="wishlist-badge"
              className="absolute top-1 right-1 bg-[#1b1c1c] text-white text-[9px] w-4 h-4 flex items-center justify-center font-mono font-medium"
            >
              {wishlistCount}
            </span>
          )}
        </button>

        {/* User Account / Sign In Button */}
        <button
          id="btn-user-account"
          aria-label={userProfile ? 'My Account' : 'Sign In'}
          onClick={userProfile ? onOpenAccount : onOpenAuth}
          className="flex items-center gap-1.5 p-1.5 text-[#1b1c1c] hover:opacity-70 transition-opacity cursor-pointer flex-shrink-0"
        >
          {userProfile ? (
            <div className="w-6 h-6 rounded-full bg-[#1b1c1c] text-white flex items-center justify-center text-[10px] font-mono font-bold uppercase">
              {userProfile.displayName ? userProfile.displayName.charAt(0) : 'P'}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-display uppercase tracking-wider">
              <UserIcon className="w-4 h-4 stroke-[1.5]" />
              <span className="hidden sm:inline">Sign In</span>
            </div>
          )}
        </button>

        {/* Shopping Bag Button */}
        <button
          id="btn-open-cart"
          aria-label="Shopping Bag"
          onClick={onOpenCart}
          className="relative text-[#1b1c1c] hover:opacity-60 transition-opacity p-2 -mr-1 flex items-center justify-center cursor-pointer flex-shrink-0"
        >
          <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
          {cartCount > 0 && (
            <span
              id="cart-badge"
              className="absolute top-1 right-1 bg-[#1b1c1c] text-white text-[9px] w-4 h-4 flex items-center justify-center font-mono font-medium"
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
