// ================================================================
// Artist Portfolio — Zustand Stores
// ================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, User } from '@/types';

// =================================================================
//  CART STORE
// =================================================================

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (artworkId: string) => void;
  updateQuantity: (artworkId: string, quantity: number) => void;
  clearCart: () => void;
  /** Readonly computed: subtotal before any fees */
  subtotal: () => number;
  /** Readonly computed: total (could be subtotal + shipping - discount) */
  total: () => number;
  /** Readonly computed: number of unique items */
  itemCount: () => number;
  /** Total quantity of all items */
  totalQuantity: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: CartItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.quantity) }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (artworkId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== artworkId),
        }));
      },

      updateQuantity: (artworkId: string, quantity: number) => {
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.id !== artworkId)
            : state.items.map((i) =>
                i.id === artworkId ? { ...i, quantity } : i,
              ),
        }));
      },

      clearCart: () => set({ items: [] }),

      subtotal: () => {
        return get().items.reduce((sum, item) => {
          const price = item.salePrice ?? item.price;
          return sum + price * item.quantity;
        }, 0);
      },

      total: () => {
        // For now total equals subtotal; can add shipping/tax logic later
        return get().subtotal();
      },

      itemCount: () => get().items.length,

      totalQuantity: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'artist-portfolio-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

// =================================================================
//  AUTH STORE
// =================================================================

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      login: (user: User, token: string) => {
        localStorage.setItem('artist_portfolio_token', token);
        set({
          user,
          token,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
        });
      },

      logout: () => {
        localStorage.removeItem('artist_portfolio_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },

      setUser: (user: User) => {
        set({
          user,
          isAdmin: user.role === 'admin',
        });
      },
    }),
    {
      name: 'artist-portfolio-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    },
  ),
);

// =================================================================
//  UI STORE
// =================================================================

interface UiState {
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  toggleMobileMenu: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  isMobileMenuOpen: false,
  isCartOpen: false,
  isSearchOpen: false,

  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
}));
