'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import * as Tabs from '@radix-ui/react-tabs';
import { contentApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/loading';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
} from '@/components/ui/modal';
import {
  Save,
  Home,
  Info,
  Mail,
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  Star,
} from 'lucide-react';
import type { Testimonial } from '@/types';

// ─── Homepage Schema ───────────────────────────────────────────
const homepageSchema = z.object({
  heroTitle: z.string().min(1, 'Required'),
  heroSubtitle: z.string().optional(),
  ctaText: z.string().optional(),
  featuredSectionTitle: z.string().optional(),
  featuredSectionDescription: z.string().optional(),
});
type HomepageData = z.infer<typeof homepageSchema>;

// ─── About Schema ──────────────────────────────────────────────
const aboutSchema = z.object({
  artistName: z.string().min(1, 'Required'),
  biography: z.string().optional(),
  artistStatement: z.string().optional(),
  timeline: z.string().optional(),
  exhibitions: z.string().optional(),
  awards: z.string().optional(),
});
type AboutData = z.infer<typeof aboutSchema>;

// ─── Contact Schema ────────────────────────────────────────────
const contactSchema = z.object({
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  mapsEmbedUrl: z.string().optional(),
});
type ContactData = z.infer<typeof contactSchema>;

// ─── Testimonial Form ──────────────────────────────────────────
const testimonialFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  role: z.string().optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  rating: z.number({ message: 'Rating must be a number' }).min(1).max(5).optional(),
});
type TestimonialFormData = z.infer<typeof testimonialFormSchema>;

