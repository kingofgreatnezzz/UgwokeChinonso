'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { settingsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/loading';
import { Save, CreditCard, HardDrive, Share2 } from 'lucide-react';
import type { SiteSettings } from '@/types';

const paymentSchema = z.object({
  paystackPublicKey: z.string().optional(),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  btcAddress: z.string().optional(),
  ethAddress: z.string().optional(),
  usdtTrc20Address: z.string().optional(),
  usdtErc20Address: z.string().optional(),
});
type PaymentData = z.infer<typeof paymentSchema>;

const storageSchema = z.object({
  storageProvider: z.string().optional(),
  cloudinaryCloudName: z.string().optional(),
  cloudinaryApiKey: z.string().optional(),
  awsBucket: z.string().optional(),
  awsRegion: z.string().optional(),
});
type StorageData = z.infer<typeof storageSchema>;

const socialSchema = z.object({
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
  linkedin: z.string().optional(),
  pinterest: z.string().optional(),
  whatsapp: z.string().optional(),
  etsy: z.string().optional(),
});
type SocialData = z.infer<typeof socialSchema>;

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingStorage, setSavingStorage] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);

  const paymentForm = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paystackPublicKey: '',
      bankName: '',
      accountName: '',
      accountNumber: '',
      btcAddress: '',
      ethAddress: '',
      usdtTrc20Address: '',
      usdtErc20Address: '',
    },
  });

  const storageForm = useForm<StorageData>({
    resolver: zodResolver(storageSchema),
    defaultValues: {
      storageProvider: 'local',
      cloudinaryCloudName: '',
      cloudinaryApiKey: '',
      awsBucket: '',
      awsRegion: '',
    },
  });

  const socialForm = useForm<SocialData>({
    resolver: zodResolver(socialSchema),
    defaultValues: {
      instagram: '',
      facebook: '',
      twitter: '',
      tiktok: '',
      youtube: '',
      linkedin: '',
      pinterest: '',
      whatsapp: '',
      etsy: '',
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data: SiteSettings = await settingsApi.getSiteSettings();
        paymentForm.reset({
          paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
          bankName: data.bankDetails?.bankName || '',
          accountName: data.bankDetails?.accountName || '',
          accountNumber: data.bankDetails?.accountNumber || '',
          btcAddress: data.cryptoAddresses?.find((c) => c.network === 'BTC')?.address || '',
          ethAddress: data.cryptoAddresses?.find((c) => c.network === 'ETH')?.address || '',
          usdtTrc20Address: data.cryptoAddresses?.find((c) => c.network === 'USDT_TRC20')?.address || '',
          usdtErc20Address: data.cryptoAddresses?.find((c) => c.network === 'USDT_ERC20')?.address || '',
        });
        socialForm.reset({
          instagram: data.socialLinks?.instagram || '',
          facebook: data.socialLinks?.facebook || '',
          twitter: data.socialLinks?.twitter || '',
          tiktok: data.socialLinks?.tiktok || '',
          youtube: data.socialLinks?.youtube || '',
          linkedin: data.socialLinks?.linkedin || '',
          pinterest: data.socialLinks?.pinterest || '',
          whatsapp: data.socialLinks?.whatsapp || '',
          etsy: data.socialLinks?.etsy || '',
        });
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSavePayment = async (data: PaymentData) => {
    setSavingPayment(true);
    try {
      await settingsApi.updateSiteSetting({
        bankDetails: {
          bankName: data.bankName || '',
          accountName: data.accountName || '',
          accountNumber: data.accountNumber || '',
        },
        cryptoAddresses: [
          ...(data.btcAddress ? [{ network: 'BTC', address: data.btcAddress, symbol: 'BTC' }] : []),
          ...(data.ethAddress ? [{ network: 'ETH', address: data.ethAddress, symbol: 'ETH' }] : []),
          ...(data.usdtTrc20Address ? [{ network: 'USDT_TRC20', address: data.usdtTrc20Address, symbol: 'USDT' }] : []),
          ...(data.usdtErc20Address ? [{ network: 'USDT_ERC20', address: data.usdtErc20Address, symbol: 'USDT' }] : []),
        ],
      } as unknown as Parameters<typeof settingsApi.updateSiteSetting>[0]);
      toast.success('Payment settings saved');
    } catch {
      toast.error('Failed to save payment settings');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleSaveStorage = async (data: StorageData) => {
    setSavingStorage(true);
    try {
      // Storage settings are typically stored in env vars, but we can save metadata
      await settingsApi.updateSiteSetting({
        storageProvider: data.storageProvider,
      } as unknown as Parameters<typeof settingsApi.updateSiteSetting>[0]);
      toast.success('Storage settings saved. Note: actual config is in environment variables.');
    } catch {
      toast.error('Failed to save storage settings');
    } finally {
      setSavingStorage(false);
    }
  };

  const handleSaveSocial = async (data: SocialData) => {
    setSavingSocial(true);
    try {
      await settingsApi.updateSiteSetting({
        socialLinks: {
          instagram: data.instagram || '',
          facebook: data.facebook || '',
          twitter: data.twitter || '',
          tiktok: data.tiktok || '',
          youtube: data.youtube || '',
          linkedin: data.linkedin || '',
          pinterest: data.pinterest || '',
          whatsapp: data.whatsapp || '',
          etsy: data.etsy || '',
        },
      } as unknown as Parameters<typeof settingsApi.updateSiteSetting>[0]);
      toast.success('Social media links saved');
    } catch {
      toast.error('Failed to save social links');
    } finally {
      setSavingSocial(false);
    }
  };

  if (loading) return <PageLoader text="Loading settings…" />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">Settings</h1>
        <p className="mt-1 text-stone-500">Site-wide configuration and preferences</p>
      </div>

      <div className="space-y-8">
        {/* Payment Settings */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <CreditCard className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure payment methods and crypto addresses</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={paymentForm.handleSubmit(handleSavePayment)}
              className="space-y-6"
            >
              <div>
                <h3 className="mb-3 text-sm font-semibold text-stone-700">Paystack</h3>
                <Input
                  label="Public Key"
                  placeholder="pk_live_..."
                  value={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''}
                  disabled
                  {...paymentForm.register('paystackPublicKey')}
                />
                <p className="mt-0.5 text-xs text-stone-400">
                  Configured via NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY env variable
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-stone-700">Bank Details</h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <Input
                    label="Bank Name"
                    placeholder="e.g. GTBank"
                    {...paymentForm.register('bankName')}
                  />
                  <Input
                    label="Account Name"
                    placeholder="Full account name"
                    {...paymentForm.register('accountName')}
                  />
                  <Input
                    label="Account Number"
                    placeholder="0123456789"
                    {...paymentForm.register('accountNumber')}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-stone-700">
                  Crypto Wallet Addresses
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input
                    label="Bitcoin (BTC)"
                    placeholder="bc1q..."
                    {...paymentForm.register('btcAddress')}
                  />
                  <Input
                    label="Ethereum (ETH)"
                    placeholder="0x..."
                    {...paymentForm.register('ethAddress')}
                  />
                  <Input
                    label="USDT (TRC20)"
                    placeholder="T..."
                    {...paymentForm.register('usdtTrc20Address')}
                  />
                  <Input
                    label="USDT (ERC20)"
                    placeholder="0x..."
                    {...paymentForm.register('usdtErc20Address')}
                  />
                </div>
              </div>

              <Button
                type="submit"
                loading={savingPayment}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Payment Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Storage Settings */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                <HardDrive className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <CardTitle>Storage Settings</CardTitle>
                <CardDescription>Configure file storage for artwork images</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={storageForm.handleSubmit(handleSaveStorage)}
              className="space-y-5"
            >
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-700">Current Provider</p>
                    <p className="text-sm text-stone-500">
                      {storageForm.watch('storageProvider') === 'cloudinary'
                        ? 'Cloudinary'
                        : storageForm.watch('storageProvider') === 'aws'
                          ? 'Amazon S3'
                          : 'Local Storage'}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Storage Provider
                </label>
                <select
                  {...storageForm.register('storageProvider')}
                  className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="local">Local Storage</option>
                  <option value="cloudinary">Cloudinary</option>
                  <option value="aws">Amazon S3</option>
                </select>
              </div>

              <p className="text-xs text-stone-400">
                For production, configure Cloudinary or AWS S3 via environment variables:
                <br />
                <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs">
                  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                </code>
                ,{' '}
                <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs">
                  AWS_ACCESS_KEY_ID
                </code>
                , etc.
              </p>

              <Button
                type="submit"
                loading={savingStorage}
                leftIcon={<Save className="h-4 w-4" />}
                variant="outline"
              >
                Save Storage Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Share2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Connect your social media profiles</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={socialForm.handleSubmit(handleSaveSocial)}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  label="Instagram"
                  placeholder="https://instagram.com/yourhandle"
                  {...socialForm.register('instagram')}
                  icon={<span className="text-xs text-stone-400">IG</span>}
                />
                <Input
                  label="Facebook"
                  placeholder="https://facebook.com/yourhandle"
                  {...socialForm.register('facebook')}
                  icon={<span className="text-xs text-stone-400">FB</span>}
                />
                <Input
                  label="Twitter / X"
                  placeholder="https://twitter.com/yourhandle"
                  {...socialForm.register('twitter')}
                  icon={<span className="text-xs text-stone-400">X</span>}
                />
                <Input
                  label="TikTok"
                  placeholder="https://tiktok.com/@yourhandle"
                  {...socialForm.register('tiktok')}
                  icon={<span className="text-xs text-stone-400">TK</span>}
                />
                <Input
                  label="YouTube"
                  placeholder="https://youtube.com/@yourchannel"
                  {...socialForm.register('youtube')}
                  icon={<span className="text-xs text-stone-400">YT</span>}
                />
                <Input
                  label="LinkedIn"
                  placeholder="https://linkedin.com/in/yourprofile"
                  {...socialForm.register('linkedin')}
                  icon={<span className="text-xs text-stone-400">LI</span>}
                />
                <Input
                  label="Pinterest"
                  placeholder="https://pinterest.com/yourhandle"
                  {...socialForm.register('pinterest')}
                  icon={<span className="text-xs text-stone-400">PI</span>}
                />
                <Input
                  label="WhatsApp"
                  placeholder="https://wa.me/2348000000000"
                  {...socialForm.register('whatsapp')}
                  icon={<span className="text-xs text-stone-400">WA</span>}
                />
                <Input
                  label="Etsy"
                  placeholder="https://etsy.com/shop/yourhandle"
                  {...socialForm.register('etsy')}
                  icon={<span className="text-xs text-stone-400">ET</span>}
                />
              </div>

              <Button
                type="submit"
                loading={savingSocial}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Social Links
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
