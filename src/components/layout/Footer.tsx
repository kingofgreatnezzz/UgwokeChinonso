// ================================================================
// Artist Portfolio — Footer Component
// ================================================================

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowRight, Send, CheckCircle } from 'lucide-react';
import { SocialIcon } from './Header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Social Links (same as header) ───────────────────────────────
const socialLinks = [
  { href: 'https://instagram.com', label: 'Instagram', icon: 'INSTAGRAM' },
  { href: 'https://facebook.com', label: 'Facebook', icon: 'FACEBOOK' },
  { href: 'https://twitter.com', label: 'X / Twitter', icon: 'X' },
  { href: 'https://tiktok.com', label: 'TikTok', icon: 'TIKTOK' },
  { href: 'https://youtube.com', label: 'YouTube', icon: 'YOUTUBE' },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: 'LINKEDIN' },
  { href: 'https://pinterest.com', label: 'Pinterest', icon: 'PINTEREST' },
  { href: 'https://whatsapp.com', label: 'WhatsApp', icon: 'WHATSAPP' },
];

// ─── Quick Links ─────────────────────────────────────────────────
const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Me' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/shop', label: 'Shop Art' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
  { href: '/shipping', label: 'Shipping & Returns' },
];

const customerLinks = [
  { href: '/login', label: 'My Account' },
  { href: '/orders', label: 'Order Tracking' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
];

// ─── Payment Methods ─────────────────────────────────────────────
const paymentMethods = [
  { name: 'Visa', icon: 'VISA' },
  { name: 'Mastercard', icon: 'MASTERCARD' },
  { name: 'PayPal', icon: 'PAYPAL' },
  { name: 'Apple Pay', icon: 'APPLE_PAY' },
  { name: 'Google Pay', icon: 'GOOGLE_PAY' },
  { name: 'Bitcoin', icon: 'BITCOIN' },
  { name: 'Bank Transfer', icon: 'BANK' },
];

const PaymentIcon = ({ method }: { method: string }) => {
  const props = { className: 'h-6 w-6 sm:h-7 sm:w-7' };
  switch (method) {
    case 'VISA':
      return (
        <svg viewBox="0 0 24 24" fill="#1A1F71" {...props}>
          <path d="M9.508 15.602H7.124l1.76-8.098h2.384l-1.76 8.098zm-4.784-8.098l-2.212 5.555-.264-1.338-.792-2.598s-.132-.484-.616-.795H.264c-.088 0-.176.044-.264.044l-.044.044V9.37c.352.088.704.22 1.012.396l1.232 4.534h2.288l3.52-8.098H4.724zm15.488 3.344c0-1.322-.748-2.246-2.068-2.246h-.044c-.836 0-1.54.308-2.024.792l.132-.748h-2.112c-.176.088-.44.22-.44.572 0 .44.572.572.88.748.484.264.836.572.836 1.1v2.86c0 .308.044.616.044.924h-1.76c.044-.308.044-.616.044-.924v-.044l-1.716 1.848c-.484.528-.88.792-1.408.792-.352 0-.616-.264-.616-.704 0-.572.44-1.1 1.012-1.584l2.508-2.112c.704-.572 1.144-1.408 1.144-2.332 0-1.76-1.408-2.904-3.256-2.904-1.452 0-2.816.616-3.696 1.672l.308-1.496h3.872c1.144 0 1.848.748 1.848 1.848 0 .44-.132.88-.352 1.232l-.044.044c.44-.176.88-.352 1.408-.352 1.188 0 1.936.836 1.936 2.156v3.256h-1.936v3.52c0 .792.132 1.144.748 1.144.44 0 .748-.308 1.056-.792.44-.748.748-1.584.748-2.464.836.836 1.76 1.32 2.904 1.32 1.76 0 3.08-1.408 3.08-3.96zm2.112-2.2c-.308-.044-.572-.088-.88-.088-1.276 0-2.024.792-2.024 1.848 0 .836.528 1.276.924 1.672l.44.44c.44.44.836.88.836 1.496 0 .836-.792 1.584-1.848 1.584-.836 0-1.408-.308-1.76-.616l.044-.044c.264-.308.528-.792.528-1.232 0-.792-.572-1.276-1.188-1.276-.792 0-1.188.616-1.188 1.32 0 .704.396 1.276 1.188 1.76.836.484 2.024.792 3.168.792 2.112 0 3.608-1.144 3.608-2.904 0-1.144-.704-1.848-1.408-2.464l-.44-.396c-.352-.308-.616-.616-.616-1.1 0-.484.484-.924 1.232-.924.528 0 .88.176 1.144.352l.044-.044c-.044-.088-.044-.176-.044-.264.044-.264.044-.528.044-.792z" />
        </svg>
      );
    case 'MASTERCARD':
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <circle cx="8.5" cy="12" r="7" fill="#EB001B" />
          <circle cx="15.5" cy="12" r="7" fill="#F79E1B" />
        </svg>
      );
    case 'PAYPAL':
      return (
        <svg viewBox="0 0 24 24" fill="#003087" {...props}>
          <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
          <path d="M18.113 6.534c-.982 5.038-4.344 6.797-8.643 6.797h-2.19c-.524 0-.973.382-1.055.9l-1.125 7.106H.77l.088-.56H5.35c.524 0 .973-.382 1.055-.9l1.125-7.106c.082-.518.531-.9 1.055-.9h2.19c4.299 0 7.661-1.759 8.643-6.797.41-2.102.136-3.855-.752-5.06 1.28.96 1.888 2.833 1.447 5.32z" fill="#009CDE" />
        </svg>
      );
    case 'APPLE_PAY':
      return (
        <svg viewBox="0 0 24 24" fill="#000" {...props}>
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
      );
    case 'GOOGLE_PAY':
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      );
    case 'BITCOIN':
      return (
        <svg viewBox="0 0 24 24" fill="#F7931A" {...props}>
          <path d="M23.638 14.904c-1.602 6.428-8.113 10.34-14.542 8.737C2.67 22.04-1.244 15.53.36 9.102 1.962 2.67 8.473-1.244 14.902.36c6.428 1.603 10.34 8.113 8.736 14.544zm-4.522-4.003c.38-2.534-1.547-3.895-4.18-4.804l.854-3.426-2.086-.52-.832 3.336c-.548-.138-1.11-.267-1.67-.396l.838-3.36-2.085-.52-.855 3.426c-.453-.103-.898-.205-1.33-.313l.002-.01-2.877-.718-.555 2.226s1.547.355 1.514.377c.844.21.997.768.972 1.21l-.973 3.902c.058.015.134.037.218.07l-.22-.055-1.364 5.468c-.104.257-.366.642-.957.496.021.03-1.514-.378-1.514-.378l-1.035 2.386 2.717.677c.505.126 1 .258 1.485.382l-.862 3.465 2.085.52.855-3.43c.57.154 1.122.297 1.662.43l-.852 3.417 2.086.52.862-3.46c3.555.672 6.23.4 7.357-2.815.907-2.583-.045-4.073-1.918-5.046 1.364-.315 2.392-1.214 2.667-3.072z" />
        </svg>
      );
    case 'BANK':
      return (
        <svg viewBox="0 0 24 24" fill="#555" {...props}>
          <path d="M4 10h3v7H4zm6.5 0h3v7h-3zM17 10h3v7h-3zM2 19h20v3H2zM12 2L1 8v2h22V8z" />
        </svg>
      );
    default:
      return <div className="h-6 w-6 rounded bg-stone-200" />;
  }
};

