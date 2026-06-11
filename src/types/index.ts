// ================================================================
// Artist Portfolio — TypeScript Type Definitions
// ================================================================

// ─── User ────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  avatar?: string;
  phone?: string;
  createdAt: string;
}

// ─── Artwork ─────────────────────────────────────────────────────
export type ArtworkType =
  | 'painting'
  | 'sculpture'
  | 'photography'
  | 'digital'
  | 'mixed-media'
  | 'print'
  | 'drawing'
  | 'ceramics'
  | 'textile'
  | 'other';

export interface ArtworkImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface Artwork {
  id: string;
  title: string;
  slug: string;
  description: string;
  topic: string;
  type: ArtworkType;
  size: string;
  price: number;
  salePrice?: number;
  quantity: number;
  featured: boolean;
  inStock: boolean;
  views: number;
  images: ArtworkImage[];
  collection?: Collection;
  reviews?: Review[];
  createdAt: string;
}

// ─── Collection ──────────────────────────────────────────────────
export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  artworks?: Artwork[];
  artworkCount?: number;
}

// ─── Order ───────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'failed';

export interface OrderItem {
  id: string;
  orderId: string;
  artworkId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentProof?: PaymentProof;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

// ─── Cart ────────────────────────────────────────────────────────
export interface CartItem extends Artwork {
  quantity: number;
}

// ─── Review ──────────────────────────────────────────────────────
export interface Review {
  id: string;
  rating: number;
  comment: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  createdAt: string;
}

// ─── Testimonial ─────────────────────────────────────────────────
export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  avatar?: string;
  rating: number;
}

// ─── Site Settings ───────────────────────────────────────────────
export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode?: string;
  routingNumber?: string;
  iban?: string;
  swift?: string;
}

export interface CryptoAddress {
  network: string;
  address: string;
  symbol: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  artistName: string;
  artistBio: string;
  artistEmail: string;
  artistPhone: string;
  address: string;
  currency: string;
  currencySymbol: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
    pinterest?: string;
    whatsapp?: string;
    etsy?: string;
  };
  shippingFee: number;
  freeShippingThreshold: number;
  bankDetails: BankDetails;
  cryptoAddresses: CryptoAddress[];
  paymentMethods: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  maintenanceMode: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Contact Message ─────────────────────────────────────────────
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Payment Proof ───────────────────────────────────────────────
export interface PaymentProof {
  id: string;
  orderId: string;
  imageUrl: string;
  notes?: string;
  uploadedAt: string;
}

// ─── API Responses ───────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ─── Dashboard Stats ────────────────────────────────────────────
export interface SalesByMonth {
  month: string;
  sales: number;
  revenue: number;
}

export interface DashboardStats {
  totalArtworks: number;
  totalSales: number;
  totalOrders: number;
  revenue: number;
  recentOrders: Order[];
  salesByMonth: SalesByMonth[];
}

// ─── Newsletter ──────────────────────────────────────────────────
export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}
