'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { dashboardApi, orderApi, artworkApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/loading';
import {
  Image,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Plus,
  Settings,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DashboardStats, Order } from '@/types';
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch {
      // Use mock data as fallback
      setStats({
        totalArtworks: 0,
        totalSales: 0,
        totalOrders: 0,
        revenue: 0,
        recentOrders: [],
        salesByMonth: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader text="Loading admin dashboard…" />;

  const chartData =
    stats?.salesByMonth?.length
      ? stats.salesByMonth
      : Array.from({ length: 6 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (5 - i));
          return {
            month: d.toLocaleString('default', { month: 'short' }),
            sales: 0,
            revenue: 0,
          };
        });

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-stone-500">Overview of your artist portfolio</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in-up stagger-1 border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <Image className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
                Total Artworks
              </span>
            </div>
            <p className="text-3xl font-bold text-stone-900">{stats?.totalArtworks || 0}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-2 border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
                Total Sales
              </span>
            </div>
            <p className="text-3xl font-bold text-stone-900">{stats?.totalSales || 0}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-3 border-l-4 border-l-sky-500">
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-sky-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
                Total Orders
              </span>
            </div>
            <p className="text-3xl font-bold text-stone-900">{stats?.totalOrders || 0}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-4 border-l-4 border-l-purple-500">
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
                Revenue
              </span>
            </div>
            <p className="text-3xl font-bold text-stone-900">
              {formatPrice(stats?.revenue || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <Card className="animate-fade-in-up stagger-5">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue for the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                    <XAxis
                      dataKey="month"
                      stroke="#a8a29e"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#a8a29e"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e7e5e4',
                        borderRadius: '8px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      }}
                      formatter={(value: any) => [formatPrice(Number(value) || 0), 'Revenue'] as [string, string]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#d97706"
                      strokeWidth={2.5}
                      dot={{ fill: '#d97706', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#d97706' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="mt-6 animate-fade-in-up stagger-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest 10 orders placed</CardDescription>
              </div>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!stats?.recentOrders?.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <ShoppingBag className="mb-3 h-12 w-12 text-stone-300" />
                  <p className="text-stone-500">No orders yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="px-3 py-3 font-medium text-stone-500">Order #</th>
                        <th className="px-3 py-3 font-medium text-stone-500">Customer</th>
                        <th className="px-3 py-3 font-medium text-stone-500">Date</th>
                        <th className="px-3 py-3 font-medium text-stone-500">Total</th>
                        <th className="px-3 py-3 font-medium text-stone-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.slice(0, 10).map((order) => (
                        <tr
                          key={order.id}
                          className="cursor-pointer border-b border-stone-100 transition-colors hover:bg-stone-50"
                          onClick={() => router.push(`/admin/orders`)}
                        >
                          <td className="px-3 py-3 font-medium text-stone-900">
                            #{order.orderNumber}
                          </td>
                          <td className="px-3 py-3 text-stone-600">
                            {order.user?.name || order.shippingAddress?.fullName || '—'}
                          </td>
                          <td className="px-3 py-3 text-stone-500">{formatDate(order.createdAt)}</td>
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
          <Card className="animate-fade-in-up stagger-7">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/artworks/new">
                <Button className="w-full justify-start" leftIcon={<Plus className="h-4 w-4" />}>
                  Add New Artwork
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant="secondary" className="w-full justify-start" leftIcon={<ShoppingBag className="h-4 w-4" />}>
                  Manage Orders
                </Button>
              </Link>
              <Link href="/admin/content">
                <Button variant="outline" className="w-full justify-start" leftIcon={<Settings className="h-4 w-4" />}>
                  Site Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
