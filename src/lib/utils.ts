// ================================================================
// Artist Portfolio — Utility Functions
// ================================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ArtworkImage } from '@/types';

// ─── Class Name Merger (Tailwind) ────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Price Formatting ────────────────────────────────────────────

/**
 * Format a number as currency.
 * Uses ₦ (NGN) by default; pass 'USD' for $.
 */
export function formatPrice(price: number, currency: 'NGN' | 'USD' = 'NGN'): string {
  if (currency === 'NGN') {
    return `₦${price.toLocaleString('en-NG')}`;
  }
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Date Formatting ─────────────────────────────────────────────

/**
 * Format an ISO date string into a readable format.
 * Example: "Jan 15, 2025"
 */
export function formatDate(date: string): string {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return date;
  }
}

/**
 * Format date with time.
 * Example: "Jan 15, 2025, 3:30 PM"
 */
export function formatDateTime(date: string): string {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return date;
  }
}

/**
 * Get relative time string.
 * Example: "2 hours ago", "3 days ago"
 */
export function timeAgo(date: string): string {
  if (!date) return '';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  return `${months}mo ago`;
}

// ─── String Utilities ────────────────────────────────────────────

/** Truncate a string to a max length, appending "..." if truncated. */
export function truncate(str: string, length: number): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + '…';
}

/** Convert a string to a URL-friendly slug. */
export function slugify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Get initials from a name (max 2 chars). */
export function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ─── Image URL Helper ────────────────────────────────────────────

const PLACEHOLDER_URL = '/images/placeholder.svg';

/**
 * Get the best image URL from various input types.
 * Accepts an ArtworkImage object, a URL string, or undefined.
 */
export function getImageUrl(image: ArtworkImage | string | undefined | null): string {
  if (!image) return PLACEHOLDER_URL;
  if (typeof image === 'string') return image || PLACEHOLDER_URL;
  if (image.url) return image.url;
  return PLACEHOLDER_URL;
}

/**
 * Get the primary image from an array of ArtworkImages.
 */
export function getPrimaryImage(images: ArtworkImage[] | undefined | null): ArtworkImage | undefined {
  if (!images || images.length === 0) return undefined;
  return images.find((img) => img.isPrimary) || images[0];
}

/**
 * Get primary image URL from an artwork's images array.
 */
export function getPrimaryImageUrl(images: ArtworkImage[] | undefined | null): string {
  const primary = getPrimaryImage(images);
  return primary?.url || PLACEHOLDER_URL;
}

// ─── Misc ────────────────────────────────────────────────────────

/** Generate a random ID (for local temp use). */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/** Check if running on the client side. */
export const isClient = typeof window !== 'undefined';
