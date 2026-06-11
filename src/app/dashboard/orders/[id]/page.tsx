'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { orderApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/loading';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  FileText,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
import { formatDate, formatDateTime, formatPrice, getImageUrl } from '@/lib/utils';

const statusVariant: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'primary',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'default',
};

const paymentBadgeVariant: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  paid: 'success',
  partially_paid: 'info',
  refunded: 'default',
  failed: 'danger',
};

const orderSteps: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'pending', label: 'Order Placed', icon: <Clock className="h-4 w-4" /> },
  { status: 'confirmed', label: 'Confirmed', icon: <CheckCircle className="h-4 w-4" /> },
  { status: 'processing', label: 'Processing', icon: <Package className="h-4 w-4" /> },
  { status: 'shipped', label: 'Shipped', icon: <Truck className="h-4 w-4" /> },
  { status: 'delivered', label: 'Delivered', icon: <CheckCircle className="h-4 w-4" /> },
];

const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router]);

  const fetchOrder = async () => {
    try {
      const data = await orderApi.getOrder(params.id as string);
      setOrder(data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader text="Loading order details…" />;

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package className="mb-4 h-16 w-16 text-stone-200" />
        <h3 className="text-lg font-semibold text-stone-700">Order not found</h3>
        <Link href="/dashboard/orders" className="mt-4">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const currentStepIndex = statusOrder.indexOf(order.status);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-down">
        <Link
          href="/dashboard/orders"
          className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-stone-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900">
              Order #{order.orderNumber}
            </h1>
            <p className="mt-1 text-stone-500">Placed on {formatDateTime(order.createdAt)}</p>
          </div>
          <Badge variant={statusVariant[order.status] || 'default'} size="lg">
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column - Items & Timeline */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Timeline */}
          {order.status !== 'cancelled' && order.status !== 'refunded' && (
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {orderSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                      <div key={step.status} className="flex items-start gap-4 pb-6 last:pb-0">
                        <div className="relative flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                              isCompleted
                                ? 'border-amber-500 bg-amber-500 text-white'
                                : 'border-stone-300 bg-white text-stone-400'
                            } ${isCurrent ? 'ring-2 ring-amber-500/30 ring-offset-2' : ''}`}
                          >
                            {step.icon}
                          </div>
                          {index < orderSteps.length - 1 && (
                            <div
                              className={`mt-1 h-8 w-0.5 ${
                                isCompleted && index < currentStepIndex
                                  ? 'bg-amber-500'
                                  : 'bg-stone-200'
                              }`}
                            />
                          )}
                        </div>
                        <div className="pt-1">
                          <p
                            className={`text-sm font-medium ${
                              isCompleted ? 'text-stone-900' : 'text-stone-400'
                            }`}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="mt-0.5 text-xs text-stone-500">Current status</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cancelled status */}
          {(order.status === 'cancelled' || order.status === 'refunded') && (
            <Card className="animate-fade-in-up border-red-200">
              <CardContent className="flex items-center gap-3 p-5">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="font-semibold text-red-700">
                    {order.status === 'cancelled' ? 'Order Cancelled' : 'Order Refunded'}
                  </p>
                  <p className="text-sm text-stone-500">
                    This order was {order.status} on{' '}
                    {order.updatedAt ? formatDateTime(order.updatedAt) : '—'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items */}
          <Card className="animate-fade-in-up">
            <CardHeader>
              <CardTitle>Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-stone-100">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900 truncate">{item.title}</p>
                      <p className="mt-0.5 text-sm text-stone-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-stone-900">{formatPrice(item.price)}</p>
                      <p className="text-xs text-stone-400">each</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-1.5 border-t border-stone-200 pt-4">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Shipping</span>
                  <span>{order.shipping > 0 ? formatPrice(order.shipping) : 'Free'}</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-1.5 text-base font-bold text-stone-900">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Button */}
          <div className="flex gap-3 animate-fade-in-up">
            <Button variant="outline" leftIcon={<FileText className="h-4 w-4" />}>
              Download Invoice
            </Button>
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          {/* Payment Info */}
          <Card className="animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Method</span>
                <span className="font-medium text-stone-900 capitalize">
                  {order.paymentMethod?.replace('_', ' ') || '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Status</span>
                <Badge variant={paymentBadgeVariant[order.paymentStatus] || 'default'}>
                  {order.paymentStatus.replace('_', ' ')}
                </Badge>
              </div>
              {order.paymentProof?.notes && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Reference</span>
                  <span className="font-medium text-stone-900 text-right">
                    {order.paymentProof.notes}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-stone-700">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="mt-2 text-stone-500">{order.shippingAddress.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-stone-600">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
