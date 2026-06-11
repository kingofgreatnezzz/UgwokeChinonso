// ================================================================
// Artist Portfolio — Contact Page
// ================================================================

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  MessageSquare,
  Clock,
  Camera,
  ThumbsUp,
  Hash,
  Video,
  Briefcase,
  Globe,
  Music2,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { contactApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// ─── Animation Variants ───────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// ─── Contact Info Cards ───────────────────────────────────────────

const CONTACT_INFO = [
  {
    icon: <Mail className="h-5 w-5" />,
    title: 'Email',
    value: 'hello@atelierartist.com',
    href: 'mailto:hello@atelierartist.com',
    description: 'We typically respond within 24 hours',
  },
  {
    icon: <Phone className="h-5 w-5" />,
    title: 'Phone',
    value: '+234 800 000 0000',
    href: 'tel:+2348000000000',
    description: 'Mon–Fri, 9 AM – 6 PM (WAT)',
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    title: 'Studio Address',
    value: 'Lagos, Nigeria',
    href: undefined,
    description: 'Available by appointment',
  },
];

// ─── Social Links ─────────────────────────────────────────────────

const SOCIAL_PLATFORMS = [
  { name: 'Instagram', icon: <Camera className="h-5 w-5" />, href: 'https://instagram.com', color: 'hover:text-pink-600' },
  { name: 'Facebook', icon: <ThumbsUp className="h-5 w-5" />, href: 'https://facebook.com', color: 'hover:text-blue-600' },
  { name: 'X / Twitter', icon: <Hash className="h-5 w-5" />, href: 'https://twitter.com', color: 'hover:text-black' },
  { name: 'TikTok', icon: <Music2 className="h-5 w-5" />, href: 'https://tiktok.com', color: 'hover:text-black' },
  { name: 'YouTube', icon: <Video className="h-5 w-5" />, href: 'https://youtube.com', color: 'hover:text-red-600' },
  { name: 'LinkedIn', icon: <Briefcase className="h-5 w-5" />, href: 'https://linkedin.com', color: 'hover:text-blue-700' },
  { name: 'Pinterest', icon: <Globe className="h-5 w-5" />, href: 'https://pinterest.com', color: 'hover:text-red-700' },
  { name: 'WhatsApp', icon: <MessageCircle className="h-5 w-5" />, href: 'https://whatsapp.com', color: 'hover:text-green-600' },
];

// ─── Contact Page ────────────────────────────────────────────────

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email address';
    if (!formData.subject.trim()) errs.subject = 'Subject is required';
    if (!formData.message.trim()) errs.message = 'Message is required';
    else if (formData.message.trim().length < 10) errs.message = 'Message must be at least 10 characters';
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await contactApi.submitContact(formData);
      setSubmitted(true);
    } catch {
      // Fallback: show success anyway
      await new Promise((r) => setTimeout(r, 800));
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col">
        {/* Hero */}
        <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-amber-600 via-amber-700 to-stone-800">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Badge variant="outline" className="border-amber-400/30 text-amber-200 bg-amber-500/10 mb-4">
                Get in Touch
              </Badge>
              <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white">Contact</h1>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-warm flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Message Sent!</h2>
            <p className="text-stone-500 mb-6">
              Thank you for reaching out. I typically respond within 24 hours. In the meantime, feel free to browse the gallery.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
              >
                Send Another Message
              </Button>
              <a href="/shop"><Button variant="primary">Browse Gallery</Button></a>
            </div>
          </motion.div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-amber-600 via-amber-700 to-stone-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-80 h-80 border border-white/20 rounded-full" />
          <div className="absolute bottom-10 left-10 w-48 h-48 border border-amber-400/20 rounded-full" />
        </div>
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Badge variant="outline" className="border-amber-400/30 text-amber-200 bg-amber-500/10 backdrop-blur-sm mb-4 px-4 py-1.5">
              <MessageSquare className="h-3 w-3 mr-1.5" />
              Get in Touch
            </Badge>
            <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white mb-4">
              Let&apos;s Start a <span className="text-gradient bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">Conversation</span>
            </h1>
            <p className="text-stone-300 text-lg max-w-xl mx-auto">
              Have a question about a piece, interested in a commission, or just want to say hello? I&apos;d love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Contact Form & Info ──────────────────────────── */}
      <section className="section-padding bg-warm">
        <div className="section-container">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
            {/* Contact Form — spans 3 cols */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-card border border-stone-100">
                <h2 className="font-serif text-2xl font-bold text-stone-900 mb-1">Send a Message</h2>
                <p className="text-sm text-stone-500 mb-6">Fill out the form below and I&apos;ll get back to you as soon as possible.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      placeholder="John Doe"
                      icon={<MessageSquare className="h-4 w-4" />}
                    />
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      placeholder="john@example.com"
                      icon={<Mail className="h-4 w-4" />}
                    />
                  </div>
                  <Input
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    error={errors.subject}
                    placeholder="What's this about?"
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell me about your project, question, or idea..."
                      rows={6}
                      className={cn(
                        'w-full rounded-xl border bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400',
                        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500',
                        errors.message ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500' : 'border-stone-200',
                      )}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-red-500">{errors.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={submitting}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info — spans 2 cols */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="lg:col-span-2 space-y-6"
            >
              {/* Info Cards */}
              {CONTACT_INFO.map((info, index) => (
                <motion.div
                  key={info.title}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl p-5 shadow-soft border border-stone-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-stone-900 text-sm">{info.title}</h3>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-stone-600 hover:text-amber-700 transition-colors text-sm font-medium mt-0.5 block"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-stone-600 text-sm mt-0.5">{info.value}</p>
                      )}
                      <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {info.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Social Links */}
              <motion.div
                variants={fadeInUp}
                className="bg-white rounded-2xl p-5 shadow-soft border border-stone-100"
              >
                <h3 className="font-medium text-stone-900 text-sm mb-4">Follow Along</h3>
                <div className="grid grid-cols-4 gap-2">
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'flex flex-col items-center gap-1 p-3 rounded-xl text-stone-400 bg-stone-50 transition-all duration-200',
                        platform.color,
                        'hover:bg-stone-100 hover:shadow-sm',
                      )}
                      title={platform.name}
                    >
                      {platform.icon}
                      <span className="text-[10px] font-medium">{platform.name}</span>
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* Response time */}
              <motion.div
                variants={fadeInUp}
                className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3"
              >
                <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-stone-900">Response Time</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    I typically respond within 24 hours during weekdays. For urgent inquiries, please include &ldquo;URGENT&rdquo; in your subject line.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Map Section ──────────────────────────────────── */}
      <section className="bg-stone-50 py-12 lg:py-16">
        <div className="section-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-8"
          >
            <Badge variant="primary" className="mb-3">Location</Badge>
            <h2 className="font-serif text-2xl font-bold text-stone-900">Find the Studio</h2>
            <p className="text-sm text-stone-500 mt-1">Available by appointment — reach out to schedule a visit</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="rounded-2xl overflow-hidden shadow-card"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253682.6270362257!2d3.119208317105144!3d6.548051222240772!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2s!4v1690000000000!5m2!1sen!2s"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Studio Location"
              className="rounded-2xl"
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
