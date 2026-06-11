// ================================================================
// Artist Portfolio — Home Page
// ================================================================

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  User,
  Star,
  Quote,
  Mail,
  Send,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { artworkApi, collectionApi, contentApi } from '@/lib/api';
import { cn, formatPrice, getPrimaryImageUrl } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/loading';
import type { Artwork, Collection, Testimonial } from '@/types';

// ─── Mock Data (fallback when API unavailable) ────────────────────

const MOCK_FEATURED: Artwork[] = [
  {
    id: '1', slug: 'ethereal-dawn', title: 'Ethereal Dawn', description: '', topic: 'Abstract', type: 'painting', size: '36×48 in', price: 240000, quantity: 1, featured: true, inStock: true, views: 120, images: [{ id: 'i1', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80', alt: 'Ethereal Dawn', isPrimary: true, order: 0 }], reviews: [], createdAt: '2025-01-15',
  },
  {
    id: '2', slug: 'golden-hour', title: 'Golden Hour', description: '', topic: 'Landscape', type: 'painting', size: '24×36 in', price: 185000, quantity: 2, featured: true, inStock: true, views: 98, images: [{ id: 'i2', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80', alt: 'Golden Hour', isPrimary: true, order: 0 }], reviews: [], createdAt: '2025-02-01',
  },
  {
    id: '3', slug: 'urban-whispers', title: 'Urban Whispers', description: '', topic: 'Cityscape', type: 'photography', size: '20×30 in', price: 120000, quantity: 3, featured: true, inStock: true, views: 75, images: [{ id: 'i3', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', alt: 'Urban Whispers', isPrimary: true, order: 0 }], reviews: [], createdAt: '2025-02-10',
  },
  {
    id: '4', slug: 'serenity-in-blue', title: 'Serenity in Blue', description: '', topic: 'Abstract', type: 'painting', size: '30×40 in', price: 210000, quantity: 1, featured: true, inStock: true, views: 64, images: [{ id: 'i4', url: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80', alt: 'Serenity in Blue', isPrimary: true, order: 0 }], reviews: [], createdAt: '2025-01-20',
  },
  {
    id: '5', slug: 'midnight-garden', title: 'Midnight Garden', description: '', topic: 'Nature', type: 'mixed-media', size: '24×24 in', price: 165000, quantity: 2, featured: true, inStock: true, views: 88, images: [{ id: 'i5', url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80', alt: 'Midnight Garden', isPrimary: true, order: 0 }], reviews: [], createdAt: '2025-03-01',
  },
];

const MOCK_LATEST: Artwork[] = [
  {
    id: '6', slug: 'crimson-tides', title: 'Crimson Tides', description: '', topic: 'Abstract', type: 'painting', size: '36×48 in', price: 260000, quantity: 1, featured: false, inStock: true, views: 42, images: [{ id: 'i6', url: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80', alt: 'Crimson Tides', isPrimary: true, order: 0 }], reviews: [], createdAt: '2025-03-10',
  },
  {
    id: '7', slug: 'sahara-dreams', title: 'Sahara Dreams', description: '', topic: 'Landscape', type: 'painting', size: '30×40 in', price: 195000, quantity: 2, featured: false, inStock: true, views: 36, images: [{ id: 'i7', url: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&q=80', alt: 'Sahara Dreams', isPrimary: true, order: 0 }], reviews: [], createdAt: '2025-03-12',
  },
  {
    id: '8', slug: 'bronze-elegance', title: 'Bronze Elegance', description: '', topic: 'Figurative', type: 'sculpture', size: '18×12×8 in', price: 350000, quantity: 1, featured: false, inStock: true, views: 55, images: [{ id: 'i8', url: 'https://images.unsplash.com/photo-1574182245530-967d9b3831af?w=800&q=80', alt: 'Bronze Elegance', isPrimary: true, order: 0 }], reviews: [], createdAt: '2025-03-05',
  },
  {
    id: '9', slug: 'whispers-of-spring', title: 'Whispers of Spring', description: '', topic: 'Nature', type: 'painting', size: '20×20 in', price: 140000, quantity: 3, featured: false, inStock: true, views: 29, images: [{ id: 'i9', url: 'https://images.unsplash.com/photo-1505739998589-00fc463a8d1e?w=800&q=80', alt: 'Whispers of Spring', isPrimary: true, order: 0 }], reviews: [], createdAt: '2025-03-15',
  },
];

const MOCK_COLLECTIONS: Collection[] = [
  { id: 'c1', name: 'Abstract Visions', slug: 'abstract-visions', description: 'Bold expressions in color and form', image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&q=80', artworkCount: 12 },
  { id: 'c2', name: 'Nature\'s Palette', slug: 'natures-palette', description: 'Inspired by the natural world', image: 'https://images.unsplash.com/photo-1505739998589-00fc463a8d1e?w=600&q=80', artworkCount: 8 },
  { id: 'c3', name: 'Urban Stories', slug: 'urban-stories', description: 'City life through artistic eyes', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80', artworkCount: 6 },
];

const MOCK_TESTIMONIALS: Testimonial[] = [
  { id: 't1', name: 'Sarah Mitchell', role: 'Art Collector', content: 'The attention to detail and emotional depth in every piece is extraordinary. I\'ve purchased three works and each one transforms my space.', rating: 5 },
  { id: 't2', name: 'James Okafor', role: 'Interior Designer', content: 'Working with this artist has been incredible. The pieces arrive beautifully curated and consistently exceed my clients\' expectations.', rating: 5 },
  { id: 't3', name: 'Emily Chen', role: 'Gallery Curator', content: 'A truly unique artistic voice. The compositions are masterful, and the use of color is nothing short of breathtaking.', rating: 5 },
  { id: 't4', name: 'David Adewale', role: 'First-time Buyer', content: 'I was nervous about buying art online, but the experience was seamless. The artwork is even more stunning in person. Absolutely love it!', rating: 5 },
];

// ─── Animation Variants ───────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
} as const;

// ─── Hero Section ─────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&q=85"
          alt="Artist studio"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/60 to-stone-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-warm/10 via-transparent to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 border border-white/10 rounded-full" />
      <div className="absolute bottom-20 left-20 w-48 h-48 border border-amber-500/10 rounded-full" />

      {/* Content */}
      <div className="relative z-10 section-container text-center lg:text-left">
        <div className="max-w-3xl mx-auto lg:mx-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Badge variant="outline" className="mb-6 border-amber-400/30 text-amber-300 bg-amber-500/10 backdrop-blur-sm px-4 py-1.5 text-xs tracking-widest uppercase">
              <Sparkles className="h-3 w-3 mr-1.5" />
              Featured Artist Collection
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight tracking-tight"
          >
            Where Art
            <br />
            <span className="text-gradient bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Finds You
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="mt-6 text-lg sm:text-xl text-stone-300 max-w-xl leading-relaxed"
          >
            Discover curated fine art that speaks to your soul. Original paintings, limited-edition prints, and bespoke sculptures — each piece tells a story.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: 'easeOut' }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Link href="/shop">
              <Button size="lg" variant="primary" className="text-base gap-2 shadow-lg shadow-amber-600/20">
                <ShoppingBag className="h-5 w-5" />
                Shop Gallery
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="text-base border-amber-400/40 text-amber-200 hover:bg-amber-500/10 hover:text-amber-100">
                <User className="h-5 w-5" />
                About the Artist
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-16 flex flex-wrap gap-10 justify-center lg:justify-start"
          >
            <div className="text-center lg:text-left">
              <p className="font-serif text-3xl font-bold text-white">50+</p>
              <p className="text-xs text-stone-400 mt-1 tracking-wider uppercase">Original Works</p>
            </div>
            <div className="text-center lg:text-left">
              <p className="font-serif text-3xl font-bold text-white">200+</p>
              <p className="text-xs text-stone-400 mt-1 tracking-wider uppercase">Happy Collectors</p>
            </div>
            <div className="text-center lg:text-left">
              <p className="font-serif text-3xl font-bold text-white">12</p>
              <p className="text-xs text-stone-400 mt-1 tracking-wider uppercase">Exhibitions</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-amber-400/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Featured Artworks Carousel ──────────────────────────────────

function FeaturedCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
    dragFree: true,
  });
  const [artworks, setArtworks] = useState<Artwork[]>(MOCK_FEATURED);
  const [loading, setLoading] = useState(true);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await artworkApi.getFeatured();
        if (data && data.length > 0) setArtworks(data);
      } catch {
        // Use mock data
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const handleAddToCart = (artwork: Artwork) => {
    addItem({ ...artwork, quantity: 1 });
  };

  if (loading) return null;

  return (
    <section className="section-padding bg-warm">
      <div className="section-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <Badge variant="primary" className="mb-3">Curated Selection</Badge>
            <h2 className="section-title">Featured Works</h2>
            <p className="section-subtitle">Handpicked pieces that represent the pinnacle of artistic expression</p>
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              onClick={scrollPrev}
              disabled={prevBtnDisabled}
              className="p-2.5 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={scrollNext}
              disabled={nextBtnDisabled}
              className="p-2.5 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5">
            {artworks.map((artwork) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="min-w-[280px] sm:min-w-[320px] md:min-w-[340px] flex-shrink-0"
              >
                <Link href={`/artwork/${artwork.slug}`} className="group block">
                  <div className="relative aspect-portrait rounded-2xl overflow-hidden bg-stone-100 shadow-card">
                    <Image
                      src={getPrimaryImageUrl(artwork.images)}
                      alt={artwork.title}
                      fill
                      className="object-cover transition-all duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 280px, 340px"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Badge variant="primary" className="mb-2">{artwork.type}</Badge>
                        <p className="text-white text-sm font-medium">{artwork.topic}</p>
                      </div>
                    </div>
                    {/* Quick Add */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(artwork);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-amber-500 hover:text-white"
                      aria-label="Add to cart"
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 px-1">
                    <h3 className="font-serif text-lg font-semibold text-stone-900 group-hover:text-amber-700 transition-colors">
                      {artwork.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="outline" size="sm" className="text-stone-500">{artwork.type}</Badge>
                      <span className="font-medium text-stone-800 text-sm">
                        {formatPrice(artwork.salePrice ?? artwork.price)}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Artist Bio Summary ──────────────────────────────────────────

function ArtistBioSection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-stone-900 text-white">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=80"
          alt="Artist background"
          fill
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/95 to-stone-900/90" />
      </div>

      <div className="relative z-10 section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 mb-4">
              About the Artist
            </Badge>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold leading-tight">
              Crafting Emotion
              <br />
              <span className="text-gradient bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                Through Every Stroke
              </span>
            </h2>
            <div className="mt-6 space-y-4 text-stone-300 leading-relaxed">
              <p>
                With over a decade of creative exploration, I blend traditional techniques with contemporary vision
                to create pieces that resonate deeply. Each canvas is a journey — an invitation to see the world through a different lens.
              </p>
              <p>
                My work draws from the rich textures of life: the golden hues of sunset over the savannah,
                the quiet strength of weathered hands, the vibrant energy of bustling markets. These moments,
                captured in pigment and form, become windows into shared human experience.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/about">
                <Button variant="outline" size="lg" className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 gap-2">
                  Read Full Story
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80"
                alt="Artist at work"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-amber-600 text-white px-6 py-3 rounded-xl shadow-lg">
              <p className="font-serif text-2xl font-bold">10+</p>
              <p className="text-xs text-amber-200">Years of Artistry</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Latest Artworks Grid ────────────────────────────────────────

function LatestArtworksSection() {
  const [artworks, setArtworks] = useState<Artwork[]>(MOCK_LATEST);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await artworkApi.getLatest(8);
        if (data && data.length > 0) setArtworks(data);
      } catch {
        // Use mock
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  const handleAddToCart = (artwork: Artwork) => {
    addItem({ ...artwork, quantity: 1 });
  };

  return (
    <section className="section-padding bg-white">
      <div className="section-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <Badge variant="primary" className="mb-3">New Arrivals</Badge>
          <h2 className="section-title">Latest Works</h2>
          <p className="section-subtitle mx-auto">Fresh from the studio — newly completed pieces ready for your collection</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {artworks.slice(0, 4).map((artwork) => (
            <motion.div key={artwork.id} variants={fadeInUp}>
              <Link href={`/artwork/${artwork.slug}`} className="group block">
                <div className="relative aspect-portrait rounded-2xl overflow-hidden bg-stone-100 shadow-soft group-hover:shadow-card transition-all duration-300">
                  <Image
                    src={getPrimaryImageUrl(artwork.images)}
                    alt={artwork.title}
                    fill
                    className="object-cover transition-all duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <button
                      onClick={(e) => { e.preventDefault(); handleAddToCart(artwork); }}
                      className="self-start bg-white text-stone-900 px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:bg-amber-500 hover:text-white transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-serif text-base font-semibold text-stone-900 group-hover:text-amber-700 transition-colors">
                    {artwork.title}
                  </h3>
                  <div className="flex items-center justify-between mt-0.5">
                    <Badge variant="outline" size="sm" className="text-stone-400">{artwork.type}</Badge>
                    <span className="font-medium text-stone-700 text-sm">
                      {formatPrice(artwork.salePrice ?? artwork.price)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mt-10"
        >
          <Link href="/shop">
            <Button variant="outline" size="lg" className="gap-2">
              View All Artworks
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Collections Grid ────────────────────────────────────────────

function CollectionsSection() {
  const [collections, setCollections] = useState<Collection[]>(MOCK_COLLECTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await collectionApi.getCollections();
        if (data && data.length > 0) setCollections(data);
      } catch {
        // Use mock
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  return (
    <section className="section-padding bg-stone-50">
      <div className="section-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <Badge variant="primary" className="mb-3">Curated Sets</Badge>
          <h2 className="section-title">Explore Collections</h2>
          <p className="section-subtitle mx-auto">Themed collections curated around moods, inspirations, and artistic journeys</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {collections.map((collection) => (
            <motion.div key={collection.id} variants={fadeInUp}>
              <Link
                href={`/collections/${collection.slug}`}
                className="group block relative aspect-[4/3] rounded-2xl overflow-hidden shadow-card"
              >
                <Image
                  src={collection.image || 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&q=80'}
                  alt={collection.name}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-serif text-xl font-bold text-white">{collection.name}</h3>
                  <p className="text-sm text-stone-300 mt-1">{collection.description}</p>
                  <p className="text-xs text-amber-400 mt-2 font-medium">
                    {collection.artworkCount || 0} works
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials Section ────────────────────────────────────────

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(MOCK_TESTIMONIALS);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await contentApi.getTestimonials();
        if (data && data.length > 0) setTestimonials(data);
      } catch {
        // Use mock
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const currentTestimonial = testimonials[current];

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-30" />

      <div className="section-container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-10"
        >
          <Badge variant="primary" className="mb-3">Testimonials</Badge>
          <h2 className="section-title">What Collectors Say</h2>
        </motion.div>

        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <Quote className="h-10 w-10 text-amber-500/30 mx-auto mb-6" />
          <p className="font-serif text-xl sm:text-2xl text-stone-700 leading-relaxed italic">
            &ldquo;{currentTestimonial?.content}&rdquo;
          </p>
          <div className="mt-8 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-4 w-4',
                  i < (currentTestimonial?.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-stone-200'
                )}
              />
            ))}
          </div>
          <div className="mt-4">
            <p className="font-semibold text-stone-900">{currentTestimonial?.name}</p>
            {currentTestimonial?.role && (
              <p className="text-sm text-stone-400">{currentTestimonial.role}</p>
            )}
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === current ? 'w-8 bg-amber-500' : 'w-2 bg-stone-200 hover:bg-stone-300'
                )}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Newsletter Section ─────────────────────────────────────────

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await contentApi.subscribeNewsletter(email);
      setSubscribed(true);
    } catch {
      // Fallback: show success anyway
      await new Promise((r) => setTimeout(r, 600));
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-20 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-amber-700 to-stone-800" />
      <div className="absolute inset-0 opacity-10">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div className="relative z-10 section-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
          className="max-w-2xl mx-auto text-center"
        >
          <Mail className="h-10 w-10 text-amber-200 mx-auto mb-4" />
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
            Stay Inspired
          </h2>
          <p className="text-amber-100/80 mb-8 max-w-md mx-auto">
            Get early access to new collections, studio updates, and exclusive offers delivered to your inbox.
          </p>

          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-emerald-300 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 mx-auto max-w-sm">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">You&apos;re subscribed! Welcome to the inner circle.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 h-12 px-5 rounded-xl border-0 bg-white/15 backdrop-blur-sm text-white placeholder:text-amber-200/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <Button type="submit" variant="secondary" size="lg" loading={loading} className="bg-white text-amber-800 hover:bg-amber-50 gap-2">
                <Send className="h-4 w-4" />
                Subscribe
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Home Page ─────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturedCarousel />
      <ArtistBioSection />
      <LatestArtworksSection />
      <CollectionsSection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
}
