import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import './globals.css';

// ─── Fonts ───────────────────────────────────────────────────────

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

// ─── Metadata ────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'Atelier A. — Fine Art Gallery & Store',
    template: '%s | Atelier A.',
  },
  description:
    'Discover curated fine art from emerging and established artists. Shop original paintings, prints, sculptures, and more at Atelier A.',
  keywords: [
    'art gallery',
    'fine art',
    'original paintings',
    'art prints',
    'sculpture',
    'art for sale',
    'artist portfolio',
    'contemporary art',
  ],
  authors: [{ name: 'Atelier A.' }],
  creator: 'Atelier A.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Atelier A.',
    title: 'Atelier A. — Fine Art Gallery & Store',
    description:
      'Discover curated fine art from emerging and established artists.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atelier A. — Fine Art Gallery & Store',
    description:
      'Discover curated fine art from emerging and established artists.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ─── Root Layout ─────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-warm font-sans text-charcoal selection:bg-amber-200/40 selection:text-charcoal">
        <Layout>
          {children}
        </Layout>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1c1917',
              borderRadius: '12px',
              boxShadow:
                '0 4px 16px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
              fontSize: '14px',
              border: '1px solid rgba(231, 229, 228, 0.8)',
            },
            success: {
              iconTheme: {
                primary: '#d97706',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
