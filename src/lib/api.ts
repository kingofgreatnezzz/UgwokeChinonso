// ================================================================
// Artist Portfolio — API Client (Axios)
// Points to local Next.js API routes
// ================================================================

import axios, { AxiosError } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Artwork,
  ArtworkType,
  Order,
  OrderStatus,
  PaymentStatus,
  CartItem,
  Review,
  Collection,
  ContactMessage,
  Testimonial,
  SiteSettings,
  DashboardStats,
  NewsletterSubscriber,
  PaymentProof,
} from '@/types';

// ─── Axios Instance ──────────────────────────────────────────────

const api = axios.create({
  baseURL: '/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor — Attach JWT ────────────────────────────

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('artist_portfolio_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor — Error Handling ───────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';

    // Handle 401 — clear token
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('artist_portfolio_token');
    }

    return Promise.reject({ ...error, friendlyMessage: message });
  },
);

// ─── Helper ──────────────────────────────────────────────────────

function extractData<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

function extractPaginated<T>(response: { data: PaginatedResponse<T> }): PaginatedResponse<T> {
  return response.data;
}

// =================================================================
//  AUTH ENDPOINTS
// =================================================================

export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password });
    return extractData(res);
  },

  register: async (data: { name: string; email: string; password: string; phone?: string }): Promise<{ user: User; token: string }> => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
    return extractData(res);
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return extractData(res);
  },
};

// =================================================================
//  ARTWORK ENDPOINTS
// =================================================================

interface ArtworkFilters {
  page?: number;
  limit?: number;
  type?: ArtworkType;
  topic?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  search?: string;
  sort?: string;
  collection?: string;
}

