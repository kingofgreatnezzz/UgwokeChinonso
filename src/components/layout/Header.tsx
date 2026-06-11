// ================================================================
// Artist Portfolio — Header Component
// ================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingBag,
  ChevronDown,
  LogIn,
  UserPlus,
  User,
  LogOut,
  Settings,
  Package,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/lib/store';
import { useAuthStore } from '@/lib/store';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

// ─── Navigation Links ────────────────────────────────────────────

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/shop', label: 'Shop' },
  { href: '/contact', label: 'Contact' },
];

const socialLinks = [
  { href: 'https://instagram.com', label: 'Instagram', icon: 'INSTAGRAM' },
  { href: 'https://facebook.com', label: 'Facebook', icon: 'FACEBOOK' },
  { href: 'https://twitter.com', label: 'X / Twitter', icon: 'X' },
  { href: 'https://tiktok.com', label: 'TikTok', icon: 'TIKTOK' },
  { href: 'https://youtube.com', label: 'YouTube', icon: 'YOUTUBE' },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: 'LINKEDIN' },
  { href: 'https://pinterest.com', label: 'Pinterest', icon: 'PINTEREST' },
  { href: 'https://whatsapp.com', label: 'WhatsApp', icon: 'WHATSAPP' },
];

// ─── Social Icon SVG Components ──────────────────────────────────

const SocialIcon = ({ platform, className }: { platform: string; className?: string }) => {
  const props = { className: cn('h-4 w-4', className) };
  switch (platform) {
    case 'INSTAGRAM':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'FACEBOOK':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'X':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'TIKTOK':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    case 'YOUTUBE':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'LINKEDIN':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case 'PINTEREST':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.403.042-3.438.218-.932 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      );
    case 'WHATSAPP':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    default:
      return null;
  }
};

// ─── Header Component ────────────────────────────────────────────

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const {
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    toggleSearch,
    openCart,
  } = useUiStore();

  const { isAuthenticated, isAdmin, user, logout } = useAuthStore();
  const { totalQuantity } = useCartStore();

  // Auth dropdown state
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  // Track scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  // Close auth dropdown on click outside
  const handleAuthToggle = useCallback(() => {
    setAuthDropdownOpen((prev) => !prev);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-30 transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-lg shadow-sm border-b border-stone-200/60'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* ── Logo ─────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-stone-900 transition-colors hover:text-amber-700"
          >
            <span className="font-serif text-2xl">A.</span>
            <span className="hidden sm:inline font-serif">Atelier</span>
          </Link>

          {/* ── Desktop Nav ──────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg',
                  pathname === link.href
                    ? 'text-amber-700 bg-amber-50/60'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50',
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* ── Actions ──────────────────────────────────── */}
          <div className="flex items-center gap-1.5">
            {/* Search */}
            <button
              onClick={toggleSearch}
              className="p-2.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Social Icons (desktop) */}
            <div className="hidden lg:flex items-center gap-0.5 mr-1">
              {socialLinks.slice(0, 4).map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                  aria-label={s.label}
                >
                  <SocialIcon platform={s.icon} />
                </a>
              ))}
            </div>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalQuantity() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white shadow-sm">
                  {totalQuantity() > 9 ? '9+' : totalQuantity()}
                </span>
              )}
            </button>

            {/* Auth (Desktop) */}
            {isAuthenticated ? (
              <div className="relative ml-1">
                <button
                  onClick={handleAuthToggle}
                  className="flex items-center gap-1.5 p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-[11px] font-bold text-white shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 hidden sm:block" />
                </button>

                <AnimatePresence>
                  {authDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1 w-48 origin-top-right rounded-xl border border-stone-200 bg-white shadow-lg py-1.5"
                    >
                      <div className="px-3 py-2 border-b border-stone-100">
                        <p className="text-sm font-medium text-stone-900 truncate">{user?.name}</p>
                        <p className="text-xs text-stone-400 truncate">{user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                        onClick={() => setAuthDropdownOpen(false)}
                      >
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                        onClick={() => setAuthDropdownOpen(false)}
                      >
                        <Package className="h-4 w-4" /> Orders
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                          onClick={() => setAuthDropdownOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); setAuthDropdownOpen(false); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1 ml-1">
                <Link href="/login">
                  <Button variant="ghost" size="sm" leftIcon={<LogIn className="h-4 w-4" />}>
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" leftIcon={<UserPlus className="h-4 w-4" />}>
                    Join
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden border-t border-stone-200/60 bg-white/95 backdrop-blur-lg overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'text-amber-700 bg-amber-50'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50',
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <hr className="my-3 border-stone-100" />

              {/* Mobile Auth */}
              {isAuthenticated ? (
                <div className="space-y-1">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-stone-900">{user?.name}</p>
                    <p className="text-xs text-stone-400">{user?.email}</p>
                  </div>
                  <Link href="/profile" className="block px-3 py-2.5 rounded-lg text-sm text-stone-600 hover:bg-stone-50">
                    Profile
                  </Link>
                  <Link href="/orders" className="block px-3 py-2.5 rounded-lg text-sm text-stone-600 hover:bg-stone-50">
                    Orders
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="block px-3 py-2.5 rounded-lg text-sm text-amber-700 hover:bg-amber-50">
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-3 pt-1">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm" className="w-full">
                      Create Account
                    </Button>
                  </Link>
                </div>
              )}

              {/* Social Links */}
              <div className="flex items-center gap-1 px-3 pt-3">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    aria-label={s.label}
                  >
                    <SocialIcon platform={s.icon} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export { Header, SocialIcon };
