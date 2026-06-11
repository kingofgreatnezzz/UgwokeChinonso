// ================================================================
// Artist Portfolio — Loading & Skeleton Components
// ================================================================

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ─── Spinner ─────────────────────────────────────────────────────
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin text-amber-600', sizeMap[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Full Page Loader ────────────────────────────────────────────
interface PageLoaderProps {
  text?: string;
  className?: string;
}

function PageLoader({ text = 'Loading…', className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-20',
        className,
      )}
    >
      <Spinner size="lg" />
      {text && (
        <p className="text-sm font-medium text-stone-500 animate-pulse">{text}</p>
      )}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-stone-200/70',
        className,
      )}
    />
  );
}

// ─── Card Skeleton ───────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-xl border border-stone-200/70 bg-white p-4 shadow-sm">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}

// ─── Product Grid Skeleton ───────────────────────────────────────
function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Table Row Skeleton ──────────────────────────────────────────
function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export {
  Spinner,
  PageLoader,
  Skeleton,
  CardSkeleton,
  ProductGridSkeleton,
  TableRowSkeleton,
};
