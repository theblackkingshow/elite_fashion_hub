import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  RotateCcw,
  Download,
  Check,
  X,
  AlertCircle,
  Package,
  DollarSign,
  Tag,
  Sparkles,
  Layers,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle2,
  ShoppingBag,
  TrendingUp,
  SlidersHorizontal,
  LogOut,
  Eye,
  ShieldCheck,
  BarChart3,
  ListOrdered,
  CreditCard,
  Truck,
  RefreshCw,
  Mail,
  MessageSquare,
  Database,
  Send,
} from 'lucide-react';
import { Product, CollectionCategory, SubCategory, OrderConfirmation } from '../types';
import { IMAGE_PRESETS, FEATURED_PRODUCT } from '../data/products';
import { sendOrderConfirmationNotifications } from '../services/notifications';

interface AdminDashboardProps {
  products: Product[];
  orders?: OrderConfirmation[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetToDefault: () => void;
  onViewProductInStore: (product: Product) => void;
  onCloseAdmin: () => void;
}

type AdminTab = 'inventory' | 'add_garment' | 'orders' | 'analytics' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetToDefault,
  onViewProductInStore,
  onCloseAdmin,
}) => {
  // Active navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>('inventory');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'title' | 'price-asc' | 'price-desc' | 'newest'>('newest');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // In-line quick price edit state
  const [quickPriceEditId, setQuickPriceEditId] = useState<string | null>(null);
  const [quickPriceValue, setQuickPriceValue] = useState<string>('');

  // Test notification dispatch state
  const [testEmail, setTestEmail] = useState('atelier.client@editorial.com');
  const [testPhone, setTestPhone] = useState('+1 (555) 345-9800');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Form State for creating / editing
  const initialFormState: Product = {
    id: '',
    title: '',
    category: 'Men',
    gender: 'Men',
    subCategory: 'Outerwear',
    price: 120.0,
    originalPrice: undefined,
    rating: 4.8,
    reviewCount: 12,
    sku: `MSN-${Math.floor(1000 + Math.random() * 9000)}-BLK`,
    inStock: true,
    isNewArrival: true,
    isTrending: false,
    isSale: false,
    silhouette: 'Architectural Oversized Fit',
    fit: 'True to European size with tailored drop shoulder',
    fabric: '100% Virgin Merino Wool (380gsm)',
    description: 'Precision cut from heavyweight European wool with understated minimalist hardware.',
    details: [
      'Hand-finished pick-stitched lapels',
      'Concealed horn button front fastening',
      'Interior breast welt pocket',
    ],
    careInstructions: ['Specialist dry clean only.'],
    shippingAndReturns: {
      shipping: 'Complimentary express carbon-neutral delivery in 2-4 business days.',
      returns: 'Complimentary 30-day returns and size exchanges.',
    },
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      {
        src: IMAGE_PRESETS[0].url,
        alt: 'Editorial luxury garment shot',
        caption: 'Front Silhouette & Textile Detail',
      },
    ],
  };

  const [formData, setFormData] = useState<Product>(initialFormState);
  const [formImagePresetIndex, setFormImagePresetIndex] = useState<number>(0);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [detailsText, setDetailsText] = useState<string>('');
  const [careText, setCareText] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Open Form for Adding
  const handleOpenAddForm = () => {
    const newSku = `MSN-${Math.floor(1000 + Math.random() * 9000)}-${Math.random() > 0.5 ? 'BLK' : 'WHT'}`;
    const newId = `garment-${Date.now()}`;
    const fresh: Product = {
      ...initialFormState,
      id: newId,
      sku: newSku,
      createdAt: new Date().toISOString(),
    };
    setFormData(fresh);
    setDetailsText(fresh.details.join('\n'));
    setCareText(fresh.careInstructions.join('\n'));
    setCustomImageUrl(fresh.images[0].src);
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({ ...prod });
    setDetailsText(prod.details.join('\n'));
    setCareText(prod.careInstructions.join('\n'));
    setCustomImageUrl(prod.images[0]?.src || '');
    setIsFormOpen(true);
  };

  // Form Save
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedDetails = detailsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedCare = careText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const imageSource = customImageUrl.trim() || IMAGE_PRESETS[formImagePresetIndex].url;

    const finalProduct: Product = {
      ...formData,
      price: Number(formData.price) || 0,
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      details: parsedDetails.length > 0 ? parsedDetails : ['Precision tailored in European ateliers.'],
      careInstructions: parsedCare.length > 0 ? parsedCare : ['Specialist dry clean only.'],
      images: [
        {
          src: imageSource,
          alt: formData.title,
          caption: `${formData.fabric} • Architecture`,
        },
        ...(formData.images.slice(1) || []),
      ],
    };

    if (editingProduct) {
      onUpdateProduct(finalProduct);
      showToast(`Updated "${finalProduct.title}" successfully.`);
    } else {
      onAddProduct(finalProduct);
      showToast(`Added new garment "${finalProduct.title}" to catalog.`);
    }

    setIsFormOpen(false);
  };

  // Duplicate Product
  const handleDuplicate = (prod: Product) => {
    const duplicated: Product = {
      ...prod,
      id: `garment-${Date.now()}`,
      title: `${prod.title} (Duplicate)`,
      sku: `MSN-${Math.floor(1000 + Math.random() * 9000)}-DUP`,
    };
    onAddProduct(duplicated);
    showToast(`Duplicated "${prod.title}".`);
  };

  // Quick In-Line Price Update
  const handleQuickPriceSave = (product: Product) => {
    const newPriceNum = parseFloat(quickPriceValue);
    if (!isNaN(newPriceNum) && newPriceNum > 0) {
      const updated = { ...product, price: newPriceNum };
      onUpdateProduct(updated);
      showToast(`Price for "${product.title}" updated to $${newPriceNum.toFixed(2)}.`);
    }
    setQuickPriceEditId(null);
  };

  // Quick Stock Toggle
  const handleToggleStock = (product: Product) => {
    const updated = { ...product, inStock: !product.inStock };
    onUpdateProduct(updated);
    showToast(`"${product.title}" is now ${updated.inStock ? 'In Stock' : 'Out of Stock'}.`);
  };

  // Delete Confirm
  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      const target = products.find((p) => p.id === deleteConfirmId);
      onDeleteProduct(deleteConfirmId);
      showToast(`Removed "${target?.title || 'Garment'}" from inventory.`);
      setDeleteConfirmId(null);
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `elite_fashion_hub_inventory_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Catalog exported to JSON.');
  };

  // Analytics Metrics
  const stats = useMemo(() => {
    const totalCount = products.length;
    const totalValuation = products.reduce((sum, p) => sum + p.price, 0);
    const avgPrice = totalCount > 0 ? totalValuation / totalCount : 0;
    const outOfStockCount = products.filter((p) => !p.inStock || p.stockCount === 0).length;
    const lowStockCount = products.filter(
      (p) => p.inStock && ((p.stockCount !== undefined && p.stockCount <= 4 && p.stockCount > 0) || p.isLowStock)
    ).length;
    const onSaleCount = products.filter((p) => p.isSale || p.originalPrice).length;
    const menCount = products.filter((p) => p.category === 'Men' || p.gender === 'Men').length;
    const womenCount = products.filter((p) => p.category === 'Women' || p.gender === 'Women').length;
    const totalOrderRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    return {
      totalCount,
      totalValuation,
      avgPrice,
      outOfStockCount,
      lowStockCount,
      onSaleCount,
      menCount,
      womenCount,
      totalOrderRevenue,
    };
  }, [products, orders]);

  // Filtered and Sorted list
  const filteredList = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.fabric.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCat =
          selectedCategory === 'All' ||
          p.category === selectedCategory ||
          (selectedCategory === 'Men' && (p.category === 'Men' || p.gender === 'Men')) ||
          (selectedCategory === 'Women' && (p.category === 'Women' || p.gender === 'Women')) ||
          (selectedCategory === 'Kids' && (p.category === 'Kids' || p.gender === 'Kids')) ||
          (selectedCategory === 'Sale' && (p.isSale || p.originalPrice));

        const matchesSub = selectedSubCategory === 'All' || p.subCategory === selectedSubCategory;

        const isLow = p.isLowStock || (p.stockCount !== undefined && p.stockCount <= 4 && p.stockCount > 0);
        const matchesStock =
          stockFilter === 'All' ||
          (stockFilter === 'InStock' && p.inStock) ||
          (stockFilter === 'OutOfStock' && (!p.inStock || p.stockCount === 0)) ||
          (stockFilter === 'LowStock' && isLow);

        return matchesSearch && matchesCat && matchesSub && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [products, searchTerm, selectedCategory, selectedSubCategory, stockFilter, sortBy]);

  const allSubCategories: SubCategory[] = [
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

  return (
    <div id="admin-management-page" className="min-h-screen bg-[#f4f3f2] text-[#1b1c1c] flex flex-col selection:bg-black selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-[100] bg-[#1b1c1c] text-white px-5 py-3 shadow-2xl flex items-center gap-3 font-display text-[12px] uppercase tracking-wider animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DEDICATED ADMIN BACK-OFFICE TOPBAR */}
      <header className="sticky top-0 left-0 w-full bg-[#1b1c1c] text-white z-40 px-4 md:px-10 h-16 flex items-center justify-between shadow-md border-b border-[#2d2e2e]">
        {/* Left: Brand & Back-Office Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-[20px] uppercase tracking-[0.2em] font-light text-white">
              ELITE FASHION HUB
            </span>
            <span className="bg-[#333535] text-[#d4d6d6] text-[9px] font-mono uppercase px-2 py-0.5 tracking-widest border border-[#484a4a]">
              ATELIER PORTAL
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#3a3c3c] text-[11px] text-[#9a9d9d] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Staff Console • Live Session</span>
          </div>
        </div>

        {/* Right: Switch to Live Customer Boutique Store */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCloseAdmin}
            id="btn-return-to-store"
            className="flex items-center gap-2 bg-white text-[#1b1c1c] px-4 py-2 text-[11px] font-display uppercase tracking-[0.15em] font-medium hover:bg-[#e3e2e2] transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Boutique</span>
          </button>
        </div>
      </header>

      {/* ADMIN NAVIGATION BAR / TABS */}
      <div className="bg-white border-b border-[#e5e5e5] px-4 md:px-10 flex items-center justify-between overflow-x-auto">
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-3.5 text-[12px] font-display uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'border-[#1b1c1c] text-[#1b1c1c] font-semibold bg-[#faf9f9]'
                : 'border-transparent text-[#5d5f5f] hover:text-[#1b1c1c]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Garment Inventory & Prices</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#efeded] text-[#1b1c1c]">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('inventory');
              handleOpenAddForm();
            }}
            className="flex items-center gap-1.5 px-3.5 py-3.5 text-[12px] font-display uppercase tracking-wider text-[#5d5f5f] hover:text-[#1b1c1c] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-[#1b1c1c]" />
            <span>+ Add Garment</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-3.5 text-[12px] font-display uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#1b1c1c] text-[#1b1c1c] font-semibold bg-[#faf9f9]'
                : 'border-transparent text-[#5d5f5f] hover:text-[#1b1c1c]'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Client Orders</span>
            {orders.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800">
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-3.5 text-[12px] font-display uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-[#1b1c1c] text-[#1b1c1c] font-semibold bg-[#faf9f9]'
                : 'border-transparent text-[#5d5f5f] hover:text-[#1b1c1c]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Atelier Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-3.5 text-[12px] font-display uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-[#1b1c1c] text-[#1b1c1c] font-semibold bg-[#faf9f9]'
                : 'border-transparent text-[#5d5f5f] hover:text-[#1b1c1c]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Database & Backups</span>
          </button>
        </nav>

        {/* Quick Actions in Navbar */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={handleExportJson}
            title="Export catalog as JSON"
            className="text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] hover:text-[#1b1c1c] p-2 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* MAIN ADMIN CONTENT BODY */}
      <main className="flex-1 p-4 sm:p-8 md:p-10 max-w-[1540px] mx-auto w-full">
        {/* ========================================================================= */}
        {/* TAB 1: INVENTORY & PRICE MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Quick Metrics Header */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="p-4 bg-white border border-[#e5e5e5]">
                <span className="text-[10px] font-display uppercase tracking-wider text-[#747878] block mb-1">
                  Total Garments
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[24px] font-semibold text-[#1b1c1c]">
                    {stats.totalCount}
                  </span>
                  <Package className="w-4 h-4 text-[#747878]" />
                </div>
              </div>

              <div className="p-4 bg-white border border-[#e5e5e5]">
                <span className="text-[10px] font-display uppercase tracking-wider text-[#747878] block mb-1">
                  Catalog Valuation
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[24px] font-semibold text-[#1b1c1c]">
                    ${stats.totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <DollarSign className="w-4 h-4 text-[#747878]" />
                </div>
              </div>

              <div className="p-4 bg-white border border-[#e5e5e5]">
                <span className="text-[10px] font-display uppercase tracking-wider text-[#747878] block mb-1">
                  Avg. Garment Price
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[24px] font-semibold text-[#1b1c1c]">
                    ${stats.avgPrice.toFixed(2)}
                  </span>
                  <Tag className="w-4 h-4 text-[#747878]" />
                </div>
              </div>

              <div className="p-4 bg-white border border-[#e5e5e5]">
                <span className="text-[10px] font-display uppercase tracking-wider text-[#747878] block mb-1">
                  Archival Sale Pieces
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[24px] font-semibold text-[#1b1c1c]">
                    {stats.onSaleCount}
                  </span>
                  <Sparkles className="w-4 h-4 text-[#747878]" />
                </div>
              </div>

              <div className="p-4 bg-white border border-[#e5e5e5] col-span-2 lg:col-span-1">
                <span className="text-[10px] font-display uppercase tracking-wider text-[#747878] block mb-1">
                  Inventory Alerts
                </span>
                <div className="flex items-baseline justify-between">
                  <span className={`font-mono text-[20px] font-semibold ${stats.lowStockCount > 0 || stats.outOfStockCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {stats.lowStockCount} Low / {stats.outOfStockCount} Out
                  </span>
                  <AlertCircle className={`w-4 h-4 ${stats.lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
                </div>
              </div>
            </div>

            {/* Automated Low Stock Alert Banner */}
            {stats.lowStockCount > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-[13px] uppercase tracking-wider text-amber-900">
                      Automated Low-Stock Trigger: {stats.lowStockCount} Garments Require Replenishment
                    </h4>
                    <p className="text-[12px] text-amber-800">
                      Real-time inventory detected remaining atelier stock $\le$ 4 items. Customers are receiving scarcity badges in store.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setStockFilter('LowStock')}
                    className="bg-white border border-amber-400 text-amber-900 px-3 py-1.5 text-[11px] font-display uppercase tracking-wider hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    View Low Items
                  </button>
                  <button
                    onClick={() => {
                      products.forEach((p) => {
                        const isLow = p.isLowStock || (p.stockCount !== undefined && p.stockCount <= 4);
                        if (isLow) {
                          const newCount = (p.stockCount || 2) + 10;
                          onUpdateProduct({
                            ...p,
                            stockCount: newCount,
                            isLowStock: false,
                            inStock: true,
                          });
                        }
                      });
                      showToast('Replenished 10 items for all low-stock garments.');
                    }}
                    className="bg-amber-900 text-white px-3.5 py-1.5 text-[11px] font-display uppercase tracking-wider hover:bg-amber-950 transition-colors cursor-pointer font-medium"
                  >
                    Restock All (+10)
                  </button>
                </div>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="bg-white border border-[#e5e5e5] p-4 space-y-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Search inventory by title, SKU, fabric, or cut..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#fbf9f9] border border-[#e5e5e5] pl-9 pr-3.5 py-2 text-[12px] text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c]"
                  />
                  <Search className="w-4 h-4 text-[#747878] absolute left-3 top-1/2 -translate-y-1/2" />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747878] hover:text-[#1b1c1c]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleOpenAddForm}
                  id="btn-add-garment-main"
                  className="bg-[#1b1c1c] text-white px-5 py-2 text-[11px] font-display uppercase tracking-[0.15em] font-medium hover:bg-[#5d5f5f] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap w-full md:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Garment</span>
                </button>
              </div>

              {/* Secondary filter dropdowns */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-[#e5e5e5]/70">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#fbf9f9] border border-[#e5e5e5] px-2.5 py-1.5 text-[11px] font-display uppercase tracking-wider text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c] cursor-pointer"
                >
                  <option value="All">Category: All</option>
                  <option value="Men">Men's Collection</option>
                  <option value="Women">Women's Collection</option>
                  <option value="Kids">Kids Collection</option>
                  <option value="New Arrivals">New Arrivals</option>
                  <option value="Trending">Trending</option>
                  <option value="Sale">Sale Pieces</option>
                </select>

                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="bg-[#fbf9f9] border border-[#e5e5e5] px-2.5 py-1.5 text-[11px] font-display uppercase tracking-wider text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c] cursor-pointer"
                >
                  <option value="All">Subcategory: All</option>
                  {allSubCategories.filter((s) => s !== 'All').map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>

                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="bg-[#fbf9f9] border border-[#e5e5e5] px-2.5 py-1.5 text-[11px] font-display uppercase tracking-wider text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c] cursor-pointer"
                >
                  <option value="All">Stock: All</option>
                  <option value="LowStock">⚠️ Low Stock (≤4 Only)</option>
                  <option value="InStock">In Stock Only</option>
                  <option value="OutOfStock">Out of Stock Only</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#fbf9f9] border border-[#e5e5e5] px-2.5 py-1.5 text-[11px] font-display uppercase tracking-wider text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c] cursor-pointer"
                >
                  <option value="newest">Latest Added</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="title">Title: A-Z</option>
                </select>
              </div>
            </div>

            {/* Products Management Table */}
            <div className="border border-[#e5e5e5] bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#efeded] text-[#1b1c1c] font-display uppercase tracking-wider text-[11px] border-b border-[#e5e5e5]">
                    <tr>
                      <th className="py-3.5 px-4">Garment</th>
                      <th className="py-3.5 px-3">Category</th>
                      <th className="py-3.5 px-3">Fabric & Cut</th>
                      <th className="py-3.5 px-3">Price ($ USD)</th>
                      <th className="py-3.5 px-3">Stock Status</th>
                      <th className="py-3.5 px-3">Tags</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#e5e5e5]">
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-[#747878] font-mono text-[13px]">
                          No garments match your filters. Try clearing your search terms.
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((product) => {
                        const isFeatured = product.id === FEATURED_PRODUCT.id;
                        const isQuickEditing = quickPriceEditId === product.id;

                        return (
                          <tr key={product.id} className="hover:bg-[#fbf9f9] transition-colors group">
                            {/* Garment Column */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3.5">
                                <div className="w-12 h-16 bg-[#efeded] flex-shrink-0 overflow-hidden border border-[#e5e5e5]">
                                  <img
                                    src={product.images[0]?.src || IMAGE_PRESETS[0].url}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-display font-medium text-[#1b1c1c] leading-snug">
                                    {product.title}
                                  </p>
                                  <span className="font-mono text-[11px] text-[#747878] block mt-0.5">
                                    SKU: {product.sku}
                                  </span>
                                  <span className="text-[10px] text-[#5d5f5f] font-mono">
                                    Sizes: {product.sizes.join(', ')}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3.5 px-3">
                              <span className="font-display uppercase tracking-wider text-[11px] font-semibold text-[#1b1c1c] block">
                                {product.category}
                              </span>
                              <span className="text-[11px] text-[#5d5f5f]">
                                {product.subCategory}
                              </span>
                            </td>

                            {/* Fabric & Silhouette */}
                            <td className="py-3.5 px-3 max-w-xs">
                              <p className="text-[12px] text-[#1b1c1c] line-clamp-1">
                                {product.fabric}
                              </p>
                              <p className="text-[11px] text-[#747878] line-clamp-1 italic mt-0.5">
                                {product.silhouette}
                              </p>
                            </td>

                            {/* Price (with quick in-line price edit) */}
                            <td className="py-3.5 px-3">
                              {isQuickEditing ? (
                                <div className="flex items-center gap-1">
                                  <span className="font-mono text-[13px]">$</span>
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={quickPriceValue}
                                    onChange={(e) => setQuickPriceValue(e.target.value)}
                                    className="w-20 bg-white border border-[#1b1c1c] px-2 py-1 text-[13px] font-mono focus:outline-none"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleQuickPriceSave(product)}
                                    className="p-1 bg-[#1b1c1c] text-white hover:bg-[#5d5f5f] cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setQuickPriceEditId(null)}
                                    className="p-1 text-[#747878] hover:text-[#1b1c1c] cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    setQuickPriceEditId(product.id);
                                    setQuickPriceValue(product.price.toString());
                                  }}
                                  title="Click to edit price directly"
                                  className="cursor-pointer group/price flex items-baseline gap-1.5 hover:bg-[#efeded] px-1.5 py-1 -ml-1.5 w-fit"
                                >
                                  <span className="font-mono text-[14px] font-semibold text-[#1b1c1c]">
                                    ${product.price.toFixed(2)}
                                  </span>
                                  {product.originalPrice && (
                                    <span className="line-through text-[#747878] text-[11px] font-mono">
                                      ${product.originalPrice.toFixed(2)}
                                    </span>
                                  )}
                                  <Edit2 className="w-3 h-3 text-[#747878] opacity-0 group-hover/price:opacity-100" />
                                </div>
                              )}
                            </td>

                            {/* Stock & Low-Stock Alerts */}
                            <td className="py-3.5 px-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleToggleStock(product)}
                                    className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-colors ${
                                      product.inStock && (product.stockCount === undefined || product.stockCount > 0)
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                        : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                                    }`}
                                  >
                                    {product.inStock && (product.stockCount === undefined || product.stockCount > 0) ? 'In Stock' : 'Out of Stock'}
                                  </button>
                                  {product.inStock && (product.isLowStock || (product.stockCount !== undefined && product.stockCount <= 4 && product.stockCount > 0)) && (
                                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-mono px-1.5 py-0.5 uppercase font-bold animate-pulse">
                                      ⚠️ Low
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-mono text-[#747878]">
                                  <span>{product.stockCount !== undefined ? `${product.stockCount} units` : '8 units'}</span>
                                  <button
                                    onClick={() => {
                                      const next = (product.stockCount || 0) + 5;
                                      onUpdateProduct({
                                        ...product,
                                        stockCount: next,
                                        isLowStock: next <= 4 && next > 0,
                                        inStock: true,
                                      });
                                      showToast(`Added +5 stock to ${product.title}`);
                                    }}
                                    title="Quick add 5 units"
                                    className="text-[9px] bg-[#efeded] hover:bg-[#1b1c1c] hover:text-white px-1.5 py-0.2 uppercase transition-colors"
                                  >
                                    +5 Stock
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Promotion Tags */}
                            <td className="py-3.5 px-3">
                              <div className="flex flex-wrap gap-1">
                                {product.isNewArrival && (
                                  <span className="bg-[#efeded] text-[#1b1c1c] text-[9px] font-mono uppercase px-1.5 py-0.5 border border-[#e5e5e5]">
                                    New
                                  </span>
                                )}
                                {product.isTrending && (
                                  <span className="bg-[#1b1c1c] text-white text-[9px] font-mono uppercase px-1.5 py-0.5">
                                    Trending
                                  </span>
                                )}
                                {product.isSale && (
                                  <span className="bg-rose-100 text-rose-900 text-[9px] font-mono uppercase px-1.5 py-0.5 border border-rose-300">
                                    Sale
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onViewProductInStore(product)}
                                  title="View on client boutique store"
                                  className="p-1.5 text-[#5d5f5f] hover:text-[#1b1c1c] hover:bg-[#efeded] transition-colors cursor-pointer"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleDuplicate(product)}
                                  title="Duplicate garment"
                                  className="p-1.5 text-[#5d5f5f] hover:text-[#1b1c1c] hover:bg-[#efeded] transition-colors cursor-pointer"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleOpenEditForm(product)}
                                  title="Edit full garment details"
                                  className="p-1.5 text-[#1b1c1c] hover:bg-[#efeded] transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                {!isFeatured && (
                                  <button
                                    onClick={() => setDeleteConfirmId(product.id)}
                                    title="Delete garment"
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CLIENT ORDERS LOG */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-[#e5e5e5]">
              <div>
                <h2 className="font-display text-[22px] uppercase tracking-[0.04em] font-medium text-[#1b1c1c]">
                  Customer Orders & Transactions
                </h2>
                <p className="text-[12px] text-[#5d5f5f] font-mono mt-0.5">
                  Real-time sales stream from checkout authorizations
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-display uppercase tracking-wider text-[#747878] block">
                  Total Order Volume
                </span>
                <span className="font-mono text-[20px] font-semibold text-[#1b1c1c]">
                  ${stats.totalOrderRevenue.toFixed(2)} USD
                </span>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="py-20 text-center bg-white border border-[#e5e5e5] p-8">
                <ShoppingBag className="w-10 h-10 text-[#747878] mx-auto mb-3" />
                <h3 className="font-display text-[16px] uppercase tracking-wider text-[#1b1c1c] mb-1">
                  No Customer Orders Placed Yet
                </h3>
                <p className="text-[13px] text-[#5d5f5f] max-w-md mx-auto mb-6 leading-relaxed">
                  When clients checkout in the boutique using Credit Card, Apple Pay, Klarna, or Bank Wire, order records and shipping addresses will appear here automatically.
                </p>
                <button
                  onClick={onCloseAdmin}
                  className="bg-[#1b1c1c] text-white px-6 py-2.5 text-[11px] font-display uppercase tracking-wider hover:bg-[#5d5f5f] transition-colors cursor-pointer"
                >
                  Test Store Checkout
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.orderId} className="bg-white border border-[#e5e5e5] p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-[#e5e5e5]">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-[14px] text-[#1b1c1c]">
                            {order.orderId}
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono uppercase px-2 py-0.5 font-semibold">
                            Paid & Authorized
                          </span>
                        </div>
                        <p className="text-[11px] text-[#747878] font-mono mt-0.5">
                          {order.date} • Method: <strong className="uppercase">{order.paymentMethod.replace('_', ' ')}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-[18px] font-bold text-[#1b1c1c]">
                          ${order.total.toFixed(2)} USD
                        </span>
                        <span className="text-[11px] text-[#5d5f5f] block">
                          {order.items.length} item(s)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-[12px]">
                      {/* Customer and shipping */}
                      <div className="space-y-1">
                        <span className="font-display uppercase tracking-wider text-[10px] text-[#747878] font-semibold block mb-1">
                          Client & Dispatch Destination
                        </span>
                        <p className="font-medium text-[#1b1c1c]">
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                        </p>
                        <p className="text-[#5d5f5f]">
                          {order.shippingAddress.addressLine1} {order.shippingAddress.addressLine2}
                        </p>
                        <p className="text-[#5d5f5f]">
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode} • {order.shippingAddress.country}
                        </p>
                        <p className="font-mono text-[#747878]">{order.shippingAddress.email}</p>
                      </div>

                      {/* Purchased items list */}
                      <div>
                        <span className="font-display uppercase tracking-wider text-[10px] text-[#747878] font-semibold block mb-2">
                          Ordered Garments
                        </span>
                        <div className="space-y-2">
                          {order.items.map((it) => (
                            <div key={it.id} className="flex items-center justify-between gap-2 p-2 bg-[#fbf9f9] border border-[#e5e5e5]">
                              <div className="flex items-center gap-2">
                                <img src={it.product.images[0]?.src} alt={it.product.title} className="w-8 h-10 object-cover bg-[#efeded]" />
                                <div>
                                  <p className="font-display font-medium text-[#1b1c1c] text-[12px]">{it.product.title}</p>
                                  <p className="font-mono text-[10px] text-[#747878]">Size {it.size} • Qty {it.quantity}</p>
                                </div>
                              </div>
                              <span className="font-mono text-[12px] font-semibold text-[#1b1c1c]">
                                ${(it.product.price * it.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ATELIER ANALYTICS */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="font-display text-[22px] uppercase tracking-[0.04em] font-medium text-[#1b1c1c] pb-4 border-b border-[#e5e5e5]">
              Atelier Catalog Insights & Financial Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white border border-[#e5e5e5] space-y-4">
                <span className="font-display uppercase tracking-wider text-[11px] text-[#747878] font-semibold block">
                  Category Distribution
                </span>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[12px] font-mono mb-1">
                      <span>Men's Tailoring</span>
                      <span>{stats.menCount} pieces</span>
                    </div>
                    <div className="w-full bg-[#efeded] h-2">
                      <div
                        className="bg-[#1b1c1c] h-2"
                        style={{ width: `${(stats.menCount / (stats.totalCount || 1)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[12px] font-mono mb-1">
                      <span>Women's Collection</span>
                      <span>{stats.womenCount} pieces</span>
                    </div>
                    <div className="w-full bg-[#efeded] h-2">
                      <div
                        className="bg-[#5d5f5f] h-2"
                        style={{ width: `${(stats.womenCount / (stats.totalCount || 1)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[12px] font-mono mb-1">
                      <span>Archival Sale</span>
                      <span>{stats.onSaleCount} pieces</span>
                    </div>
                    <div className="w-full bg-[#efeded] h-2">
                      <div
                        className="bg-rose-800 h-2"
                        style={{ width: `${(stats.onSaleCount / (stats.totalCount || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border border-[#e5e5e5] space-y-3">
                <span className="font-display uppercase tracking-wider text-[11px] text-[#747878] font-semibold block">
                  Valuation Metrics
                </span>
                <div className="space-y-2 pt-2 text-[13px]">
                  <div className="flex justify-between py-1 border-b border-[#e5e5e5]">
                    <span className="text-[#5d5f5f]">Total Retail Inventory Value</span>
                    <span className="font-mono font-semibold">${stats.totalValuation.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e5e5e5]">
                    <span className="text-[#5d5f5f]">Average Garment Price</span>
                    <span className="font-mono font-semibold">${stats.avgPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e5e5e5]">
                    <span className="text-[#5d5f5f]">Total Completed Orders</span>
                    <span className="font-mono font-semibold">{orders.length}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#5d5f5f]">Recorded Sales Revenue</span>
                    <span className="font-mono font-semibold text-emerald-800">${stats.totalOrderRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border border-[#e5e5e5] space-y-3">
                <span className="font-display uppercase tracking-wider text-[11px] text-[#747878] font-semibold block">
                  Inventory Health
                </span>
                <div className="space-y-2 pt-2 text-[13px]">
                  <div className="flex justify-between py-1 border-b border-[#e5e5e5]">
                    <span className="text-[#5d5f5f]">In-Stock Rate</span>
                    <span className="font-mono font-semibold text-emerald-800">
                      {Math.round(((stats.totalCount - stats.outOfStockCount) / (stats.totalCount || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e5e5e5]">
                    <span className="text-[#5d5f5f]">Out of Stock Warnings</span>
                    <span className={`font-mono font-semibold ${stats.outOfStockCount > 0 ? 'text-amber-700' : 'text-emerald-800'}`}>
                      {stats.outOfStockCount}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#5d5f5f]">Standard Currency</span>
                    <span className="font-mono font-semibold">USD ($)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SETTINGS & BACKUPS */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl">
            <h2 className="font-display text-[22px] uppercase tracking-[0.04em] font-medium text-[#1b1c1c] pb-4 border-b border-[#e5e5e5]">
              Cloud Infrastructure & Transactional Notification Settings
            </h2>

            {/* Cloud Firestore Database Status */}
            <div className="bg-white border border-[#e5e5e5] p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-[15px] uppercase tracking-wider font-semibold text-[#1b1c1c]">
                      Google Cloud Firestore Database
                    </h3>
                    <p className="font-mono text-[11px] text-[#5d5f5f]">
                      Project ID: <span className="font-bold text-[#1b1c1c]">bce64d61-067b-4a77-a80a-f71c1fef9ca4</span>
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono uppercase px-2.5 py-1 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Active & Synchronized
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-[12px]">
                <div className="p-3 bg-[#fbf9f9] border border-[#efeded]">
                  <span className="text-[#747878] font-mono text-[11px] block">Live Garments in Cloud</span>
                  <span className="font-display font-semibold text-[16px] text-[#1b1c1c]">{products.length} Items</span>
                </div>
                <div className="p-3 bg-[#fbf9f9] border border-[#efeded]">
                  <span className="text-[#747878] font-mono text-[11px] block">Persisted Orders</span>
                  <span className="font-display font-semibold text-[16px] text-[#1b1c1c]">{orders.length} Records</span>
                </div>
                <div className="p-3 bg-[#fbf9f9] border border-[#efeded]">
                  <span className="text-[#747878] font-mono text-[11px] block">Security Rules</span>
                  <span className="font-display font-semibold text-[16px] text-emerald-700">RBAC Enforced</span>
                </div>
              </div>
            </div>

            {/* Automated Transactional Email & SMS Gateway */}
            <div className="bg-white border border-[#e5e5e5] p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 text-blue-800 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-[15px] uppercase tracking-wider font-semibold text-[#1b1c1c]">
                      Transactional Email & SMS Services
                    </h3>
                    <p className="text-[12px] text-[#5d5f5f]">
                      Automated order confirmation receipts, dispatch tickets, and live courier tracking alerts.
                    </p>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-mono uppercase px-2 py-0.5 font-semibold">
                  Resend & SendGrid Ready
                </span>
              </div>

              {/* Test Dispatch Console */}
              <div className="p-4 bg-[#fbf9f9] border border-[#efeded] space-y-3">
                <span className="font-display uppercase tracking-wider text-[11px] text-[#1b1c1c] font-semibold block">
                  Send Test Order Confirmation & Tracking Alert
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#747878] mb-1">
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="w-full bg-white border border-[#e5e5e5] px-3 py-1.5 text-[12px] font-mono text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#747878] mb-1">
                      Recipient Phone (SMS)
                    </label>
                    <input
                      type="tel"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      className="w-full bg-white border border-[#e5e5e5] px-3 py-1.5 text-[12px] font-mono text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSendingTest}
                    onClick={async () => {
                      setIsSendingTest(true);
                      setTestResult(null);
                      try {
                        const mockSampleOrder: OrderConfirmation = {
                          orderId: `MSN-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
                          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                          items: [
                            {
                              id: 'test-item-1',
                              product: products[0] || FEATURED_PRODUCT,
                              size: 'M',
                              quantity: 1,
                            },
                          ],
                          shippingAddress: {
                            firstName: 'Test',
                            lastName: 'Patron',
                            email: testEmail,
                            phone: testPhone,
                            addressLine1: '100 Haute Couture Blvd',
                            city: 'Paris',
                            state: 'Ile-de-France',
                            postalCode: '75001',
                            country: 'France',
                            deliverySpeed: 'express',
                          },
                          paymentMethod: 'card',
                          subtotal: (products[0] || FEATURED_PRODUCT).price,
                          discount: 0,
                          shippingCost: 0,
                          tax: (products[0] || FEATURED_PRODUCT).price * 0.08,
                          total: (products[0] || FEATURED_PRODUCT).price * 1.08,
                          trackingNumber: `DHL-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
                          carrier: 'DHL Express Worldwide',
                          estimatedDelivery: '2 Business Days',
                        };

                        const res = await sendOrderConfirmationNotifications(mockSampleOrder);
                        setTestResult(`Dispatched test email receipt to ${testEmail} and SMS tracking payload to ${testPhone} via automated provider (${res.emailLog.provider}).`);
                        showToast('Test transactional email and SMS sent successfully!');
                      } catch {
                        setTestResult('Failed to dispatch test notification.');
                      } finally {
                        setIsSendingTest(false);
                      }
                    }}
                    className="bg-[#1b1c1c] text-white px-4 py-2 text-[11px] font-display uppercase tracking-wider hover:bg-[#5d5f5f] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingTest ? 'Dispatching...' : 'Dispatch Test Receipt & SMS'}</span>
                  </button>
                </div>

                {testResult && (
                  <p className="text-[11px] font-mono text-emerald-800 bg-emerald-50 p-2.5 border border-emerald-200 mt-2">
                    {testResult}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#e5e5e5] p-6 space-y-4">
              <div>
                <h3 className="font-display text-[15px] uppercase tracking-wider font-semibold text-[#1b1c1c]">
                  Export Catalog Backup
                </h3>
                <p className="text-[13px] text-[#5d5f5f] mt-1">
                  Save all current garments, pricing adjustments, custom photos, and sizing records as a portable JSON file.
                </p>
              </div>
              <button
                onClick={handleExportJson}
                className="border border-[#1b1c1c] bg-white px-5 py-2.5 text-[11px] font-display uppercase tracking-wider hover:bg-[#1b1c1c] hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Catalog Data (.JSON)</span>
              </button>
            </div>

            <div className="bg-white border border-[#e5e5e5] p-6 space-y-4">
              <div>
                <h3 className="font-display text-[15px] uppercase tracking-wider font-semibold text-rose-900">
                  Reset Catalog to Factory Defaults
                </h3>
                <p className="text-[13px] text-[#5d5f5f] mt-1">
                  Reverts all custom edits, deleted items, and newly added pieces back to the original atelier collection dataset.
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset the catalog back to factory defaults?')) {
                    onResetToDefault();
                    showToast('Catalog restored to default boutique collection.');
                  }
                }}
                className="bg-rose-700 text-white px-5 py-2.5 text-[11px] font-display uppercase tracking-wider hover:bg-rose-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restore Default Pieces</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#e5e5e5] max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-[18px] uppercase tracking-wider text-[#1b1c1c] font-medium">
              Confirm Archival Deletion
            </h3>
            <p className="text-[13px] text-[#5d5f5f] leading-relaxed">
              Are you sure you wish to remove this garment from the active Elite Fashion Hub catalog? This action will immediately unlist it from client views.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="border border-[#e5e5e5] px-4 py-2 text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] hover:bg-[#efeded] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-rose-700 text-white px-5 py-2 text-[11px] font-display uppercase tracking-wider hover:bg-rose-800 cursor-pointer"
              >
                Delete Garment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT GARMENT MODAL FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/60 backdrop-blur-xs">
          <div className="relative bg-[#fbf9f9] border border-[#e5e5e5] max-w-4xl w-full p-6 md:p-8 shadow-2xl z-10 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[#e5e5e5] mb-6">
              <div>
                <span className="text-[10px] font-display uppercase tracking-[0.2em] text-[#747878] font-semibold">
                  {editingProduct ? 'Update Garment Record' : 'Atelier Creation Workshop'}
                </span>
                <h2 className="font-display text-[22px] md:text-[26px] uppercase tracking-[0.05em] text-[#1b1c1c] font-medium">
                  {editingProduct ? `Edit: ${editingProduct.title}` : 'Add New Garment'}
                </h2>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-[#1b1c1c] hover:opacity-60 transition-opacity p-2 -mr-2 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveForm} className="space-y-6">
              {/* Row 1: Title & SKU */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1">
                    Garment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Double-Breasted Cashmere Trench"
                    className="w-full bg-white border border-[#e5e5e5] px-3.5 py-2.5 text-[13px] text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1">
                    SKU Reference *
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full bg-white border border-[#e5e5e5] px-3 py-2.5 text-[13px] font-mono text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          sku: `MSN-${Math.floor(1000 + Math.random() * 9000)}-${Math.random() > 0.5 ? 'BLK' : 'WHT'}`,
                        })
                      }
                      title="Generate new random SKU"
                      className="px-2.5 bg-[#efeded] text-[#1b1c1c] text-[10px] font-mono hover:bg-[#e3e2e2] cursor-pointer"
                    >
                      Gen
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Category, Gender, Subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1">
                    Collection Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-white border border-[#e5e5e5] px-3 py-2.5 text-[12px] font-display uppercase tracking-wider text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c] cursor-pointer"
                  >
                    <option value="Men">Men's Collection</option>
                    <option value="Women">Women's Collection</option>
                    <option value="Kids">Kids Collection</option>
                    <option value="New Arrivals">New Arrivals</option>
                    <option value="Trending">Trending Pieces</option>
                    <option value="Sale">Archival Sale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1">
                    Gender Line
                  </label>
                  <select
                    value={formData.gender || 'Unisex'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-white border border-[#e5e5e5] px-3 py-2.5 text-[12px] font-display uppercase tracking-wider text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c] cursor-pointer"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1">
                    SubCategory Type *
                  </label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value as any })}
                    className="w-full bg-white border border-[#e5e5e5] px-3 py-2.5 text-[12px] font-display uppercase tracking-wider text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c] cursor-pointer"
                  >
                    {allSubCategories.filter((s) => s !== 'All').map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Price, Sale Price, Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1">
                    Acquisition Price ($ USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[13px] text-[#747878]">$</span>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-[#e5e5e5] pl-8 pr-3 py-2.5 text-[13px] font-mono text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1">
                    Original Price ($ for Sale discount)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[13px] text-[#747878]">$</span>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.originalPrice || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          originalPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder="Optional"
                      className="w-full bg-white border border-[#e5e5e5] pl-8 pr-3 py-2.5 text-[13px] font-mono text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1">
                    Stock Availability
                  </label>
                  <div
                    onClick={() => setFormData({ ...formData, inStock: !formData.inStock })}
                    className={`py-2.5 px-4 border flex items-center justify-between cursor-pointer transition-colors ${
                      formData.inStock ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'
                    }`}
                  >
                    <span className="text-[12px] font-mono uppercase font-semibold">
                      {formData.inStock ? '✓ In Stock' : '✕ Out of Stock'}
                    </span>
                    <span className="text-[11px] text-[#747878]">Toggle</span>
                  </div>
                </div>
              </div>

              {/* Row 4: Tags Checkboxes */}
              <div className="p-4 bg-white border border-[#e5e5e5]">
                <span className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-2 font-semibold">
                  Promotional & Editorial Tags
                </span>
                <div className="flex flex-wrap gap-6 text-[12px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNewArrival || false}
                      onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                      className="accent-[#1b1c1c]"
                    />
                    <span>New Arrival</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isTrending || false}
                      onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                      className="accent-[#1b1c1c]"
                    />
                    <span>Trending Essential</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSale || Boolean(formData.originalPrice)}
                      onChange={(e) => setFormData({ ...formData, isSale: e.target.checked })}
                      className="accent-[#1b1c1c]"
                    />
                    <span>Archival Sale</span>
                  </label>
                </div>
              </div>

              {/* Row 5: Fabric & Silhouette */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1">
                    Fabric Composition *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="e.g. 85% Virgin Wool, 15% Mohair; Cupro lining"
                    className="w-full bg-white border border-[#e5e5e5] px-3.5 py-2.5 text-[13px] text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1">
                    Silhouette & Fit Cut *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.silhouette}
                    onChange={(e) => setFormData({ ...formData, silhouette: e.target.value })}
                    placeholder="e.g. Architectural Straight Cut"
                    className="w-full bg-white border border-[#e5e5e5] px-3.5 py-2.5 text-[13px] text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c]"
                  />
                </div>
              </div>

              {/* Row 6: Sizes selection */}
              <div>
                <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1.5">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'].map((sz) => {
                    const hasSize = formData.sizes.includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => {
                          const next = hasSize
                            ? formData.sizes.filter((s) => s !== sz)
                            : [...formData.sizes, sz];
                          setFormData({ ...formData, sizes: next });
                        }}
                        className={`px-4 py-2 text-[12px] font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                          hasSize
                            ? 'bg-[#1b1c1c] text-white border-[#1b1c1c]'
                            : 'bg-white text-[#5d5f5f] border-[#e5e5e5] hover:border-[#1b1c1c]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 7: Editorial Description */}
              <div>
                <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1">
                  Editorial Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-[#e5e5e5] p-3 text-[13px] text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c] leading-relaxed"
                />
              </div>

              {/* Row 8: Details & Care Bullet points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1">
                    Tailoring Details (One line per bullet)
                  </label>
                  <textarea
                    rows={4}
                    value={detailsText}
                    onChange={(e) => setDetailsText(e.target.value)}
                    placeholder="Hand-finished pick stitching&#10;Interior passport pocket&#10;Reinforced horn buttons"
                    className="w-full bg-white border border-[#e5e5e5] p-3 text-[12px] font-mono text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1">
                    Care Guidelines (One line per bullet)
                  </label>
                  <textarea
                    rows={4}
                    value={careText}
                    onChange={(e) => setCareText(e.target.value)}
                    placeholder="Specialist dry clean only&#10;Store on wooden shoulder hanger"
                    className="w-full bg-white border border-[#e5e5e5] p-3 text-[12px] font-mono text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c]"
                  />
                </div>
              </div>

              {/* Row 9: Imagery (Presets or Custom URL) */}
              <div className="p-4 bg-white border border-[#e5e5e5] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] font-semibold">
                    Garment Photography
                  </span>
                  <span className="text-[10px] font-mono text-[#747878]">
                    Select high-res editorial preset or input custom URL
                  </span>
                </div>

                {/* Preset Thumbnails */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {IMAGE_PRESETS.map((preset, idx) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => {
                        setFormImagePresetIndex(idx);
                        setCustomImageUrl(preset.url);
                      }}
                      className={`w-14 h-18 bg-[#efeded] flex-shrink-0 border overflow-hidden cursor-pointer transition-all ${
                        customImageUrl === preset.url
                          ? 'border-[#1b1c1c] ring-2 ring-[#1b1c1c]/20'
                          : 'border-[#e5e5e5] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Custom URL Input */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#747878] mb-1">
                    Active Image URL
                  </label>
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#fbf9f9] border border-[#e5e5e5] px-3 py-2 text-[12px] font-mono text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="border border-[#e5e5e5] px-6 py-3 text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] hover:bg-[#efeded] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1b1c1c] text-white px-8 py-3 text-[11px] font-display uppercase tracking-[0.15em] hover:bg-[#5d5f5f] transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Save Modifications' : 'Publish Garment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
