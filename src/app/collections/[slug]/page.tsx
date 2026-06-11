// ================================================================
// Artist Portfolio — Collection Detail Page
// ================================================================

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingBag,
  Eye,
  ChevronRight,
  Grid3X3,
  List,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import { collectionApi, artworkApi } from '@/lib/api';
import { cn, formatPrice, getPrimaryImageUrl } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader, ProductGridSkeleton } from '@/components/ui/loading';
import type { Collection, Artwork, ArtworkType } from '@/types';

// ─── Mock Data ───────────────────────────────────────────────────

const MOCK_COLLECTIONS: Record<string, Collection> = {
  'abstract-visions': {
    id: 'c1',
    name: 'Abstract Visions',
    slug: 'abstract-visions',
    description: 'Bold expressions in color and form — a collection that pushes the boundaries of abstract art. Each piece explores the interplay of texture, hue, and emotion through spontaneous yet deliberate composition.',
    image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&q=85',
    artworkCount: 12,
    artworks: Array.from({ length: 12 }, (_, i) => ({
      id: `ca-${i}`,
      slug: `abstract-${i + 1}`,
      title: ['Chromatic Rhythm', 'Ethereal Flow', 'Depth of Field', 'Layered Realities', 'Color Symphony', 'Ember & Ash', 'Prism Dreams', 'Shadow & Light', 'Fluid Forms', 'Crimson Pulse', 'Azure Depths', 'Golden Fracture'][i],
      description: '',
      topic: 'Abstract',
      type: 'painting' as ArtworkType,
      size: '30×40 in',
      price: [185000, 240000, 165000, 320000, 210000, 175000, 280000, 195000, 155000, 260000, 225000, 190000][i],
      quantity: Math.floor(Math.random() * 3) + 1,
      featured: false,
      inStock: true,
      views: Math.floor(Math.random() * 100),
      images: [{
        id: `cai-${i}`,
        url: `https://images.unsplash.com/photo-${[1579783902614, 1549490349, 1561214115, 1505739998589, 1578301978693, 1513364776144, 1574182245530, 1500462918059, 1499898863267, 1571115764597, 1506905925346, 1579783902614][i]}?w=600&q=80`,
        alt: '',
        isPrimary: true,
        order: 0,
      }],
      reviews: [],
      createdAt: '2025-01-01',
    })),
  },
  'natures-palette': {
    id: 'c2',
    name: 'Nature\'s Palette',
    slug: 'natures-palette',
    description: 'Inspired by the natural world — from lush rainforests to serene oceans. This collection captures the breathtaking beauty of nature through a contemporary artistic lens.',
    image: 'https://images.unsplash.com/photo-1505739998589-00fc463a8d1e?w=1200&q=85',
    artworkCount: 8,
    artworks: Array.from({ length: 8 }, (_, i) => ({
      id: `cn-${i}`,
      slug: `nature-${i + 1}`,
      title: ['Forest Canopy', 'Ocean Memories', 'Desert Bloom', 'Mountain Solitude', 'River of Light', 'Wildflower Meadow', 'Autumn Tapestry', 'Coral Gardens'][i],
      description: '',
      topic: 'Nature',
      type: (['painting', 'photography', 'mixed-media'] as ArtworkType[])[i % 3],
      size: '24×36 in',
      price: [165000, 195000, 140000, 280000, 175000, 155000, 210000, 185000][i],
      quantity: 2,
      featured: false,
      inStock: true,
      views: Math.floor(Math.random() * 80),
      images: [{
        id: `cni-${i}`,
        url: `https://images.unsplash.com/photo-${[1505739998589, 1578301978693, 1513364776144, 1500462918059, 1499898863267, 1571115764597, 1506905925346, 1574182245530][i]}?w=600&q=80`,
        alt: '',
        isPrimary: true,
        order: 0,
      }],
      reviews: [],
      createdAt: '2025-02-01',
    })),
  },
  'urban-stories': {
    id: 'c3',
    name: 'Urban Stories',
    slug: 'urban-stories',
    description: 'City life through artistic eyes — neon lights, crowded streets, quiet alleyways. This collection captures the energy, solitude, and rhythm of urban existence.',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=85',
    artworkCount: 6,
    artworks: Array.from({ length: 6 }, (_, i) => ({
      id: `cu-${i}`,
      slug: `urban-${i + 1}`,
      title: ['Neon Nights', 'Concrete Jungle', 'Street Symphony', 'City Lights', 'Subway Dreams', 'Rooftop Views'][i],
      description: '',
      topic: 'Cityscape',
      type: (['photography', 'painting', 'digital'] as ArtworkType[])[i % 3],
      size: '20×30 in',
      price: [120000, 185000, 150000, 210000, 135000, 175000][i],
      quantity: 3,
      featured: false,
      inStock: true,
      views: Math.floor(Math.random() * 60),
      images: [{
        id: `cui-${i}`,
        url: `https://images.unsplash.com/photo-${[1513364776144, 1506905925346, 1574182245530, 1579783902614, 1549490349, 1561214115][i]}?w=600&q=80`,
        alt: '',
        isPrimary: true,
        order: 0,
      }],
      reviews: [],
      createdAt: '2025-03-01',
    })),
  },
};

