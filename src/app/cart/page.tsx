// ================================================================
// Artist Portfolio — Cart Page
// ================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Shield,
  Package,
  Truck,
  ArrowLeft,
  ShoppingCart,
} from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { cn, formatPrice, getPrimaryImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/loading';

// ─── Animation Variants ───────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

// ─── Cart Page ───────────────────────────────────────────────────

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, totalQuantity } = useCartStore();
  const freeShippingThreshold = 500000;
  const subtotalValue = subtotal();
  const shippingEstimate = subtotalValue >= freeShippingThreshold ? 0 : 25000;
  const totalValue = subtotalValue + shippingEstimate;
  const progressPercent = Math.min((subtotalValue / freeShippingThreshold) * 100, 100);

  if (items.length === 0) {
    return (
      <div className="flex flex-col">
        {/* Page Header */}
        <div className="bg-white border-b border-stone-100">
          <div className="section-container py-8">
            <h1 className="font-serif text-3xl font-bold text-stone-900">Shopping Cart</h1>
          </div>
        </div>

        <div className="section-container flex-1 flex items-center justify-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-stone-400" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-stone-500 mb-8">
              Looks like you haven&apos;t added any artworks yet. Browse our gallery and find something that speaks to you.
            </p>
            <Link href="/shop">
              <Button variant="primary" size="lg" className="gap-2">
                <ShoppingBag className="h-5 w-5" />
                Browse Gallery
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="bg-white border-b border-stone-100">
        <div className="section-container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-stone-900">Shopping Cart</h1>
              <p className="text-stone-500 text-sm mt-1">{totalQuantity()} item{totalQuantity() !== 1 ? 's' : ''} in your cart</p>
            </div>
            <Link href="/shop">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Free Shipping Indicator */}
          <div className="mt-6 p-4 rounded-xl bg-stone-50 border border-stone-100">
            {shippingEstimate === 0 ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <Truck className="h-4 w-4" />
                <span className="text-sm font-medium">You&apos;ve earned free shipping!</span>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-stone-500 flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5" />
                    Add {formatPrice(freeShippingThreshold - subtotalValue)} more for free shipping
                  </span>
                  <span className="text-xs text-stone-400 font-medium">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Cart Content ─────────────────────────────────── */}
      <section className="section-padding bg-warm flex-1">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-2 space-y-4"
            >
              {items.map((item) => {
                const displayPrice = item.salePrice ?? item.price;
                return (
                  <motion.div
                    key={item.id}
                    variants={fadeInUp}
                    className="bg-white rounded-2xl p-4 sm:p-5 shadow-soft border border-stone-100 flex gap-4 sm:gap-5"
                  >
                    {/* Image */}
                    <Link
                      href={`/artwork/${item.slug}`}
                      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0"
                    >
                      <Image
                        src={getPrimaryImageUrl(item.images)}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/artwork/${item.slug}`}
                            className="font-serif text-base font-semibold text-stone-900 hover:text-amber-700 transition-colors line-clamp-1"
                          >
                            {item.title}
                          </Link>
                          <p className="text-xs text-stone-400 capitalize mt-0.5">{item.type} &bull; {item.topic}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 sm:p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-stone-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 sm:p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          {item.salePrice ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-stone-400 line-through">{formatPrice(item.price)}</span>
                              <span className="font-semibold text-amber-700">{formatPrice(item.salePrice)}</span>
                            </div>
                          ) : (
                            <span className="font-semibold text-stone-900">{formatPrice(item.price)}</span>
                          )}
                          {item.quantity > 1 && (
                            <p className="text-[11px] text-stone-400 mt-0.5">
                              {formatPrice(displayPrice)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl p-6 shadow-card border border-stone-100 sticky top-24">
                <h2 className="font-serif text-lg font-semibold text-stone-900 mb-6">Order Summary</h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Subtotal</span>
                    <span className="font-medium text-stone-900">{formatPrice(subtotalValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Shipping</span>
                    <span className={cn('font-medium', shippingEstimate === 0 ? 'text-emerald-600' : 'text-stone-900')}>
                      {shippingEstimate === 0 ? 'Free' : formatPrice(shippingEstimate)}
                    </span>
                  </div>
                  <div className="border-t border-stone-100 pt-3 flex justify-between">
                    <span className="text-base font-semibold text-stone-900">Total</span>
                    <span className="text-base font-bold text-stone-900">{formatPrice(totalValue)}</span>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button variant="primary" size="lg" className="w-full mt-6 gap-2">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                {/* Trust badges */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <Shield className="h-3.5 w-3.5" />
                    Secure checkout
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <Package className="h-3.5 w-3.5" />
                    Free shipping on orders over {formatPrice(freeShippingThreshold)}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