// ─── Site Settings Schema ──────────────────────────────────────
const siteSettingsSchema = z.object({
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  btcAddress: z.string().optional(),
  ethAddress: z.string().optional(),
  usdtTrc20: z.string().optional(),
  usdtErc20: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
  linkedin: z.string().optional(),
  pinterest: z.string().optional(),
  whatsapp: z.string().optional(),
});
type SiteSettingsData = z.infer<typeof siteSettingsSchema>;

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState('homepage');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testimonialSaving, setTestimonialSaving] = useState(false);

  // ─── Homepage ───────────────────────────────────────────────
  const homepageForm = useForm<HomepageData>({ resolver: zodResolver(homepageSchema) });

  // ─── About ──────────────────────────────────────────────────
  const aboutForm = useForm<AboutData>({ resolver: zodResolver(aboutSchema) });

  // ─── Contact ────────────────────────────────────────────────
  const contactForm = useForm<ContactData>({ resolver: zodResolver(contactSchema) });

  // ─── Site Settings ──────────────────────────────────────────
  const siteSettingsForm = useForm<SiteSettingsData>({ resolver: zodResolver(siteSettingsSchema) });

  // ─── Testimonial ────────────────────────────────────────────
  const testimonialForm = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: { name: '', role: '', content: '', rating: 5 },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [homepage, about, contact, siteSettings] = await Promise.all([
          contentApi.getPageContent('homepage').catch(() => ({})),
          contentApi.getPageContent('about').catch(() => ({})),
          contentApi.getPageContent('contact').catch(() => ({})),
          contentApi.getPageContent('settings').catch(() => ({})),
        ]);

        if (Object.keys(homepage).length > 0) {
          homepageForm.reset(homepage as HomepageData);
        }
        if (Object.keys(about).length > 0) {
          aboutForm.reset(about as AboutData);
        }
        if (Object.keys(contact).length > 0) {
          contactForm.reset(contact as ContactData);
        }
        if (Object.keys(siteSettings).length > 0) {
          siteSettingsForm.reset(siteSettings as SiteSettingsData);
        }
      } catch {
        // Use defaults
      }

      try {
        const testimonialsData = await contentApi.getTestimonials();
        setTestimonials(testimonialsData);
      } catch {
        // No testimonials yet
      }

      setLoading(false);
    };
    loadData();
  }, []);

  const saveSection = async (section: string, data: Record<string, unknown>) => {
    setSaving(section);
    try {
      await contentApi.updatePageContent(section, data);
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully`);
    } catch {
      toast.error(`Failed to update ${section}`);
    } finally {
      setSaving(null);
    }
  };

  const handleAddTestimonial = async (data: TestimonialFormData) => {
    setTestimonialSaving(true);
    try {
      const newTestimonial = await contentApi.createTestimonial(
        data as unknown as Omit<Testimonial, 'id'>,
      );
      setTestimonials((prev) => [...prev, newTestimonial]);
      toast.success('Testimonial added');
      setShowTestimonialModal(false);
      testimonialForm.reset({ name: '', role: '', content: '', rating: 5 });
    } catch {
      toast.error('Failed to add testimonial');
    } finally {
      setTestimonialSaving(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    try {
      await contentApi.deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      toast.success('Testimonial deleted');
    } catch {
      toast.error('Failed to delete testimonial');
    }
  };

  if (loading) return <PageLoader text="Loading content…" />;

  const tabClass = (value: string) =>
    `flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
      activeTab === value
        ? 'bg-amber-50 text-amber-700 shadow-sm shadow-amber-500/10'
        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
    }`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">Content Management</h1>
        <p className="mt-1 text-stone-500">Edit your portfolio content and site settings</p>
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Tab List */}
        <Tabs.List className="flex flex-wrap gap-2 rounded-xl border border-stone-200 bg-white p-2 shadow-sm">
          <Tabs.Trigger value="homepage" className={tabClass('homepage')}>
            <Home className="h-4 w-4" /> Homepage
          </Tabs.Trigger>
          <Tabs.Trigger value="about" className={tabClass('about')}>
            <Info className="h-4 w-4" /> About
          </Tabs.Trigger>
          <Tabs.Trigger value="contact" className={tabClass('contact')}>
            <Mail className="h-4 w-4" /> Contact
          </Tabs.Trigger>
          <Tabs.Trigger value="testimonials" className={tabClass('testimonials')}>
            <MessageSquare className="h-4 w-4" /> Testimonials
          </Tabs.Trigger>
          <Tabs.Trigger value="settings" className={tabClass('settings')}>
            <Settings className="h-4 w-4" /> Site Settings
          </Tabs.Trigger>
        </Tabs.List>

        {/* ─── HOMEPAGE ─────────────────────────────────────────── */}
        <Tabs.Content value="homepage">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Content</CardTitle>
              <CardDescription>Edit hero section and featured section settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={homepageForm.handleSubmit((data) =>
                  saveSection('homepage', data as unknown as Record<string, unknown>),
                )}
                className="space-y-5"
              >
                <Input
                  label="Hero Title"
                  placeholder="Discover Extraordinary Art"
                  error={homepageForm.formState.errors.heroTitle?.message}
                  {...homepageForm.register('heroTitle')}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Hero Subtitle
                  </label>
                  <textarea
                    {...homepageForm.register('heroSubtitle')}
                    rows={3}
                    placeholder="Brief description under the hero title…"
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                <Input
                  label="CTA Button Text"
                  placeholder="Explore Collection"
                  {...homepageForm.register('ctaText')}
                />
                <Input
                  label="Featured Section Title"
                  placeholder="Featured Works"
                  {...homepageForm.register('featuredSectionTitle')}
                />
                <Input
                  label="Featured Section Description"
                  placeholder="Curated selection of our finest pieces"
                  {...homepageForm.register('featuredSectionDescription')}
                />
                <Button
                  type="submit"
                  loading={saving === 'homepage'}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Homepage
                </Button>
              </form>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* ─── ABOUT ────────────────────────────────────────────── */}
        <Tabs.Content value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Page Content</CardTitle>
              <CardDescription>Edit your artist biography and statement</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={aboutForm.handleSubmit((data) =>
                  saveSection('about', data as unknown as Record<string, unknown>),
                )}
                className="space-y-5"
              >
                <Input
                  label="Artist Name"
                  placeholder="Your name"
                  error={aboutForm.formState.errors.artistName?.message}
                  {...aboutForm.register('artistName')}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Biography</label>
                  <textarea
                    {...aboutForm.register('biography')}
                    rows={6}
                    placeholder="Tell your story…"
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Artist Statement</label>
                  <textarea
                    {...aboutForm.register('artistStatement')}
                    rows={4}
                    placeholder="Your artistic philosophy…"
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Timeline (one event per line)
                  </label>
                  <textarea
                    {...aboutForm.register('timeline')}
                    rows={4}
                    placeholder="2024 — Solo Exhibition&#10;2023 — International Art Fair&#10;2022 — Residency Program"
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Exhibitions (one per line)
                  </label>
                  <textarea
                    {...aboutForm.register('exhibitions')}
                    rows={3}
                    placeholder="Gallery Name, City — 2024"
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Awards</label>
                  <textarea
                    {...aboutForm.register('awards')}
                    rows={3}
                    placeholder="Award Name — Year"
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                <Button
                  type="submit"
                  loading={saving === 'about'}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save About Page
                </Button>
              </form>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* ─── CONTACT ──────────────────────────────────────────── */}
        <Tabs.Content value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Page Content</CardTitle>
              <CardDescription>Edit contact information and map embed</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={contactForm.handleSubmit((data) =>
                  saveSection('contact', data as unknown as Record<string, unknown>),
                )}
                className="space-y-5"
              >
                <Input
                  label="Email"
                  type="email"
                  placeholder="artist@example.com"
                  {...contactForm.register('email')}
                />
                <Input
                  label="Phone"
                  placeholder="+234 800 000 0000"
                  {...contactForm.register('phone')}
                />
                <Input
                  label="Address"
                  placeholder="Studio address"
                  {...contactForm.register('address')}
                />
                <Input
                  label="Google Maps Embed URL"
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  {...contactForm.register('mapsEmbedUrl')}
                />
                <Button
                  type="submit"
                  loading={saving === 'contact'}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Contact Info
                </Button>
              </form>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* ─── TESTIMONIALS ─────────────────────────────────────── */}
        <Tabs.Content value="testimonials">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Testimonials</CardTitle>
                <CardDescription>Manage client reviews and testimonials</CardDescription>
              </div>
              <Button
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setShowTestimonialModal(true)}
              >
                Add Testimonial
              </Button>
            </CardHeader>
            <CardContent>
              {testimonials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <MessageSquare className="mb-3 h-12 w-12 text-stone-300" />
                  <p className="text-stone-500">No testimonials yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testimonials.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-start justify-between rounded-lg border border-stone-200 p-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-stone-900">{t.name}</p>
                          {t.role && (
                            <span className="text-xs text-stone-400">— {t.role}</span>
                          )}
                        </div>
                        {t.rating && (
                          <div className="mt-1 flex items-center gap-0.5">
                            {Array.from({ length: t.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        )}
                        <p className="mt-1 text-sm text-stone-600">{t.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteTestimonial(t.id)}
                        className="ml-4 rounded-md p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Testimonial Modal */}
          <Modal open={showTestimonialModal} onOpenChange={setShowTestimonialModal}>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Add Testimonial</ModalTitle>
                <ModalDescription>Add a new client testimonial</ModalDescription>
              </ModalHeader>
              <form
                onSubmit={testimonialForm.handleSubmit(handleAddTestimonial)}
                className="space-y-4 px-6 pb-6"
              >
                <Input
                  label="Name"
                  placeholder="Client name"
                  error={testimonialForm.formState.errors.name?.message}
                  {...testimonialForm.register('name')}
                />
                <Input
                  label="Role (optional)"
                  placeholder="e.g. Collector, Gallery Owner"
                  {...testimonialForm.register('role')}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Testimonial</label>
                  <textarea
                    {...testimonialForm.register('content')}
                    rows={4}
                    placeholder="What did they say?"
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  {testimonialForm.formState.errors.content && (
                    <p className="mt-1 text-xs text-red-500">
                      {testimonialForm.formState.errors.content.message}
                    </p>
                  )}
                </div>
                <Input
                  label="Rating (1-5)"
                  type="number"
                  min={1}
                  max={5}
                  {...testimonialForm.register('rating')}
                />
                <ModalFooter className="px-0 pb-0">
                  <ModalClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </ModalClose>
                  <Button type="submit" loading={testimonialSaving}>
                    Add Testimonial
                  </Button>
                </ModalFooter>
              </form>
            </ModalContent>
          </Modal>
        </Tabs.Content>

        {/* ─── SITE SETTINGS ────────────────────────────────────── */}
        <Tabs.Content value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>Payment details, social media links, and more</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={siteSettingsForm.handleSubmit((data) =>
                  saveSection('settings', data as unknown as Record<string, unknown>),
                )}
                className="space-y-8"
              >
                {/* Payment Settings */}
                <div>
                  <h3 className="mb-4 text-base font-semibold text-stone-800">Payment Settings</h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <Input
                      label="Bank Name"
                      placeholder="e.g. GTBank"
                      {...siteSettingsForm.register('bankName')}
                    />
                    <Input
                      label="Account Name"
                      placeholder="Business or personal name"
                      {...siteSettingsForm.register('accountName')}
                    />
                    <Input
                      label="Account Number"
                      placeholder="0123456789"
                      {...siteSettingsForm.register('accountNumber')}
                    />
                  </div>
                </div>

                {/* Crypto Addresses */}
                <div>
                  <h3 className="mb-4 text-base font-semibold text-stone-800">
                    Crypto Wallet Addresses
                  </h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Input
                      label="BTC Address"
                      placeholder="bc1..."
                      {...siteSettingsForm.register('btcAddress')}
                    />
                    <Input
                      label="ETH Address"
                      placeholder="0x..."
                      {...siteSettingsForm.register('ethAddress')}
                    />
                    <Input
                      label="USDT (TRC20)"
                      placeholder="T..."
                      {...siteSettingsForm.register('usdtTrc20')}
                    />
                    <Input
                      label="USDT (ERC20)"
                      placeholder="0x..."
                      {...siteSettingsForm.register('usdtErc20')}
                    />
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="mb-4 text-base font-semibold text-stone-800">Social Media Links</h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Input
                      label="Instagram"
                      placeholder="https://instagram.com/..."
                      {...siteSettingsForm.register('instagram')}
                    />
                    <Input
                      label="Facebook"
                      placeholder="https://facebook.com/..."
                      {...siteSettingsForm.register('facebook')}
                    />
                    <Input
                      label="Twitter / X"
                      placeholder="https://twitter.com/..."
                      {...siteSettingsForm.register('twitter')}
                    />
                    <Input
                      label="TikTok"
                      placeholder="https://tiktok.com/..."
                      {...siteSettingsForm.register('tiktok')}
                    />
                    <Input
                      label="YouTube"
                      placeholder="https://youtube.com/..."
                      {...siteSettingsForm.register('youtube')}
                    />
                    <Input
                      label="LinkedIn"
                      placeholder="https://linkedin.com/..."
                      {...siteSettingsForm.register('linkedin')}
                    />
                    <Input
                      label="Pinterest"
                      placeholder="https://pinterest.com/..."
                      {...siteSettingsForm.register('pinterest')}
                    />
                    <Input
                      label="WhatsApp"
                      placeholder="https://wa.me/..."
                      {...siteSettingsForm.register('whatsapp')}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={saving === 'settings'}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Site Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