// ─── Newsletter Form ─────────────────────────────────────────────
function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      // Simulate API call; replace with actual subscribe function later
      await new Promise((r) => setTimeout(r, 800));
      setSubscribed(true);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600">
        <CheckCircle className="h-4 w-4" />
        <span>Thanks for subscribing!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          className="h-10 w-full rounded-lg border border-stone-300 bg-white/60 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
        />
      </div>
      <Button type="submit" variant="primary" size="sm" loading={loading}>
        <Send className="h-3.5 w-3.5" />
      </Button>
    </form>
  );
}

// ─── Footer Component ────────────────────────────────────────────

function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200/70 bg-stone-50">
      {/* ── Main Footer ──────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand / About — spans 4 cols */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-3">
              <span className="font-serif text-2xl font-bold text-stone-900">
                Atelier <span className="text-amber-700">A.</span>
              </span>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed max-w-xs">
              Curating timeless art that transforms spaces. Each piece is a conversation — crafted with passion, made to inspire.
            </p>

            {/* Contact Info */}
            <div className="mt-5 space-y-2.5">
              <a
                href="mailto:hello@atelierartist.com"
                className="flex items-center gap-2 text-sm text-stone-500 hover:text-amber-700 transition-colors"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                hello@atelierartist.com
              </a>
              <a
                href="tel:+2348000000000"
                className="flex items-center gap-2 text-sm text-stone-500 hover:text-amber-700 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />
                +234 800 000 0000
              </a>
              <span className="flex items-center gap-2 text-sm text-stone-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                Lagos, Nigeria
              </span>
            </div>

            {/* Social Icons */}
            <div className="mt-5 flex items-center gap-1 flex-wrap">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                  aria-label={s.label}
                >
                  <SocialIcon platform={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links — spans 2 cols */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-500 hover:text-amber-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service — spans 2 cols */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900 mb-4">
              Customer Service
            </h3>
            <ul className="space-y-2.5">
              {customerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-500 hover:text-amber-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter — spans 4 cols */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900 mb-2">
              Stay Inspired
            </h3>
            <p className="text-sm text-stone-500 mb-4">
              Get early access to new collections, studio updates, and exclusive offers.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ───────────────────────────────────── */}
      <div className="border-t border-stone-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone-400">
              &copy; {new Date().getFullYear()} Atelier A. All rights reserved.
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 mr-1">
                We Accept
              </span>
              {paymentMethods.map((pm) => (
                <span key={pm.name} className="opacity-60 hover:opacity-100 transition-opacity" title={pm.name}>
                  <PaymentIcon method={pm.icon} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