// ─── SORT OPTIONS ─────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

// ─── Animation Variants ───────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

// ─── Artwork Card ─────────────────────────────────────────────────

function CollectionArtworkCard({ artwork }: { artwork: Artwork }) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ ...artwork, quantity: 1 });
  };

  return (
    <motion.div variants={fadeInUp}>
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
            <button
              onClick={handleAddToCart}
              className="w-full bg-white text-stone-900 px-4 py-2.5 rounded-lg text-sm font-medium shadow-md hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </button>
          </div>
          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="primary" size="sm">{artwork.type}</Badge>
          </div>
        </div>
        <div className="mt-3 px-1">
          <h3 className="font-serif text-base font-semibold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
            {artwork.title}
          </h3>
          <div className="flex items-center justify-between mt-0.5">
            <Badge variant="outline" size="sm" className="text-stone-400">{artwork.topic}</Badge>
            <span className="font-medium text-stone-800 text-sm">
              {formatPrice(artwork.salePrice ?? artwork.price)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Collection Detail Page ──────────────────────────────────────

export default function CollectionDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const data = await collectionApi.getCollection(slug);
        setCollection(data);
      } catch {
        // Fallback to mock
        const mockCollection = MOCK_COLLECTIONS[slug];
        if (mockCollection) {
          setCollection(mockCollection);
        }
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchCollection();
  }, [slug]);

  const sortedArtworks = collection?.artworks
    ? [...collection.artworks].sort((a, b) => {
        if (sort === 'price-asc') return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
        if (sort === 'price-desc') return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
    : [];

  if (loading) return <PageLoader text="Loading collection..." />;

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
            <Eye className="h-6 w-6 text-stone-400" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-stone-900 mb-2">Collection Not Found</h2>
          <p className="text-stone-500 mb-6">The collection you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/shop">
            <Button variant="primary">Browse Gallery</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={collection.image || 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=1920&q=85'}
            alt={collection.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/30 via-stone-900/50 to-stone-900/80" />
        </div>

        <div className="relative z-10 section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <nav className="flex items-center justify-center gap-2 text-sm text-stone-400 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/shop" className="hover:text-white transition-colors">Gallery</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-amber-300 font-medium">{collection.name}</span>
            </nav>

            <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white mb-4">
              {collection.name}
            </h1>
            <p className="text-stone-300 text-lg max-w-2xl mx-auto leading-relaxed">
              {collection.description}
            </p>
            <div className="mt-6 text-amber-400 font-medium text-sm">
              {collection.artworkCount || collection.artworks?.length || 0} artwork{(collection.artworkCount || collection.artworks?.length || 0) !== 1 ? 's' : ''}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Artworks Grid ────────────────────────────────── */}
      <section className="section-padding bg-warm flex-1">
        <div className="section-container">
          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-2">
              <Link href="/shop">
                <Button variant="ghost" size="sm" className="gap-1.5 text-stone-500">
                  <ArrowLeft className="h-4 w-4" />
                  All Gallery
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-stone-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* View toggle */}
              <div className="border border-stone-200 rounded-lg overflow-hidden flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'grid' ? 'bg-stone-100 text-stone-900' : 'bg-white text-stone-400 hover:text-stone-600'
                  )}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'list' ? 'bg-stone-100 text-stone-900' : 'bg-white text-stone-400 hover:text-stone-600'
                  )}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Artworks */}
          {sortedArtworks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
                <Eye className="h-6 w-6 text-stone-400" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-stone-900 mb-1">No artworks in this collection yet</h3>
              <p className="text-sm text-stone-500">Check back soon for new additions.</p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className={cn(
                'grid gap-6',
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1',
              )}
            >
              {sortedArtworks.map((artwork) => (
                <CollectionArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
