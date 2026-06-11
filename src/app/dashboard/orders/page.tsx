'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { orderApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/loading';
import { Package, ArrowLeft, Eye, Search } from 'lucide-react';
import type { Order } from '@/types';
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

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      const data = await orderApi.getOrders();
      setOrders(data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) return <PageLoader text="Loading orders…" />;

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
            <h1 className="font-serif text-3xl font-bold text-stone-900">My Orders</h1>
            <p className="mt-1 text-stone-500">View and track all your orders.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by order number…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-10 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="mb-4 h-16 w-16 text-stone-200" />
              <h3 className="text-lg font-semibold text-stone-700">No orders found</h3>
              <p className="mt-1 text-sm text-stone-500">
                {searchQuery
                  ? 'Try adjusting your search query.'
                  : 'You haven&apos;t placed any orders yet.'}
              </p>
              {!searchQuery && (
                <Link href="/shop" className="mt-4">
                  <Button>Browse Artworks</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-stone-500">Order #</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-stone-500">Date</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-stone-500">Items</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-stone-500">Total</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-stone-500">Payment</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-stone-500">Status</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-stone-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-stone-100 transition-colors hover:bg-stone-50"
                    >
                      <td className="px-4 py-3 font-medium text-stone-900">
                        #{order.orderNumber}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-stone-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-stone-700">{order.items.length}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-stone-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            order.paymentStatus === 'paid' || order.paymentStatus === 'partially_paid'
                              ? 'success'
                              : order.paymentStatus === 'failed'
                                ? 'danger'
                                : 'warning'
                          }
                        >
                          {order.paymentStatus.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant[order.status] || 'default'}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Eye className="h-4 w-4" />}
                          onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                        >
                          View
                        </Button>
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
  );
}