export const artworkApi = {
  getArtworks: async (filters?: ArtworkFilters): Promise<PaginatedResponse<Artwork[]>> => {
    const res = await api.get<PaginatedResponse<Artwork[]>>('/artworks', { params: filters });
    return extractPaginated(res);
  },

  getFeatured: async (): Promise<Artwork[]> => {
    const res = await api.get<ApiResponse<Artwork[]>>('/artworks/featured');
    return extractData(res);
  },

  getLatest: async (limit?: number): Promise<Artwork[]> => {
    const res = await api.get<ApiResponse<Artwork[]>>('/artworks/latest', { params: { limit } });
    return extractData(res);
  },

  getArtwork: async (slug: string): Promise<Artwork> => {
    const res = await api.get<ApiResponse<Artwork>>(`/artworks/${slug}`);
    return extractData(res);
  },

  createArtwork: async (data: FormData): Promise<Artwork> => {
    const res = await api.post<ApiResponse<Artwork>>('/artworks', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData(res);
  },

  updateArtwork: async (id: string, data: Partial<Artwork> | FormData): Promise<Artwork> => {
    const isFormData = data instanceof FormData;
    const res = await api.patch<ApiResponse<Artwork>>(`/artworks/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return extractData(res);
  },

  deleteArtwork: async (id: string): Promise<void> => {
    await api.delete(`/artworks/${id}`);
  },

  uploadImages: async (id: string, formData: FormData): Promise<Artwork> => {
    const res = await api.post<ApiResponse<Artwork>>(`/artworks/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData(res);
  },
};

// =================================================================
//  ORDER ENDPOINTS
// =================================================================

interface CreateOrderInput {
  items: { artworkId: string; quantity: number; title: string; price: number; image: string }[];
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
  paymentMethod: string;
}

export const orderApi = {
  createOrder: async (data: CreateOrderInput): Promise<Order> => {
    const res = await api.post<ApiResponse<Order>>('/orders', data);
    return extractData(res);
  },

  getOrders: async (): Promise<Order[]> => {
    const res = await api.get<ApiResponse<Order[]>>('/orders');
    return extractData(res);
  },

  getOrder: async (id: string): Promise<Order> => {
    const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return extractData(res);
  },

  updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const res = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return extractData(res);
  },

  updatePaymentStatus: async (id: string, paymentStatus: PaymentStatus): Promise<Order> => {
    const res = await api.patch<ApiResponse<Order>>(`/orders/${id}/payment`, { paymentStatus });
    return extractData(res);
  },

  getAllOrders: async (params?: { page?: number; limit?: number; status?: OrderStatus }): Promise<PaginatedResponse<Order[]>> => {
    const res = await api.get<PaginatedResponse<Order[]>>('/orders/all', { params });
    return extractPaginated(res);
  },
};

// =================================================================
//  WISHLIST ENDPOINTS
// =================================================================

export const wishlistApi = {
  getWishlist: async (): Promise<Artwork[]> => {
    const res = await api.get<ApiResponse<Artwork[]>>('/wishlist');
    return extractData(res);
  },

  addToWishlist: async (artworkId: string): Promise<void> => {
    await api.post('/wishlist', { artworkId });
  },

  removeFromWishlist: async (artworkId: string): Promise<void> => {
    await api.delete(`/wishlist?artworkId=${artworkId}`);
  },
};

// =================================================================
//  COLLECTION ENDPOINTS
// =================================================================

export const collectionApi = {
  getCollections: async (): Promise<Collection[]> => {
    const res = await api.get<ApiResponse<Collection[]>>('/collections');
    return extractData(res);
  },

  getCollection: async (slug: string): Promise<Collection> => {
    const res = await api.get<ApiResponse<Collection>>(`/collections/${slug}`);
    return extractData(res);
  },

  createCollection: async (data: FormData): Promise<Collection> => {
    const res = await api.post<ApiResponse<Collection>>('/collections', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData(res);
  },

  updateCollection: async (id: string, data: Partial<Collection> | FormData): Promise<Collection> => {
    const isFormData = data instanceof FormData;
    const res = await api.patch<ApiResponse<Collection>>(`/collections/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return extractData(res);
  },

  deleteCollection: async (id: string): Promise<void> => {
    await api.delete(`/collections/${id}`);
  },
};

// =================================================================
//  REVIEW ENDPOINTS
// =================================================================

export const reviewApi = {
  addReview: async (artworkId: string, data: { rating: number; comment: string }): Promise<Review> => {
    const res = await api.post<ApiResponse<Review>>('/reviews', { ...data, artworkId });
    return extractData(res);
  },

  getReviews: async (artworkId: string): Promise<{ reviews: Review[]; total: number; averageRating: number }> => {
    const res = await api.get<ApiResponse<{ reviews: Review[]; total: number; averageRating: number }>>(`/reviews/artwork/${artworkId}`);
    return extractData(res);
  },
};

// =================================================================
//  CONTACT ENDPOINTS
// =================================================================

export const contactApi = {
  submitContact: async (data: { name: string; email: string; subject: string; message: string }): Promise<void> => {
    await api.post('/contact', data);
  },

  getMessages: async (): Promise<ContactMessage[]> => {
    const res = await api.get<ApiResponse<ContactMessage[]>>('/contact');
    return extractData(res);
  },

  markMessageRead: async (id: string): Promise<void> => {
    await api.patch(`/contact/messages/${id}/read`);
  },
};

// =================================================================
//  CONTENT ENDPOINTS
// =================================================================

export const contentApi = {
  getPageContent: async (page: string): Promise<Record<string, unknown>> => {
    const res = await api.get<ApiResponse<Record<string, unknown>>>(`/content/page/${page}`);
    return extractData(res);
  },

  updatePageContent: async (page: string, data: Record<string, unknown>): Promise<Record<string, unknown>> => {
    const res = await api.put<ApiResponse<Record<string, unknown>>>(`/content/page/${page}`, data);
    return extractData(res);
  },

  getTestimonials: async (): Promise<Testimonial[]> => {
    const res = await api.get<ApiResponse<Testimonial[]>>('/content/testimonials');
    return extractData(res);
  },

  createTestimonial: async (data: FormData | Omit<Testimonial, 'id'>): Promise<Testimonial> => {
    const res = await api.post<ApiResponse<Testimonial>>('/content/testimonials', data);
    return extractData(res);
  },

  deleteTestimonial: async (id: string): Promise<void> => {
    await api.delete(`/content/testimonials/${id}`);
  },

  subscribeNewsletter: async (email: string): Promise<NewsletterSubscriber> => {
    const res = await api.post<ApiResponse<NewsletterSubscriber>>('/content/newsletter', { email });
    return extractData(res);
  },
};

// =================================================================
//  SITE SETTINGS ENDPOINTS
// =================================================================

export const settingsApi = {
  getSiteSettings: async (): Promise<SiteSettings> => {
    const res = await api.get<ApiResponse<SiteSettings>>('/content/settings');
    return extractData(res);
  },

  updateSiteSetting: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    const res = await api.patch<ApiResponse<SiteSettings>>('/content/settings', data);
    return extractData(res);
  },
};

// =================================================================
//  DASHBOARD ENDPOINTS
// =================================================================

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return extractData(res);
  },
};

// ─── Default Export ──────────────────────────────────────────────
export default api;
