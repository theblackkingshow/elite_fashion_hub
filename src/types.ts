export type CollectionCategory = 'New Arrivals' | 'Men' | 'Women' | 'Kids' | 'Trending' | 'Sale';

export type SubCategory =
  | 'All'
  | 'Dresses & Jumpsuits'
  | 'Outerwear'
  | 'Blazers & Tailoring'
  | 'Knitwear'
  | 'Trousers & Denim'
  | 'Shirts & Polos'
  | 'Tops & Blouses'
  | 'Afro-Chic & Traditional'
  | 'Footwear & Sneakers'
  | 'Watches & Jewelry'
  | 'Leather & Bags'
  | 'Activewear & Streetwear';

export type CurrencyCode = 'AUD' | 'USD' | 'EUR' | 'GBP' | 'KES';

export interface Product {
  id: string;
  title: string;
  category: CollectionCategory;
  gender?: 'Women' | 'Men' | 'Unisex' | 'Kids';
  subCategory: SubCategory;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  description: string;
  details: string[];
  careInstructions: string[];
  shippingAndReturns: {
    shipping: string;
    returns: string;
  };
  sizes: string[];
  images: {
    src: string;
    alt: string;
    caption?: string;
  }[];
  fabric: string;
  silhouette: string;
  fit: string;
  sku: string;
  inStock: boolean;
  stockCount?: number;
  stockPerSize?: Record<string, number>;
  isLowStock?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  isSale?: boolean;
  createdAt?: string;
  brand?: string;
  jumiaExpress?: boolean;
  officialStore?: boolean;
}

export interface CartItem {
  id: string; // unique item id (productId + size)
  product: Product;
  size: string;
  quantity: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  deliverySpeed: 'express' | 'standard' | 'atelier_priority' | 'auspost_express';
}

export type PaymentMethodType =
  | 'card'
  | 'apple_pay'
  | 'google_pay'
  | 'afterpay'
  | 'payid'
  | 'bpay'
  | 'klarna'
  | 'bank_transfer';

export interface CardDetails {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvc: string;
  saveCard: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  tier?: 'Atelier Member' | 'Noir VIP' | 'Haute Couture Patron';
  createdAt?: string;
  savedAddresses?: ShippingAddress[];
  wishlistIds?: string[];
  ordersCount?: number;
}

export interface OrderConfirmation {
  orderId: string;
  date: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethodType;
  currency?: CurrencyCode;
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  status?: 'processing' | 'shipped' | 'delivered';
  notificationStatus?: {
    emailSent: boolean;
    smsSent: boolean;
    provider?: string;
    emailRecipient?: string;
    smsRecipient?: string;
    timestamp?: string;
  };
}

export interface EditorialArticle {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  readTime: string;
  image: string;
  content: string[];
}
