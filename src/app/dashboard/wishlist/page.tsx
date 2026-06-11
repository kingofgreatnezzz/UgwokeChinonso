'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, useCartStore } from '@/lib/store';
import { wishlistApi, artworkApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageLoader, CardSkeleton } from '@/components/ui/loading';
import { Heart, ShoppingCart, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Artwork } from '@/types';
import { formatPrice, getPrimaryImageUrl, getImageUrl } from '@/lib/utils';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const addToCart = useCartStore((s) => s.addItem);
  const [wishlistItems, setWishlistItems] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, router]);

  const fetchWishlist = async () => {
    try {
      const data = await wishlistApi.getWishlist();
      setWishlistItems(data);
    } catch {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (artworkId: string) => {
    setRemovingIds((prev) => new Set(prev).add(artworkId));
    try {
      await wishlistApi.removeFromWishlist(artworkId);
      setWishlistItems((prev) => prev.filter((item) => item.id !== artworkId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(artworkId);
        return next;
      });
    }
  };

  const handleAddToCart = (item: Artwork) => {
    addToCart({ ...item, quantity: 1 });
    toast.success(`${item.title} added to cart`);
  };

  const handleMoveAllToCart = () => {
    wishlistItems.forEach((item) => {
      addToCart({ ...item, quantity: 1 });
    });
    toast.success(`Added ${wishlistItems.length} items to cart`);
  };

  if (loading) return <PageLoader text="Loading wishlist…" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-down">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-stone-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900">My Wishlist</h1>
            <p className="mt-1 text-stone-500">
              {wishlistItems.length}{' '}
              {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <Button
              variant="outline"
              leftIcon={<ShoppingCart className="h-4 w-4" />}
              onClick={handleMoveAllToCart}
            >
              Move All to Cart
            </Button>
          )}
        </div>
      </div>

      {/* Wishlist Grid */}
      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
            <Heart className="h-10 w-10 text-rose-300" />
          </div>
          <h3 className="text-lg font-semibold text-stone-700">Your wishlist is empty</h3>
          <p className="mt-1 max-w-sm text-sm text-stone-500">
            Save artworks you love to your wishlist and come back to them anytime.
          </p>
          <Link href="/shop" className="mt-6">
            <Button leftIcon={<ShoppingBag className="h-4 w-4" />}>
              Browse Artworks
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((item, index) => {
            const primaryImg = getPrimaryImageUrl(item.images);
            return (
              <Card
                key={item.id}
                className={`group animate-fade-in-up stagger-${(index % 8) + 1} overflow-hidden transition-all duration-300 hover:shadow-card hover:-translate-y-1`}
              >
                <div className="relative aspect-square overflow-hidden bg-stone-100">
                  <img
                    src={getImageUrl(primaryImg)}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={removingIds.has(item.id)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-stone-600 opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <CardContent className="p-4">
                  <Link href={`/artwork/${item.slug}`}>
                    <h3 className="font-semibold text-stone-900 transition-colors hover:text-amber-600 truncate">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="mt-0.5 text-xs text-stone-400 capitalize">{item.type}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      {item.salePrice ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-600">
                            {formatPrice(item.salePrice)}
                          </span>
                          <span className="text-xs text-stone-400 line-through">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-stone-900">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
