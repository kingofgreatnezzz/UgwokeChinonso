// ================================================================
// Artist Portfolio — Artwork Detail Page
// ================================================================

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Heart,
  Share2,
  ChevronLeft,
  Minus,
  Plus,
  Star,
  Check,
  Copy,
  X,
  ZoomIn,
  ChevronRight,
  Clock,
  Ruler,
  Package,
  Shield,
} from 'lucide-react';
import { artworkApi, reviewApi } from '@/lib/api';
import { cn, formatPrice, formatDate, getPrimaryImageUrl } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/loading';
import { Modal, ModalContent, ModalTrigger } from '@/components/ui/modal';
import type { Artwork, ArtworkImage, Review } from '@/types';
import toast from 'react-hot-toast';

// ─── Animation Variants ───────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
} as const;

// ─── Mock Detail ─────────────────────────────────────────────────

const MOCK_DETAIL: Artwork = {
  id: '1',
  slug: 'ethereal-dawn',
  title: 'Ethereal Dawn',
  description:
    'A breathtaking exploration of light and color, "Ethereal Dawn" captures the first moments of sunlight breaking over a tranquil horizon. The piece combines bold impressionistic brushstrokes with delicate glazing techniques, creating a luminous effect that changes throughout the day.\n\nThis original painting is stretched on premium-grade canvas with hand-painted edges, ready to hang. Signed and dated by the artist on the reverse. Accompanied by a certificate of authenticity.',
  topic: 'Abstract',
  type: 'painting',
  size: '36 × 48 inches (91 × 122 cm)',
  price: 240000,
  salePrice: 185000,
  quantity: 1,
  featured: true,
  inStock: true,
  views: 234,
  images: [
    { id: 'img1', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&q=85', alt: 'Ethereal Dawn - Full view', isPrimary: true, order: 0 },
    { id: 'img2', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&q=85&fit=crop&crop=entropy', alt: 'Ethereal Dawn - Detail 1', isPrimary: false, order: 1 },
    { id: 'img3', url: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=900&q=85', alt: 'Ethereal Dawn - Detail 2', isPrimary: false, order: 2 },
    { id: 'img4', url: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=900&q=85', alt: 'Ethereal Dawn - Detail 3', isPrimary: false, order: 3 },
  ],
  reviews: [
    { id: 'r1', rating: 5, comment: 'Absolutely stunning piece. The colors are even more vibrant in person. It\'s the centerpiece of my living room.', user: { id: 'u1', name: 'Sarah M.', avatar: undefined }, createdAt: '2025-03-15T10:00:00Z' },
    { id: 'r2', rating: 5, comment: 'Bought this as an anniversary gift. My wife was speechless. Expertly packaged and shipped quickly.', user: { id: 'u2', name: 'James O.', avatar: undefined }, createdAt: '2025-02-20T14:30:00Z' },
    { id: 'r3', rating: 4, comment: 'Beautiful artwork. The texture is incredible. Would love to see more pieces in this style.', user: { id: 'u3', name: 'Emily C.', avatar: undefined }, createdAt: '2025-01-10T09:15:00Z' },
  ],
  createdAt: '2025-01-15T00:00:00Z',
};

const MOCK_RELATED: Artwork[] = [
  {
    id: 'r1', slug: 'golden-hour', title: 'Golden Hour', description: '', topic: 'Landscape', type: 'painting', size: '24×36 in', price: 185000, quantity: 1, featured: false, inStock: true, views: 0, images: [{ id: 'ri1', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80', alt: '', isPrimary: true, order: 0 }], reviews: [], createdAt: '',
  },
  {
    id: 'r2', slug: 'serenity-in-blue', title: 'Serenity in Blue', description: '', topic: 'Abstract', type: 'painting', size: '30×40 in', price: 210000, quantity: 1, featured: false, inStock: true, views: 0, images: [{ id: 'ri2', url: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=500&q=80', alt: '', isPrimary: true, order: 0 }], reviews: [], createdAt: '',
  },
  {
    id: 'r3', slug: 'crimson-tides', title: 'Crimson Tides', description: '', topic: 'Abstract', type: 'painting', size: '36×48 in', price: 260000, quantity: 1, featured: false, inStock: true, views: 0, images: [{ id: 'ri3', url: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500&q=80', alt: '', isPrimary: true, order: 0 }], reviews: [], createdAt: '',
  },
  {
    id: 'r4', slug: 'midnight-garden', title: 'Midnight Garden', description: '', topic: 'Nature', type: 'mixed-media', size: '24×24 in', price: 165000, quantity: 1, featured: false, inStock: true, views: 0, images: [{ id: 'ri4', url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=500&q=80', alt: '', isPrimary: true, order: 0 }], reviews: [], createdAt: '',
  },
];

// ─── Lightbox ─────────────────────────────────────────────────────

function ImageLightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: ArtworkImage[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initialIndex);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white/60 hover:text-white transition-colors"
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="flex-1 flex items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="absolute left-4 p-2 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        <div className="relative max-w-4xl max-h-full">
          <Image
            src={images[idx]?.url || ''}
            alt={images[idx]?.alt || ''}
            width={900}
            height={1200}
            className="max-h-[85vh] w-auto h-auto object-contain rounded-lg"
            priority
          />
        </div>

        <button
          onClick={() => setIdx((i) => Math.min(images.length - 1, i + 1))}
          disabled={idx >= images.length - 1}
          className="absolute right-4 p-2 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex justify-center gap-2 pb-6">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={(e) => { e.stopPropagation(); setIdx(i); }}
            className={cn(
              'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
              i === idx ? 'border-amber-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-80',
            )}
          >
            <Image src={img.url} alt={img.alt} width={64} height={64} className="object-cover w-full h-full" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5',
            i < rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200',
          )}
        />
      ))}
    </div>
  );
}

// ─── Artwork Detail Page ─────────────────────────────────────────

export default function ArtworkDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const data = await artworkApi.getArtwork(slug);
        setArtwork(data);
      } catch {
        // Use mock
        setArtwork(MOCK_DETAIL);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchArtwork();
  }, [slug]);

  const handleAddToCart = () => {
    if (!artwork) return;
    setAddingToCart(true);
    addItem({ ...artwork, quantity });
    toast.success('Added to cart!');
    setTimeout(() => setAddingToCart(false), 300);
  };

  const handleBuyNow = () => {
    if (!artwork) return;
    addItem({ ...artwork, quantity });
    window.location.href = '/checkout';
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  if (loading) return <PageLoader text="Loading artwork..." />;
  if (!artwork) return <PageLoader text="Artwork not found" />;

  const images = artwork.images?.length ? artwork.images : [{ id: 'fallback', url: getPrimaryImageUrl(artwork.images), alt: artwork.title, isPrimary: true, order: 0 }];
  const displayPrice = artwork.salePrice ?? artwork.price;
  const avgRating = artwork.reviews?.length
    ? Math.round(artwork.reviews.reduce((s, r) => s + r.rating, 0) / artwork.reviews.length)
    : 0;

  return (
    <div className="flex flex-col">
      {/* ── Breadcrumbs ──────────────────────────────────── */}
      <div className="bg-white border-b border-stone-100">
        <div className="section-container py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-400">
            <Link href="/" className="hover:text-stone-700 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/shop" className="hover:text-stone-700 transition-colors">Gallery</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-stone-900 font-medium truncate">{artwork.title}</span>
          </nav>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────── */}
      <section className="section-padding bg-warm">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Image Gallery */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              {/* Main Image */}
              <div
                className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 shadow-card group cursor-pointer"
                onClick={() => setLightboxOpen(true)}
              >
                <Image
                  src={images[selectedImage]?.url || images[0]?.url}
                  alt={images[selectedImage]?.alt || artwork.title}
                  fill
                  className="object-cover transition-all duration-500"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-md">
                    <ZoomIn className="h-5 w-5 text-stone-700" />
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        'relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all',
                        i === selectedImage ? 'border-amber-500 shadow-md' : 'border-transparent opacity-70 hover:opacity-100',
                      )}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Artwork Info */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.15 }}
              className="flex flex-col"
            >
              {/* Type & Topic */}
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="primary">{artwork.type}</Badge>
                <Badge variant="outline">{artwork.topic}</Badge>
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
                {artwork.title}
              </h1>

              {/* Rating */}
              {artwork.reviews && artwork.reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <StarRating rating={avgRating} size="md" />
                  <span className="text-sm text-stone-500">
                    ({artwork.reviews.length} review{artwork.reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-3">
                {artwork.salePrice ? (
                  <>
                    <span className="font-serif text-3xl font-bold text-amber-700">{formatPrice(artwork.salePrice)}</span>
                    <span className="text-lg text-stone-400 line-through">{formatPrice(artwork.price)}</span>
                    <Badge variant="success" size="sm">Save {Math.round((1 - artwork.salePrice / artwork.price) * 100)}%</Badge>
                  </>
                ) : (
                  <span className="font-serif text-3xl font-bold text-stone-900">{formatPrice(artwork.price)}</span>
                )}
              </div>

              {/* Availability */}
              <div className="mt-4 flex items-center gap-2">
                {artwork.inStock ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm text-emerald-600 font-medium">In Stock</span>
                    {artwork.quantity > 0 && (
                      <span className="text-xs text-stone-400">({artwork.quantity} available)</span>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm text-red-600 font-medium">Sold Out</span>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-2">Description</h3>
                <div className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                  {artwork.description || 'No description provided.'}
                </div>
              </div>

              {/* Details Grid */}
              <div className="mt-6 grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Ruler className="h-4 w-4 text-stone-400" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">Size</p>
                    <p className="text-sm font-medium text-stone-700">{artwork.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Package className="h-4 w-4 text-stone-400" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">Type</p>
                    <p className="text-sm font-medium text-stone-700 capitalize">{artwork.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-stone-400" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">Created</p>
                    <p className="text-sm font-medium text-stone-700">{formatDate(artwork.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-stone-400" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">Auth.</p>
                    <p className="text-sm font-medium text-stone-700">COA Included</p>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mt-6">
                <label className="text-sm font-medium text-stone-700 mb-2 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-3 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium text-stone-900 text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(artwork.quantity, q + 1))}
                      className="p-3 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                      disabled={quantity >= artwork.quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  variant="primary"
                  className="flex-1 gap-2"
                  onClick={handleAddToCart}
                  disabled={!artwork.inStock || addingToCart}
                  loading={addingToCart}
                >
                  <ShoppingBag className="h-5 w-5" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex-1 gap-2"
                  onClick={handleBuyNow}
                  disabled={!artwork.inStock}
                >
                  Buy Now
                </Button>
                <Button
                  variant="outline"
                  className="px-4"
                  onClick={handleShare}
                  title="Share"
                >
                  {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Share2 className="h-5 w-5" />}
                </Button>
              </div>

              {/* Trust signals */}
              <div className="mt-8 pt-6 border-t border-stone-200">
                <div className="flex items-center gap-6 text-xs text-stone-400">
                  <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Secure checkout</span>
                  <span className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> Free shipping over ₦500k</span>
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Authenticity guaranteed</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Reviews Section ──────────────────────────────── */}
      {artwork.reviews && artwork.reviews.length > 0 && (
        <section className="section-padding bg-white">
          <div className="section-container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-8">
                Reviews ({artwork.reviews.length})
              </h2>
              <div className="space-y-6 max-w-2xl">
                {artwork.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-5 rounded-xl bg-stone-50 border border-stone-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                          {review.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-900">{review.user.name}</p>
                          <p className="text-[11px] text-stone-400">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-sm text-stone-600 mt-2">{review.comment}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Related Artworks ─────────────────────────────── */}
      <section className="section-padding bg-stone-50">
        <div className="section-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {MOCK_RELATED.map((related) => (
                <Link key={related.id} href={`/artwork/${related.slug}`} className="group">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 shadow-soft group-hover:shadow-card transition-all">
                    <Image
                      src={getPrimaryImageUrl(related.images)}
                      alt={related.title}
                      fill
                      className="object-cover transition-all duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </div>
                  <div className="mt-2">
                    <h3 className="font-serif text-sm font-semibold text-stone-900 group-hover:text-amber-700 transition-colors">
                      {related.title}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">{formatPrice(related.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Lightbox ─────────────────────────────────────── */}
      {lightboxOpen && (
        <ImageLightbox
          images={images}
          initialIndex={selectedImage}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
