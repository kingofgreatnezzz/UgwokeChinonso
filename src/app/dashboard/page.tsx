'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, useCartStore } from '@/lib/store';
import { orderApi, wishlistApi, dashboardApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/loading';
import {
  Package,
  Heart,
  ShoppingBag,
  User,
  ArrowRight,
  Clock,
  TrendingUp,
  ShoppingCart,
} from 'lucide-react';
import type { Order, DashboardStats } from '@/types';
import { formatDate, formatPrice } from '@/lib/utils';

const statusVariant: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'primary',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'default',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [ordersData, wishlistData] = await Promise.all([
          orderApi.getOrders(),
          wishlistApi.getWishlist(),
        ]);
        setOrders(ordersData);
        setWishlistCount(wishlistData.length);

        // Try fetching dashboard stats
        try {
          const statsData = await dashboardApi.getStats();
          setStats(statsData);
        } catch {
          // Stats endpoint may not be available
        }
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, router]);

  if (loading) return <PageLoader text="Loading dashboard…" />;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome */}
      <div className="mb-8 animate-fade-in-down">
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Welcome back, {user?.name?.split(' ')[0] || 'Artist'}
        </h1>
        <p className="mt-1 text-stone-500">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in-up stagger-1">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <ShoppingBag className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Total Orders</p>
              <p className="text-2xl font-bold text-stone-900">{orders.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-2">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100">
              <Heart className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Wishlist Items</p>
              <p className="text-2xl font-bold text-stone-900">{wishlistCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-3">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Total Spent</p>
              <p className="text-2xl font-bold text-stone-900">
                {formatPrice(orders.reduce((sum, o) => sum + o.total, 0))}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-4">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100">
              <Clock className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Member Since</p>
              <p className="text-lg font-bold text-stone-900">
                {user?.createdAt ? formatDate(user.createdAt) : '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="animate-fade-in-up stagger-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your last {recentOrders.length} orders</CardDescription>
              </div>
              {orders.length > 0 && (
                <Link href="/dashboard/orders">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    View All
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Package className="mb-3 h-12 w-12 text-stone-300" />
                  <p className="text-stone-500">No orders yet</p>
                  <Link href="/shop" className="mt-3">
                    <Button variant="outline" size="sm">
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="px-3 py-3 font-medium text-stone-500">Order #</th>
                        <th className="px-3 py-3 font-medium text-stone-500">Date</th>
                        <th className="px-3 py-3 font-medium text-stone-500">Items</th>
                        <th className="px-3 py-3 font-medium text-stone-500">Total</th>
                        <th className="px-3 py-3 font-medium text-stone-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="cursor-pointer border-b border-stone-100 transition-colors hover:bg-stone-50"
                          onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                        >
                          <td className="px-3 py-3 font-medium text-stone-900">
                            #{order.orderNumber}
                          </td>
                          <td className="px-3 py-3 text-stone-500">{formatDate(order.createdAt)}</td>
                          <td className="px-3 py-3 text-stone-700">{order.items.length}</td>
                          <td className="px-3 py-3 font-medium text-stone-900">
                            {formatPrice(order.total)}
                          </td>
                          <td className="px-3 py-3">
                            <Badge variant={statusVariant[order.status] || 'default'}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="animate-fade-in-up stagger-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Navigate to key areas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/shop">
                <Button variant="outline" className="w-full justify-start" leftIcon={<ShoppingCart className="h-4 w-4" />}>
                  View Shop
                </Button>
              </Link>
              <Link href="/dashboard/wishlist">
                <Button variant="outline" className="w-full justify-start" leftIcon={<Heart className="h-4 w-4" />}>
                  My Wishlist
                </Button>
              </Link>
              <Link href="/dashboard/orders">
                <Button variant="outline" className="w-full justify-start" leftIcon={<Package className="h-4 w-4" />}>
                  My Orders
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="w-full justify-start" leftIcon={<User className="h-4 w-4" />}>
                  Profile Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
