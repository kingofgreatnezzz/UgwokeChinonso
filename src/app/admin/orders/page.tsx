'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { orderApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageLoader, TableRowSkeleton } from '@/components/ui/loading';
import { Search, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Order, OrderStatus } from '@/types';
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

const allStatuses: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await orderApi.getAllOrders({
        page,
        limit: 15,
        status: statusFilter !== 'all' ? (statusFilter as OrderStatus) : undefined,
      });
      setOrders(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(orderId);
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.shippingAddress?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading && page === 1) return <PageLoader text="Loading orders…" />;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">Orders</h1>
        <p className="mt-1 text-stone-500">Manage customer orders</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search by order #, customer name, or email…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-10 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {allStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="mb-4 h-16 w-16 text-stone-200" />
              <h3 className="text-lg font-semibold text-stone-700">No orders found</h3>
              <p className="mt-1 text-sm text-stone-500">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'No orders have been placed yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50">
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-stone-500">Order #</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-stone-500">Customer</th>
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
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-stone-900">
                          #{order.orderNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-stone-900">
                              {order.user?.name || order.shippingAddress?.fullName || '—'}
                            </p>
                            <p className="text-xs text-stone-400">
                              {order.user?.email || ''}
                            </p>
                          </div>
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
                          <div className="w-36">
                            <Select
                              value={order.status}
                              onValueChange={(val) =>
                                handleStatusUpdate(order.id, val as OrderStatus)
                              }
                              disabled={updatingStatus === order.id}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {allStatuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-stone-200 px-4 py-3">
                  <p className="text-sm text-stone-500">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      leftIcon={<ChevronLeft className="h-4 w-4" />}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
