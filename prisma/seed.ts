// ================================================================
// Seed script — create admin user + initial data
// Run: npx tsx prisma/seed.ts
// ================================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from '../src/lib/api-utils/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Create admin user
  const existingAdmin = await prisma.user.findUnique({
    where: { email: config.ADMIN_EMAIL },
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(config.ADMIN_PASSWORD, salt);

    await prisma.user.create({
      data: {
        name: config.ADMIN_NAME,
        email: config.ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log(`✅ Admin user created: ${config.ADMIN_EMAIL} / ${config.ADMIN_PASSWORD}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${config.ADMIN_EMAIL}`);
  }

  // Seed site settings
  const existingSettings = await prisma.siteSetting.findMany();
  if (existingSettings.length === 0) {
    await prisma.siteSetting.createMany({
      data: [
        {
          key: 'payment_settings',
          value: {
            paystackPublicKey: '',
            bankName: '',
            bankAccountName: '',
            bankAccountNumber: '',
            cryptoBTC: '',
            cryptoETH: '',
            cryptoUSDT_TRC20: '',
            cryptoUSDT_ERC20: '',
          },
        },
        {
          key: 'social_links',
          value: {
            instagram: 'https://instagram.com/artist',
            facebook: 'https://facebook.com/artist',
            twitter: 'https://x.com/artist',
            tiktok: 'https://tiktok.com/@artist',
            youtube: 'https://youtube.com/@artist',
            linkedin: 'https://linkedin.com/in/artist',
            pinterest: 'https://pinterest.com/artist',
            whatsapp: 'https://wa.me/1234567890',
          },
        },
        {
          key: 'storage_settings',
          value: {
            provider: 'local',
            cloudinaryCloudName: '',
            r2BucketName: '',
          },
        },
      ],
    });
    console.log('✅ Site settings seeded.');
  } else {
    console.log('ℹ️  Site settings already exist.');
  }

  // Seed page content
  const existingPages = await prisma.pageContent.findMany();
  if (existingPages.length === 0) {
    await prisma.pageContent.createMany({
      data: [
        {
          page: 'home',
          content: {
            heroTitle: 'Where Art Speaks',
            heroSubtitle: 'Discover Original Artworks by Exceptional Artists',
            heroCta1: 'Explore Gallery',
            heroCta1Link: '/shop',
            heroCta2: 'About the Artist',
            heroCta2Link: '/about',
            heroImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600',
            featuredTitle: 'Featured Artworks',
            featuredSubtitle: 'Curated pieces that define our collection',
          },
        },
        {
          page: 'about',
          content: {
            artistName: 'Artist Name',
            artistPhoto: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
            biography: 'Full biography text here...',
            statement: 'Artist statement here...',
            experience: [],
            awards: [],
            exhibitions: [],
          },
        },
        {
          page: 'contact',
          content: {
            email: 'hello@artistportfol.io',
            phone: '+1 (555) 123-4567',
            address: '123 Art Studio Lane, Creative District, NY 10001',
            mapEmbedUrl: '',
          },
        },
      ],
    });
    console.log('✅ Page content seeded.');
  } else {
    console.log('ℹ️  Page content already exists.');
  }

  // Seed testimonials
  const existingTestimonials = await prisma.testimonial.findMany();
  if (existingTestimonials.length === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          name: 'Sarah Johnson',
          role: 'Art Collector',
          content:
            'Absolutely stunning pieces. The quality and attention to detail in every artwork is remarkable. My new painting is the centerpiece of my living room.',
          rating: 5,
          featured: true,
        },
        {
          name: 'Michael Chen',
          role: 'Gallery Owner',
          content:
            'One of the most talented artists I have had the pleasure of working with. Their unique perspective and mastery of technique is truly exceptional.',
          rating: 5,
          featured: true,
        },
        {
          name: 'Emma Williams',
          role: 'Interior Designer',
          content:
            'I have purchased multiple pieces for my clients and each one has been met with overwhelming praise.',
          rating: 5,
          featured: true,
        },
        {
          name: 'David Thompson',
          role: 'First-time Buyer',
          content:
            'The entire experience was seamless from browsing to delivery. The artwork exceeded my expectations.',
          rating: 5,
          featured: false,
        },
      ],
    });
    console.log('✅ Testimonials seeded.');
  } else {
    console.log('ℹ️  Testimonials already exist.');
  }

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
