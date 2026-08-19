/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ProductGallery } from './components/ProductGallery';
import { ProductInfo } from './components/ProductInfo';
import { CategoryView } from './components/CategoryView';
import { AdminDashboard } from './components/AdminDashboard';
import { CollectionsDrawer } from './components/CollectionsDrawer';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SizeGuideModal } from './components/SizeGuideModal';
import { LightboxModal } from './components/LightboxModal';
import { EditorialModal, FooterTab } from './components/EditorialModal';
import { PaymentModal } from './components/PaymentModal';
import { AuthModal } from './components/AuthModal';
import { UserAccountDrawer } from './components/UserAccountDrawer';
import { SEOHead } from './components/SEOHead';
import { Footer } from './components/Footer';
import { INITIAL_PRODUCTS, FEATURED_PRODUCT } from './data/products';
import { Product, CartItem, CollectionCategory, OrderConfirmation, UserProfile } from './types';
import { cloudDb, authService, testFirestoreConnection } from './lib/firebase';

export default function App() {
  // Navigation & View State ('detail' | 'catalog' | 'admin')
  const [viewMode, setViewMode] = useState<'detail' | 'catalog' | 'admin'>('detail');

  // Dynamic Catalog State persisted in localStorage
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('maison_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge newly introduced catalog products with any custom user products
          const existingIds = new Set(parsed.map((p: Product) => p.id));
          const missingInitials = INITIAL_PRODUCTS.filter((p) => !existingIds.has(p.id));
          if (missingInitials.length > 0) {
            return [...parsed, ...missingInitials];
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_PRODUCTS;
  });

  // Dynamic Orders State persisted in localStorage
  const [orders, setOrders] = useState<OrderConfirmation[]>(() => {
    try {
      const saved = localStorage.getItem('maison_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  // User Auth & Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

  // Current active product for detail view
  const [currentProduct, setCurrentProduct] = useState<Product>(() => {
    return products[0] || FEATURED_PRODUCT;
  });
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [activeCategory, setActiveCategory] = useState<CollectionCategory>('Women');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Search input handler that switches to catalog view in real-time
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && viewMode === 'detail') {
      setViewMode('catalog');
      window.location.hash = `#catalog/${encodeURIComponent(activeCategory)}`;
    }
  };

  // Drawers & Modals
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeFooterTab, setActiveFooterTab] = useState<FooterTab>(null);

  // Cart & Wishlist with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('maison_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('maison_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubAuth = authService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await cloudDb.getUserProfile(firebaseUser.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Atelier Patron',
              tier: 'Noir VIP',
              createdAt: new Date().toISOString(),
              savedAddresses: [],
            };
            setUserProfile(newProfile);
            await cloudDb.saveUserProfile(newProfile);
          }
        } catch (err) {
          console.warn('Profile fetch notice:', err);
          setUserProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Atelier Patron',
            tier: 'Noir VIP',
            createdAt: new Date().toISOString(),
            savedAddresses: [],
          });
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubAuth();
  }, []);

  // Sync Hash on Browser Navigation
  const syncHashToView = useCallback(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash === 'admin') {
      setViewMode('admin');
    } else if (hash.startsWith('catalog')) {
      const catParam = decodeURIComponent(hash.split('/')[1] || 'Women') as CollectionCategory;
      setActiveCategory(catParam);
      setViewMode('catalog');
    } else if (hash.startsWith('product/')) {
      const prodId = hash.split('/')[1];
      const match = products.find((p) => p.id === prodId);
      if (match) {
        setCurrentProduct(match);
        setSelectedSize(match.sizes[1] || match.sizes[0] || 'M');
      }
      setViewMode('detail');
    } else if (hash === 'store' || hash === '') {
      if (viewMode === 'admin') {
        setViewMode('detail');
      }
    }
  }, [products, viewMode]);

  useEffect(() => {
    syncHashToView();
    window.addEventListener('hashchange', syncHashToView);
    return () => window.removeEventListener('hashchange', syncHashToView);
  }, [syncHashToView]);

  // Sync Products to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('maison_products', JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  // Sync Orders to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('maison_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Sync Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('maison_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Sync Wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('maison_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  // Test connection & initialize cloud data on boot
  useEffect(() => {
    testFirestoreConnection();

    // Subscribe to real-time Orders from Cloud Firestore
    const unsubOrders = cloudDb.subscribeOrders((cloudOrders) => {
      if (cloudOrders && cloudOrders.length > 0) {
        setOrders((local) => {
          const map = new Map();
          local.forEach((o) => map.set(o.orderId, o));
          cloudOrders.forEach((o) => map.set(o.orderId, o));
          return Array.from(map.values());
        });
      }
    });

    // Subscribe to real-time Products from Cloud Firestore
    const unsubProducts = cloudDb.subscribeProducts((cloudProducts) => {
      if (cloudProducts && cloudProducts.length > 0) {
        setProducts((local) => {
          const map = new Map();
          local.forEach((p) => map.set(p.id, p));
          cloudProducts.forEach((p) => map.set(p.id, p));
          return Array.from(map.values());
        });
      }
    });

    return () => {
      unsubOrders();
      unsubProducts();
    };
  }, []);

  // Admin Catalog Handlers
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
    cloudDb.saveProduct(newProd).catch((err) => console.warn('Cloud sync save notice:', err));
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (currentProduct.id === updated.id) {
      setCurrentProduct(updated);
    }
    // Also update in cart if present
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === updated.id ? { ...item, product: updated } : item
      )
    );
    cloudDb.saveProduct(updated).catch((err) => console.warn('Cloud sync update notice:', err));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (currentProduct.id === productId) {
      const fallback = products.find((p) => p.id !== productId) || FEATURED_PRODUCT;
      setCurrentProduct(fallback);
    }
    cloudDb.deleteProduct(productId).catch((err) => console.warn('Cloud sync delete notice:', err));
  };

  const handleResetToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    setCurrentProduct(FEATURED_PRODUCT);
    try {
      localStorage.removeItem('maison_products');
    } catch {}
  };

  const handleViewProductInStore = (product: Product) => {
    setCurrentProduct(product);
    setSelectedSize(product.sizes[1] || product.sizes[0] || 'M');
    setViewMode('detail');
    window.location.hash = `#product/${product.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart handlers
  const handleAddToCart = (product: Product, size: string) => {
    const itemId = `${product.id}-${size}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: itemId, product, size, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Wishlist handlers
  const isWishlisted = wishlist.some((item) => item.id === currentProduct.id);
  const wishlistIds = wishlist.map((p) => p.id);

  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  // Navigation handlers
  const handleSelectProduct = (product: Product) => {
    setCurrentProduct(product);
    setSelectedSize(product.sizes[1] || product.sizes[0] || 'M');
    setViewMode('detail');
    window.location.hash = `#product/${product.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: CollectionCategory) => {
    setActiveCategory(cat);
    setViewMode('catalog');
    window.location.hash = `#catalog/${encodeURIComponent(cat)}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdminPage = () => {
    setViewMode('admin');
    window.location.hash = '#admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseAdminPage = () => {
    setViewMode('detail');
    window.location.hash = '#store';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Order Completion Handler with Automated Low-Stock Inventory Management
  const handleOrderSuccess = (order: OrderConfirmation) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);

    // Decrement stock for ordered products
    setProducts((prev) =>
      prev.map((prod) => {
        const orderItem = order.items.find((it) => it.product.id === prod.id);
        if (!orderItem) return prod;

        const currentStock = prod.stockCount !== undefined ? prod.stockCount : 8;
        const newStock = Math.max(0, currentStock - orderItem.quantity);
        const updatedSizes = { ...(prod.stockPerSize || {}) };
        if (orderItem.size && updatedSizes[orderItem.size] !== undefined) {
          updatedSizes[orderItem.size] = Math.max(0, updatedSizes[orderItem.size] - orderItem.quantity);
        }

        const isLow = newStock <= 4 && newStock > 0;
        const inStock = newStock > 0;

        const updatedProd: Product = {
          ...prod,
          stockCount: newStock,
          stockPerSize: updatedSizes,
          isLowStock: isLow,
          inStock,
        };

        // Sync to cloud Firestore
        cloudDb.saveProduct(updatedProd).catch((e) => console.warn('Inventory sync notice:', e));
        return updatedProd;
      })
    );
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // =========================================================================
  // PAGE 1: ADMIN BACK-OFFICE PORTAL (COMPLETELY SEPARATED PAGE)
  // =========================================================================
  if (viewMode === 'admin') {
    return (
      <AdminDashboard
        products={products}
        orders={orders}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetToDefault={handleResetToDefault}
        onViewProductInStore={handleViewProductInStore}
        onCloseAdmin={handleCloseAdminPage}
      />
    );
  }

  // =========================================================================
  // PAGE 2: CLIENT BOUTIQUE STORE (CUSTOMER FACING)
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f9] text-[#1b1c1c] font-body selection:bg-black selection:text-white">
      {/* Dynamic SEO Meta & Microdata */}
      <SEOHead
        product={viewMode === 'detail' ? currentProduct : null}
        category={viewMode === 'catalog' ? activeCategory : null}
      />

      {/* Customer Header */}
      <Header
        onOpenCollections={() => setIsCollectionsOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onLogoClick={() => {
          setSearchQuery('');
          setCurrentProduct(products[0] || FEATURED_PRODUCT);
          setSelectedSize('M');
          setViewMode('detail');
          window.location.hash = '#store';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCategory={handleSelectCategory}
        activeCategory={activeCategory}
        isCatalogView={viewMode === 'catalog'}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        products={products}
        onSelectProduct={handleSelectProduct}
        userProfile={userProfile}
        onOpenAccount={() => setIsAccountDrawerOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      {viewMode === 'catalog' ? (
        <CategoryView
          category={activeCategory}
          products={products}
          onSelectProduct={handleSelectProduct}
          onQuickAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlistIds={wishlistIds}
          onBackToFeatured={() => {
            setSearchQuery('');
            setViewMode('detail');
            window.location.hash = '#store';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectCategory={handleSelectCategory}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
        />
      ) : (
        <main className="flex-grow pt-[96px] md:pt-[104px] pb-16 md:pb-24 px-5 md:px-16 max-w-[1440px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left Column: 2x2 Editorial Image Gallery */}
            <div className="lg:col-span-7 xl:col-span-8">
              <ProductGallery
                product={currentProduct}
                onOpenLightbox={(idx) => setLightboxIndex(idx)}
              />
            </div>

            {/* Right Column: Garment Information, Sizing, & Actions */}
            <div className="lg:col-span-5 xl:col-span-4">
              <ProductInfo
                product={currentProduct}
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={isWishlisted}
                onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                onCategoryClick={(cat) => handleSelectCategory(cat as CollectionCategory)}
              />
            </div>
          </div>
        </main>
      )}

      {/* Customer Footer with Discreet Staff Access Link */}
      <Footer
        onOpenTab={(tab) => setActiveFooterTab(tab)}
        onLogoClick={() => {
          setCurrentProduct(products[0] || FEATURED_PRODUCT);
          setSelectedSize('M');
          setViewMode('detail');
          window.location.hash = '#store';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={handleOpenAdminPage}
      />

      {/* Drawers & Modals */}
      <CollectionsDrawer
        isOpen={isCollectionsOpen}
        onClose={() => setIsCollectionsOpen(false)}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        products={products}
        currentProductId={currentProduct.id}
        onSelectProduct={handleSelectProduct}
        onOpenCategoryCatalog={handleSelectCategory}
        onOpenAdmin={handleOpenAdminPage}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onContinueShopping={() => {
          setIsCartOpen(false);
          setViewMode('catalog');
          window.location.hash = `#catalog/${encodeURIComponent(activeCategory)}`;
        }}
        onOpenPaymentModal={() => {
          setIsPaymentOpen(true);
        }}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        savedProducts={wishlist}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onMoveToCart={handleAddToCart}
        onSelectProduct={handleSelectProduct}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        items={
          cart.length > 0
            ? cart
            : [
                {
                  id: `${currentProduct.id}-${selectedSize}`,
                  product: currentProduct,
                  size: selectedSize,
                  quantity: 1,
                },
              ]
        }
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Firebase Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />

      {/* User Account Drawer */}
      <UserAccountDrawer
        isOpen={isAccountDrawerOpen}
        onClose={() => setIsAccountDrawerOpen(false)}
        userProfile={userProfile}
        orders={orders}
        wishlist={wishlist}
        onOpenWishlist={() => {
          setIsAccountDrawerOpen(false);
          setIsWishlistOpen(true);
        }}
        onRemoveFromWishlist={handleToggleWishlist}
        onSelectProduct={handleSelectProduct}
        onRefreshProfile={async () => {
          if (userProfile?.uid) {
            const p = await cloudDb.getUserProfile(userProfile.uid);
            if (p) setUserProfile(p);
          }
        }}
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        onSelectSize={(s) => setSelectedSize(s)}
        currentSize={selectedSize}
      />

      <LightboxModal
        product={currentProduct}
        activeImageIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />

      <EditorialModal
        activeTab={activeFooterTab}
        onClose={() => setActiveFooterTab(null)}
      />
    </div>
  );
}
