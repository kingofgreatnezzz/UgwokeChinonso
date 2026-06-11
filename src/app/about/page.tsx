// ================================================================
// Artist Portfolio — About Page
// ================================================================

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Calendar,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Palette,
  GraduationCap,
  Heart,
} from 'lucide-react';
import { contentApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/loading';

// ─── Animation Variants ───────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// ─── Data ─────────────────────────────────────────────────────────

const EXHIBITIONS = [
  { year: '2025', title: 'Ethereal Horizons', venue: 'Lux Art Gallery, Lagos', type: 'Solo Exhibition' },
  { year: '2024', title: 'African Renaissance', venue: 'National Museum, Abuja', type: 'Group Exhibition' },
  { year: '2024', title: 'Contemporary Voices', venue: 'Gallery of Modern Art, Nairobi', type: 'Group Exhibition' },
  { year: '2023', title: 'Colors of Heritage', venue: 'DOX Centre, Prague', type: 'Solo Exhibition' },
  { year: '2023', title: 'Global Art Expo', venue: 'Convention Center, Dubai', type: 'Art Fair' },
  { year: '2022', title: 'New Perspectives', venue: 'Studio 53, London', type: 'Solo Exhibition' },
  { year: '2022', title: 'Art Basel Cities', venue: 'Miami Beach Convention Center', type: 'Art Fair' },
  { year: '2021', title: 'Emerging Talents', venue: 'Yemisi Shyllon Museum, Lagos', type: 'Group Exhibition' },
];

const AWARDS = [
  { year: '2024', title: 'Artist of the Year', organization: 'African Art Awards' },
  { year: '2023', title: 'Best Emerging Artist', organization: 'Lagos Art Fair' },
  { year: '2022', title: 'Golden Brush Award', organization: 'International Art Council' },
  { year: '2021', title: 'Creative Excellence Prize', organization: 'Pan-African Art Foundation' },
];

const TIMELINE_EVENTS = [
  {
    year: '2015',
    title: 'Artistic Awakening',
    description: 'Began formal art education at the University of Lagos, studying Fine Arts with distinction.',
  },
  {
    year: '2017',
    title: 'First Exhibition',
    description: 'Participated in the annual student exhibition, selling first piece to a private collector.',
  },
  {
    year: '2019',
    title: 'Graduation & Mentorship',
    description: 'Graduated with honors. Began apprenticeship under renowned painter Alhaji Suleiman.',
  },
  {
    year: '2020',
    title: 'Studio Launch',
    description: 'Established personal studio in Lagos. Started receiving commission requests from international clients.',
  },
  {
    year: '2021',
    title: 'First Sold-Out Show',
    description: 'First solo exhibition sold out within the opening week. Featured in major art publications.',
  },
  {
    year: '2023',
    title: 'International Recognition',
    description: 'Exhibited in Europe and Middle East. Received Artist of the Year nomination.',
  },
  {
    year: '2025',
    title: 'Global Expansion',
    description: 'Launched online gallery. Now shipping original works to collectors in 15+ countries.',
  },
];

// ─── About Page ───────────────────────────────────────────────────

export default function AboutPage() {
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await contentApi.getPageContent('about');
        setContent(data);
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) return <PageLoader text="Loading about page..." />;

  return (
    <div className="flex flex-col">
      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=85"
            alt="Artist in studio"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/50 via-stone-900/70 to-stone-900/85" />
        </div>

        <div className="relative z-10 section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="border-amber-400/30 text-amber-300 bg-amber-500/10 backdrop-blur-sm mb-5 px-4 py-1.5">
              <Heart className="h-3 w-3 mr-1.5" />
              About the Artist
            </Badge>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight">
              Ugwoke <span className="text-gradient bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">Chinonso</span>
            </h1>
            <p className="mt-4 text-xl text-stone-300 max-w-xl mx-auto">
              Fine Artist &bull; Creative Visionary &bull; Storyteller
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Biography Section ────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
              className="relative"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-elevated">
                <Image
                  src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=700&q=85"
                  alt="Ugwokechinonso — portrait"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Decorative frame */}
              <div className="absolute -top-4 -right-4 w-full h-full border-2 border-amber-500/10 rounded-2xl -z-10" />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
            >
              <Badge variant="primary" className="mb-4">Biography</Badge>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-6">
                The Artist&apos;s Journey
              </h2>
              <div className="space-y-4 text-stone-600 leading-relaxed">
                <p>
                  Ugwokechinonso is a Lagos-based fine artist whose work bridges the gap between traditional African artistry
                  and contemporary global aesthetics. With over a decade of creative exploration, Ugwoke has developed a
                  distinctive style characterized by bold color palettes, emotive compositions, and a deep reverence for texture and form.
                </p>
                <p>
                  Born in 1993 in Ibadan, Nigeria, Ugwoke discovered her passion for art at a young age, sketching scenes from
                  daily life on any surface she could find. She went on to earn a Bachelor of Fine Arts from the University of Lagos,
                  where she graduated with honors and was awarded the Vice Chancellor&apos;s Prize for Creative Excellence.
                </p>
                <p>
                  Today, Ugwoke&apos;s work is held in private collections across Africa, Europe, North America, and the Middle East.
                  Her pieces have been exhibited at prestigious venues including the National Museum of Nigeria, the DOX Centre
                  in Prague, and the Yemisi Shyllon Museum. She is represented by select galleries worldwide and
                  continues to push the boundaries of her craft from her studio in Lagos.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Artist Statement ─────────────────────────────── */}
      <section className="section-padding bg-stone-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-amber-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-amber-50 rounded-full blur-3xl opacity-30" />

        <div className="section-container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            <Palette className="h-8 w-8 text-amber-500 mx-auto mb-4" />
            <Badge variant="primary" className="mb-4">Artist Statement</Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-8">
              My Creative Philosophy
            </h2>
            <div className="relative">
              <div className="absolute -top-4 -left-4 text-6xl text-amber-500/20 font-serif leading-none">"</div>
              <blockquote className="font-serif text-xl sm:text-2xl text-stone-700 leading-relaxed italic px-8">
                Art, for me, is not merely about creating beautiful objects — it is about capturing the intangible.
                Every brushstroke carries a memory, every color choice an emotion. I paint what cannot be spoken,
                giving form to the feelings that connect us all across cultures and borders.
              </blockquote>
              <div className="absolute -bottom-8 -right-4 text-6xl text-amber-500/20 font-serif leading-none rotate-180">&quot;</div>
            </div>
            <p className="mt-8 text-stone-500 max-w-2xl mx-auto">
              My work draws from the rich tapestry of African heritage while embracing a universal language of
              artistic expression. I believe that art should challenge, comfort, and transform — all at once.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <Badge variant="primary" className="mb-3">Journey</Badge>
            <h2 className="section-title">Artistic Timeline</h2>
            <p className="section-subtitle mx-auto">The milestones that have shaped my creative path</p>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-400 via-amber-500 to-amber-400/20 transform md:-translate-x-px" />

            {TIMELINE_EVENTS.map((event, index) => (
              <motion.div
                key={event.year}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeInUp}
                className="relative pl-12 md:pl-0 pb-12 last:pb-0"
              >
                <div className={`md:flex items-start gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Year badge - always on left or center */}
                  <div className="hidden md:flex md:w-1/2 justify-end md:pr-8">
                    {index % 2 === 0 && (
                      <div className="text-right">
                        <span className="font-serif text-2xl font-bold text-amber-600">{event.year}</span>
                      </div>
                    )}
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-4 md:left-1/2 top-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-md transform -translate-x-1/2" />

                  {/* Content */}
                  <div className="md:w-1/2">
                    {/* Mobile year */}
                    <span className="md:hidden font-serif text-sm font-bold text-amber-600 mb-1 block">{event.year}</span>
                    <div className="bg-stone-50 rounded-xl p-5 shadow-sm border border-stone-100 hover:shadow-card transition-shadow duration-300">
                      <h3 className="font-serif text-lg font-semibold text-stone-900">{event.title}</h3>
                      <p className="text-sm text-stone-500 mt-1.5">{event.description}</p>
                    </div>
                  </div>

                  {/* Right side year for odd index */}
                  <div className="hidden md:flex md:w-1/2 justify-start md:pl-8">
                    {index % 2 !== 0 && (
                      <div className="text-left">
                        <span className="font-serif text-2xl font-bold text-amber-600">{event.year}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Exhibitions Section ──────────────────────────── */}
      <section className="section-padding bg-stone-50">
        <div className="section-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <Badge variant="primary" className="mb-3">Exhibitions</Badge>
            <h2 className="section-title">Exhibitions & Shows</h2>
            <p className="section-subtitle mx-auto">From local galleries to international art fairs</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto space-y-4"
          >
            {EXHIBITIONS.map((exhibition, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group flex items-center gap-4 bg-white rounded-xl p-5 shadow-sm border border-stone-100 hover:shadow-card hover:border-amber-100 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-16 text-center">
                  <Calendar className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                  <span className="font-serif text-sm font-bold text-stone-900">{exhibition.year}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-stone-900 group-hover:text-amber-700 transition-colors">
                    {exhibition.title}
                  </h3>
                  <p className="text-sm text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {exhibition.venue}
                  </p>
                </div>
                <Badge variant="outline" size="sm" className="flex-shrink-0">
                  {exhibition.type}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Awards Grid ─────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <Badge variant="primary" className="mb-3">Recognition</Badge>
            <h2 className="section-title">Awards & Honors</h2>
            <p className="section-subtitle mx-auto">Celebrating creative excellence and artistic achievement</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {AWARDS.map((award, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative group bg-stone-50 rounded-2xl p-6 text-center border border-stone-100 hover:bg-amber-50 hover:border-amber-200 transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <Award className="h-7 w-7 text-amber-600" />
                </div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">{award.year}</p>
                <h3 className="font-serif text-base font-semibold text-stone-900">{award.title}</h3>
                <p className="text-xs text-stone-500 mt-1">{award.organization}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Education & Skills ───────────────────────────── */}
      <section className="section-padding bg-stone-50">
        <div className="section-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <Badge variant="primary" className="mb-3">Education</Badge>
            <h2 className="section-title">Training & Expertise</h2>
            <p className="section-subtitle mx-auto">Formal education and specialized techniques</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: <GraduationCap className="h-6 w-6" />,
                title: 'BFA in Fine Arts',
                subtitle: 'University of Lagos, 2019',
                description: 'Graduated with honors. Specialized in oil painting and mixed-media techniques.',
              },
              {
                icon: <Palette className="h-6 w-6" />,
                title: 'Master Study',
                subtitle: 'Apprenticeship, 2019-2020',
                description: 'Studied under master painter Alhaji Suleiman, focusing on classical composition and color theory.',
              },
              {
                icon: <Award className="h-6 w-6" />,
                title: 'Continuing Education',
                subtitle: 'International Workshops',
                description: 'Regular workshops in Berlin, Florence, and Dakar exploring contemporary art practices.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 shadow-sm border border-stone-100"
              >
                <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
                  {item.icon}
                </div>
                <h3 className="font-serif text-lg font-semibold text-stone-900">{item.title}</h3>
                <p className="text-xs text-amber-600 font-medium mt-0.5 mb-2">{item.subtitle}</p>
                <p className="text-sm text-stone-500">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact CTA ──────────────────────────────────── */}
      <section className="relative py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-700 via-stone-800 to-stone-900" />
        <div className="absolute inset-0 opacity-5">
          <Image
            src="https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1920&q=80"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>

        <div className="relative z-10 section-container text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="max-w-2xl mx-auto"
          >
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">
              Let&apos;s Create Together
            </h2>
            <p className="text-amber-100/80 text-lg mb-8 max-w-lg mx-auto">
              Whether you&apos;re interested in commissioning a custom piece, inquiring about available works, or collaborating on a project — I&apos;d love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="primary" className="bg-white text-stone-900 hover:bg-amber-50 gap-2 shadow-lg">
                  <Mail className="h-5 w-5" />
                  Get in Touch
                </Button>
              </Link>
              <Link href="/shop">
                <Button size="lg" variant="outline" className="border-amber-400/40 text-amber-200 hover:bg-amber-500/10 hover:text-amber-100 gap-2">
                  Browse Gallery
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
