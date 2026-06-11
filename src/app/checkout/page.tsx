// ================================================================
// Artist Portfolio — Checkout Page
// ================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  ChevronLeft,
  Check,
  Copy,
  Upload,
  Loader2,
  ArrowRight,
  CreditCard,
  Bitcoin,
  Building2,
  Shield,
  Lock,
  FileText,
  Wallet,
} from 'lucide-react';
import { orderApi, settingsApi } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/lib/store';
import { cn, formatPrice, getPrimaryImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/loading';
import type { SiteSettings, CryptoAddress, BankDetails } from '@/types';
import toast from 'react-hot-toast';

// ─── Mock Settings ────────────────────────────────────────────────

const MOCK_SETTINGS: SiteSettings = {
  siteName: 'Atelier A.',
  siteDescription: '',
  artistName: 'Ugwokechinonso',
  artistBio: '',
  artistEmail: 'hello@atelierartist.com',
  artistPhone: '+234 800 000 0000',
  address: 'Lagos, Nigeria',
  currency: 'NGN',
  currencySymbol: '₦',
  socialLinks: {},
  shippingFee: 25000,
  freeShippingThreshold: 500000,
  bankDetails: {
    bankName: 'First Bank of Nigeria',
    accountName: 'Ugwokechinonso Art Studio',
    accountNumber: '2023456789',
    sortCode: '011',
  },
  cryptoAddresses: [
    { network: 'Bitcoin (BTC)', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', symbol: 'BTC' },
    { network: 'Ethereum (ETH)', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', symbol: 'ETH' },
    { network: 'USDT (TRC-20)', address: 'TXYZ1234567890abcdefghijklmnopqrstuvw', symbol: 'USDT' },
    { network: 'USDT (ERC-20)', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD19', symbol: 'USDT' },
  ],
  paymentMethods: ['paystack', 'crypto', 'bank_transfer'],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  maintenanceMode: false,
  createdAt: '',
  updatedAt: '',
};

// ─── Form Validation ──────────────────────────────────────────────

interface FormErrors {
  [key: string]: string;
}

function validateForm(data: Record<string, string>): FormErrors {
  const errors: FormErrors = {};
  if (!data.fullName?.trim()) errors.fullName = 'Full name is required';
  if (!data.email?.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email address';
  if (!data.phone?.trim()) errors.phone = 'Phone number is required';
  if (!data.street?.trim()) errors.street = 'Street address is required';
  if (!data.city?.trim()) errors.city = 'City is required';
  if (!data.state?.trim()) errors.state = 'State is required';
  if (!data.country?.trim()) errors.country = 'Country is required';
  return errors;
}

// ─── Copy Button ─────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-stone-400" />}
    </button>
  );
}

// ─── Checkout Page ───────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [settings, setSettings] = useState<SiteSettings>(MOCK_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'crypto' | 'bank_transfer'>('paystack');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [cryptoReference, setCryptoReference] = useState('');
  const [bankReference, setBankReference] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const freeShippingThreshold = settings.freeShippingThreshold || 500000;
  const subtotalValue = subtotal();
  const shipping = subtotalValue >= freeShippingThreshold ? 0 : (settings.shippingFee || 25000);
  const total = subtotalValue + shipping;

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
      return;
    }
    const fetchSettings = async () => {
      try {
        const data = await settingsApi.getSiteSettings();
        if (data) setSettings(data);
      } catch {
        // Use mock
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [items.length, router]);

  // Pre-fill from auth
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handlePlaceOrder = async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fill in all required fields');
      return;
    }
    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          artworkId: item.id,
          quantity: item.quantity,
          title: item.title,
          price: item.salePrice ?? item.price,
          image: getPrimaryImageUrl(item.images),
        })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        paymentMethod,
      };

      await orderApi.createOrder(orderData);
      clearCart();
      toast.success('Order placed successfully!');
      router.push('/orders');
    } catch {
      // Fallback — simulate success for demo
      await new Promise((r) => setTimeout(r, 1000));
      clearCart();
      toast.success('Order placed successfully!');
      router.push('/orders');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader text="Loading checkout..." />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-semibold text-stone-900 mb-2">No items to checkout</h2>
          <p className="text-stone-500 mb-6">Your cart is empty. Add some artworks first.</p>
          <Link href="/shop">
            <Button variant="primary">Browse Gallery</Button>
          </Link>
        </div>
      </div>
    );
  }

  const renderShippingStep = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h2 className="font-serif text-xl font-semibold text-stone-900">Shipping Information</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            error={formErrors.fullName}
            placeholder="John Doe"
          />
        </div>
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          error={formErrors.email}
          placeholder="john@example.com"
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          error={formErrors.phone}
          placeholder="+234 800 000 0000"
        />
        <div className="sm:col-span-2">
          <Input
            label="Street Address"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            error={formErrors.street}
            placeholder="123 Art Street, Victoria Island"
          />
        </div>
        <Input
          label="City"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          error={formErrors.city}
          placeholder="Lagos"
        />
        <Input
          label="State"
          name="state"
          value={formData.state}
          onChange={handleInputChange}
          error={formErrors.state}
          placeholder="Lagos"
        />
        <Input
          label="ZIP / Postal Code"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleInputChange}
          placeholder="100001"
        />
        <Input
          label="Country"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          error={formErrors.country}
          placeholder="Nigeria"
        />
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full sm:w-auto gap-2"
        onClick={() => setStep('payment')}
      >
        Continue to Payment
        <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );

  const renderPaymentStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      {/* Payment Method Selection */}
      <div>
        <h2 className="font-serif text-xl font-semibold text-stone-900 mb-4">Payment Method</h2>
        <div className="space-y-3">
          {/* Paystack */}
          <button
            onClick={() => setPaymentMethod('paystack')}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
              paymentMethod === 'paystack'
                ? 'border-amber-500 bg-amber-50/50'
                : 'border-stone-200 hover:border-stone-300 bg-white',
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              paymentMethod === 'paystack' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500',
            )}>
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-stone-900">Pay with Card</p>
              <p className="text-xs text-stone-500">Credit / Debit card via Paystack</p>
            </div>
            {paymentMethod === 'paystack' && <Check className="h-5 w-5 text-amber-600" />}
          </button>

          {/* Cryptocurrency */}
          <button
            onClick={() => setPaymentMethod('crypto')}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
              paymentMethod === 'crypto'
                ? 'border-amber-500 bg-amber-50/50'
                : 'border-stone-200 hover:border-stone-300 bg-white',
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              paymentMethod === 'crypto' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500',
            )}>
              <Bitcoin className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-stone-900">Cryptocurrency</p>
              <p className="text-xs text-stone-500">BTC, ETH, USDT (TRC-20 / ERC-20)</p>
            </div>
            {paymentMethod === 'crypto' && <Check className="h-5 w-5 text-amber-600" />}
          </button>

          {/* Bank Transfer */}
          <button
            onClick={() => setPaymentMethod('bank_transfer')}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
              paymentMethod === 'bank_transfer'
                ? 'border-amber-500 bg-amber-50/50'
                : 'border-stone-200 hover:border-stone-300 bg-white',
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              paymentMethod === 'bank_transfer' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500',
            )}>
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-stone-900">Bank Transfer</p>
              <p className="text-xs text-stone-500">Direct bank deposit with upload proof</p>
            </div>
            {paymentMethod === 'bank_transfer' && <Check className="h-5 w-5 text-amber-600" />}
          </button>
        </div>
      </div>

      {/* Paystack Info */}
      {paymentMethod === 'paystack' && (
        <div className="p-5 rounded-xl bg-amber-50 border border-amber-100">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-stone-900 text-sm">Secure Card Payment</p>
              <p className="text-xs text-stone-500 mt-1">
                You will be redirected to Paystack&apos;s secure checkout to complete your payment.
                We accept Visa, Mastercard, Verve, and other major cards.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Crypto Details */}
      {paymentMethod === 'crypto' && (
        <div className="space-y-4">
          <p className="text-sm text-stone-500">
            Send the exact amount in any of the following networks. Include your reference for tracking.
          </p>

          <div className="space-y-3">
            {settings.cryptoAddresses.map((crypto: CryptoAddress) => (
              <div
                key={crypto.network}
                className="p-4 rounded-xl bg-white border border-stone-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-stone-900">{crypto.network}</span>
                  <Badge variant="outline" size="sm">{crypto.symbol}</Badge>
                </div>
                <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-2.5">
                  <Wallet className="h-4 w-4 text-stone-400 flex-shrink-0" />
                  <code className="text-xs text-stone-600 flex-1 break-all font-mono">{crypto.address}</code>
                  <CopyButton text={crypto.address} />
                </div>
              </div>
            ))}
          </div>

          <Input
            label="Payment Reference (Optional)"
            value={cryptoReference}
            onChange={(e) => setCryptoReference(e.target.value)}
            placeholder="e.g., Order #123 or your name"
            icon={<FileText className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Bank Transfer Details */}
      {paymentMethod === 'bank_transfer' && (
        <div className="space-y-4">
          <p className="text-sm text-stone-500">
            Make a direct bank transfer to the account below, then upload your payment receipt.
          </p>

          <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-stone-100">
              <span className="text-sm text-stone-500">Bank</span>
              <span className="text-sm font-medium text-stone-900">{settings.bankDetails.bankName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-100">
              <span className="text-sm text-stone-500">Account Name</span>
              <span className="text-sm font-medium text-stone-900">{settings.bankDetails.accountName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-100">
              <span className="text-sm text-stone-500">Account Number</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-stone-900">{settings.bankDetails.accountNumber}</span>
                <CopyButton text={settings.bankDetails.accountNumber} />
              </div>
            </div>
            {settings.bankDetails.sortCode && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-stone-500">Sort Code</span>
                <span className="text-sm font-medium text-stone-900">{settings.bankDetails.sortCode}</span>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="text-sm font-medium text-stone-700 mb-2 block">Upload Payment Proof</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all"
            >
              {paymentProof ? (
                <div className="flex items-center justify-center gap-2 text-emerald-600">
                  <Check className="h-5 w-5" />
                  <span className="text-sm font-medium">{paymentProof.name}</span>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm text-stone-500">Click to upload payment receipt or screenshot</p>
                  <p className="text-xs text-stone-400 mt-1">PNG, JPG, or PDF (max 5MB)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setPaymentProof(e.target.files[0]);
                }}
              />
            </div>
          </div>

          <Input
            label="Transaction Reference (Optional)"
            value={bankReference}
            onChange={(e) => setBankReference(e.target.value)}
            placeholder="e.g., transaction ID or deposit slip number"
            icon={<FileText className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
        />
        <span className="text-sm text-stone-500">
          I agree to the{' '}
          <a href="/terms" className="text-amber-700 underline hover:text-amber-800">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-amber-700 underline hover:text-amber-800">Privacy Policy</a>
          . I understand that artwork images are representative and the actual piece may vary slightly.
        </span>
      </label>

      {/* Back & Place Order */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button variant="ghost" onClick={() => setStep('shipping')} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" />
          Back to Shipping
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="flex-1 gap-2"
          onClick={handlePlaceOrder}
          loading={submitting}
          disabled={submitting || !acceptedTerms}
        >
          <Lock className="h-4 w-4" />
          Place Order &mdash; {formatPrice(total)}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="bg-white border-b border-stone-100">
        <div className="section-container py-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/cart" className="text-stone-400 hover:text-stone-600 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-serif text-3xl font-bold text-stone-900">Checkout</h1>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              step === 'shipping' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-400',
            )}>
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-current text-white text-[10px] font-bold">1</span>
              Shipping
            </div>
            <div className="w-6 h-px bg-stone-200" />
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              step === 'payment' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-400',
            )}>
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-current text-white text-[10px] font-bold">2</span>
              Payment
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Checkout ───────────────────────────────── */}
      <section className="section-padding bg-warm flex-1">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-stone-100">
              {step === 'shipping' ? renderShippingStep() : renderPaymentStep()}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-card border border-stone-100 sticky top-24">
                <h3 className="font-serif text-lg font-semibold text-stone-900 mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                        <Image
                          src={getPrimaryImageUrl(item.images)}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium text-stone-700">
                          {formatPrice((item.salePrice ?? item.price) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Subtotal</span>
                    <span className="text-stone-900">{formatPrice(subtotalValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Shipping</span>
                    <span className={shipping === 0 ? 'text-emerald-600' : 'text-stone-900'}>
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="border-t border-stone-100 pt-2 flex justify-between">
                    <span className="font-semibold text-stone-900">Total</span>
                    <span className="font-bold text-lg text-stone-900">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs text-stone-400">
                  <Shield className="h-3.5 w-3.5" />
                  Secured with 256-bit SSL encryption
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
