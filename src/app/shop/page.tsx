// ================================================================
// Artist Portfolio — Shop / Gallery Page
// ================================================================

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  Grid3X3,
  List,
  ChevronDown,
  ShoppingBag,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { artworkApi } from '@/lib/api';
import { cn, formatPrice, getPrimaryImageUrl } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ProductGridSkeleton } from '@/components/ui/loading';
import type { Artwork, ArtworkType } from '@/types';

// ─── Types & Constants ───────────────────────────────────────────

const ARTWORK_TYPES: { value: ArtworkType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'painting', label: 'Paintings' },
  { value: 'sculpture', label: 'Sculptures' },
  { value: 'photography', label: 'Photography' },
  { value: 'digital', label: 'Digital Art' },
  { value: 'mixed-media', label: 'Mixed Media' },
  { value: 'print', label: 'Prints' },
  { value: 'drawing', label: 'Drawings' },
  { value: 'ceramics', label: 'Ceramics' },
  { value: 'textile', label: 'Textiles' },
];

const TOPICS = [
  'Abstract', 'Landscape', 'Portrait', 'Figurative', 'Nature',
  'Cityscape', 'Still Life', 'Cultural', 'Contemporary', 'Minimalist',
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const PRICE_RANGES = [
  { label: 'Under ₦100,000', min: 0, max: 100000 },
  { label: '₦100,000 - ₦250,000', min: 100000, max: 250000 },
  { label: '₦250,000 - ₦500,000', min: 250000, max: 500000 },
  { label: '₦500,000+', min: 500000, max: Infinity },
];

// ─── Mock Data ───────────────────────────────────────────────────

const MOCK_ARTWORKS: Artwork[] = Array.from({ length: 24 }, (_, i) => ({
  id: `mock-${i}`,
  slug: `artwork-${i + 1}`,
  title: [
    'Ethereal Dawn', 'Golden Hour', 'Urban Whispers', 'Serenity in Blue',
    'Midnight Garden', 'Crimson Tides', 'Sahara Dreams', 'Bronze Elegance',
    'Whispers of Spring', 'Ocean Memories', 'Desert Bloom', 'Crimson Horizon',
    'Celestial Dance', 'Earth Tones', 'Velvet Night', 'Amber Glow',
    'Tranquil Waters', 'Autumn Reverie', 'Silk & Stone', 'Ember Nights',
    'Mystic Forest', 'Golden Veil', 'Shadow Play', 'Radiance',
  ][i],
  description: '',
  topic: TOPICS[i % TOPICS.length],
  type: (['painting', 'sculpture', 'photography', 'mixed-media', 'print', 'digital'] as ArtworkType[])[i % 6],
  size: '24×36 in',
  price: [120000, 185000, 240000, 95000, 320000, 150000, 210000, 175000][i % 8],
  salePrice: i % 5 === 0 ? [90000, 140000][i % 2] : undefined,
  quantity: Math.floor(Math.random() * 5) + 1,
  featured: i < 4,
  inStock: i !== 5,
  views: Math.floor(Math.random() * 200),
  images: [{
    id: `mi-${i}`,
    url: `https://images.unsplash.com/photo-${[1579783902614, 1513364776144, 1506905925346, 1549490349, 1578301978693, 1561214115, 1500462918059, 1574182245530, 1505739998589, 1571115764597, 1499898863267, 1578301978693][i % 12]}?w=600&q=80`,
    alt: '',
    isPrimary: true,
    order: 0,
  }],
  reviews: [],
  createdAt: new Date(2025, 0, 1 + i).toISOString(),
}));

// ─── Filter Sidebar ──────────────────────────────────────────────

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedType: ArtworkType | '';
  setSelectedType: (t: ArtworkType | '') => void;
  selectedTopic: string;
  setSelectedTopic: (t: string) => void;
  priceRange: { min: number; max: number } | null;
  setPriceRange: (r: { min: number; max: number } | null) => void;
  sort: string;
  setSort: (s: string) => void;
  onApply: () => void;
  onReset: () => void;
  isMobile?: boolean;
}

function FilterSidebar({
  isOpen, onClose, selectedType, setSelectedType, selectedTopic, setSelectedTopic,
  priceRange, setPriceRange, sort, setSort, onApply, onReset, isMobile,
}: FilterSidebarProps) {
  const content = (
    <div className="space-y-8">
      {/* Sort */}
      <div>
        <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5" /> Sort By
        </h3>
        <div className="space-y-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={cn(
                'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                sort === opt.value
                  ? 'bg-amber-50 text-amber-700 font-medium'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div>
        <h3 className="text-sm font-semibold text-stone-900 mb-3">Artwork Type</h3>
        <div className="space-y-1.5">
          {ARTWORK_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value as ArtworkType | '')}
              className={cn(
                'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                selectedType === t.value
                  ? 'bg-amber-50 text-amber-700 font-medium'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Filter */}
      <div>
        <h3 className="text-sm font-semibold text-stone-900 mb-3">Topic</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTopic('')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              selectedTopic === ''
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300',
            )}
          >
            All
          </button>
          {TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                selectedTopic === topic
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300',
              )}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-stone-900 mb-3">Price Range</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => setPriceRange(null)}
            className={cn(
              'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
              !priceRange
                ? 'bg-amber-50 text-amber-700 font-medium'
                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900',
            )}
          >
            All Prices
          </button>
          {PRICE_RANGES.map((range, i) => (
            <button
              key={i}
              onClick={() => setPriceRange({ min: range.min, max: range.max })}
              className={cn(
                'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                priceRange?.min === range.min && priceRange?.max === range.max
                  ? 'bg-amber-50 text-amber-700 font-medium'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900',
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Button onClick={onApply} variant="primary" className="w-full">
          Apply Filters
        </Button>
        <Button onClick={onReset} variant="ghost" className="w-full text-sm">
          Reset All
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-xl overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-stone-200">
                <h2 className="font-serif text-lg font-semibold text-stone-900">Filters</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100">
                  <X className="h-5 w-5 text-stone-500" />
                </button>
              </div>
              <div className="p-5">{content}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return <div>{content}</div>;
}

// ─── Artwork Card ─────────────────────────────────────────────────

function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const { addItem } = useCartStore();
  const displayPrice = artwork.salePrice ?? artwork.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ ...artwork, quantity: 1 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
    >
      <Link href={`/artwork/${artwork.slug}`} className="group block">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 shadow-soft group-hover:shadow-card transition-all duration-300">
          <Image
            src={getPrimaryImageUrl(artwork.images)}
            alt={artwork.title}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 space-y-2">
              <button
                onClick={handleAddToCart}
                className="w-full bg-white text-stone-900 px-4 py-2.5 rounded-lg text-sm font-medium shadow-md hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2"
                disabled={!artwork.inStock}
              >
                <ShoppingBag className="h-4 w-4" />
                {artwork.inStock ? 'Add to Cart' : 'Sold Out'}
              </button>
            </div>
          </div>

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <Badge variant="primary" size="sm">{artwork.type}</Badge>
            {artwork.salePrice && (
              <Badge variant="success" size="sm">Sale</Badge>
            )}
          </div>

          {/* Quick view */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => { e.preventDefault(); }}
              className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4 text-stone-700" />
            </button>
          </div>

          {/* Not in stock overlay */}
          {!artwork.inStock && (
            <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center">
              <Badge variant="secondary" size="lg">Sold Out</Badge>
            </div>
          )}
        </div>

        <div className="mt-3 px-1">
          <h3 className="font-serif text-base font-semibold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
            {artwork.title}
          </h3>
          <div className="flex items-center justify-between mt-0.5">
            <Badge variant="outline" size="sm" className="text-stone-400">{artwork.topic}</Badge>
            <div className="text-right">
              {artwork.salePrice ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-400 line-through">{formatPrice(artwork.price)}</span>
                  <span className="font-medium text-amber-700 text-sm">{formatPrice(artwork.salePrice)}</span>
                </div>
              ) : (
                <span className="font-medium text-stone-800 text-sm">{formatPrice(displayPrice)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Shop Page ───────────────────────────────────────────────────

export default function ShopPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ArtworkType | ''>('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await artworkApi.getArtworks({
        page,
        limit: 12,
        type: selectedType || undefined,
        topic: selectedTopic || undefined,
        minPrice: priceRange?.min,
        maxPrice: priceRange?.max === Infinity ? undefined : priceRange?.max,
        sort,
        search: searchQuery || undefined,
      });
      setArtworks(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotalCount(result.pagination.total);
    } catch {
      // Fallback: filter mock data
      let filtered = [...MOCK_ARTWORKS];
      if (selectedType) filtered = filtered.filter((a) => a.type === selectedType);
      if (selectedTopic) filtered = filtered.filter((a) => a.topic === selectedTopic);
      if (priceRange) {
        filtered = filtered.filter((a) => {
          const p = a.salePrice ?? a.price;
          return p >= priceRange.min && p <= (priceRange.max === Infinity ? 999999999 : priceRange.max);
        });
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter((a) => a.title.toLowerCase().includes(q));
      }
      if (sort === 'price-asc') filtered.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
      if (sort === 'price-desc') filtered.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
      setArtworks(filtered);
      setTotalPages(Math.ceil(filtered.length / 12));
      setTotalCount(filtered.length);
    } finally {
      setLoading(false);
    }
  }, [page, selectedType, selectedTopic, priceRange, sort, searchQuery]);

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedType, selectedTopic, priceRange, sort, searchQuery]);

  const handleReset = () => {
    setSelectedType('');
    setSelectedTopic('');
    setPriceRange(null);
    setSort('latest');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="flex flex-col">
      {/* ── Hero Banner ─────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1574182245530-967d9b3831af?w=1920&q=85"
            alt="Gallery"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/40 via-stone-900/60 to-stone-900/80" />
        </div>
        <div className="relative z-10 section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Sparkles className="h-6 w-6 text-amber-400 mx-auto mb-3" />
            <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white mb-3">
              Art Gallery
            </h1>
            <p className="text-stone-300 text-lg max-w-xl mx-auto">
              Browse our curated collection of original artworks — each piece waiting to find its home
            </p>
            <div className="mt-6 text-sm text-amber-400 font-medium">
              {totalCount > 0 ? `${totalCount} artwork${totalCount !== 1 ? 's' : ''} available` : 'Browse our collection'}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Content Section ─────────────────────────────── */}
      <section className="section-padding bg-warm flex-1">
        <div className="section-container">
          {/* Search & Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artworks by title..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                >
                  <X className="h-4 w-4 text-stone-400 hover:text-stone-600" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {/* Mobile filter button */}
              <Button
                variant="outline"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                Filters
              </Button>

              {/* View toggle */}
              <div className="hidden sm:flex border border-stone-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2.5 transition-colors',
                    viewMode === 'grid' ? 'bg-stone-100 text-stone-900' : 'bg-white text-stone-400 hover:text-stone-600'
                  )}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2.5 transition-colors',
                    viewMode === 'list' ? 'bg-stone-100 text-stone-900' : 'bg-white text-stone-400 hover:text-stone-600'
                  )}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <FilterSidebar
                  isOpen={false}
                  onClose={() => {}}
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedTopic={selectedTopic}
                  setSelectedTopic={setSelectedTopic}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  sort={sort}
                  setSort={setSort}
                  onApply={fetchArtworks}
                  onReset={handleReset}
                />
              </div>
            </aside>

            {/* Mobile Filter Drawer */}
            <FilterSidebar
              isOpen={mobileFilterOpen}
              onClose={() => setMobileFilterOpen(false)}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              sort={sort}
              setSort={setSort}
              onApply={() => { fetchArtworks(); setMobileFilterOpen(false); }}
              onReset={handleReset}
              isMobile
            />

            {/* Artworks Grid */}
            <div className="flex-1 min-w-0">
              {/* Active filters chips */}
              {(selectedType || selectedTopic || priceRange || searchQuery) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedType && (
                    <Badge variant="primary" size="sm" className="gap-1">
                      {selectedType}
                      <button onClick={() => setSelectedType('')}><X className="h-3 w-3 ml-1" /></button>
                    </Badge>
                  )}
                  {selectedTopic && (
                    <Badge variant="primary" size="sm" className="gap-1">
                      {selectedTopic}
                      <button onClick={() => setSelectedTopic('')}><X className="h-3 w-3 ml-1" /></button>
                    </Badge>
                  )}
                  {priceRange && (
                    <Badge variant="primary" size="sm" className="gap-1">
                      {priceRange.max === Infinity ? `₦${priceRange.min.toLocaleString()}+` : `₦${priceRange.min.toLocaleString()} - ₦${priceRange.max.toLocaleString()}`}
                      <button onClick={() => setPriceRange(null)}><X className="h-3 w-3 ml-1" /></button>
                    </Badge>
                  )}
                  <button onClick={handleReset} className="text-xs text-stone-400 hover:text-stone-600 underline">
                    Clear all
                  </button>
                </div>
              )}

              {loading ? (
                <ProductGridSkeleton count={8} />
              ) : artworks.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
                    <Search className="h-6 w-6 text-stone-400" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-stone-900 mb-1">No artworks found</h3>
                  <p className="text-sm text-stone-500 mb-6">Try adjusting your filters or search terms</p>
                  <Button onClick={handleReset} variant="outline">
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      'grid gap-6',
                      viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                        : 'grid-cols-1',
                    )}
                  >
                    {artworks.map((artwork) => (
                      <ArtworkCard key={artwork.id} artwork={artwork} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="p-2.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 7) {
                          pageNum = i + 1;
                        } else if (page <= 4) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 3) {
                          pageNum = totalPages - 6 + i;
                        } else {
                          pageNum = page - 3 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={cn(
                              'w-10 h-10 rounded-lg text-sm font-medium transition-all',
                              page === pageNum
                                ? 'bg-stone-900 text-white shadow-sm'
                                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
                            )}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="p-2.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
