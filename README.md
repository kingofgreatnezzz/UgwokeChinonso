# 🎨 Artist Portfolio — Fine Art Gallery & Store

A full-featured artist portfolio and e-commerce platform built with **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS 4**, **PostgreSQL** (via Prisma ORM), and **framer-motion**.

> **Single project architecture** — no separate frontend/backend. The Next.js API routes handle everything from auth to orders to file uploads.

---

## ✨ Features

### 🖼️ Public Pages
| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, featured carousel, latest works, artist bio |
| `/gallery` → redirects to `/shop` | Browse and shop artworks (same as shop) |
| `/shop` | Full gallery with search, filters, sorting, pagination |
| `/artwork/[slug]` | Artwork detail page with images, reviews, and add-to-cart |
| `/collections/[slug]` | Browse artworks by collection |
| `/about` | Artist bio and background |
| `/contact` | Contact form for inquiries |
| `/cart` | Shopping cart with quantity controls |
| `/checkout` | Checkout with shipping form |

### 🔐 Auth Pages
| Route | Description |
|-------|-------------|
| `/auth/login` | User login |
| `/auth/register` | User registration |

### 👑 Admin Dashboard
| Route | Description |
|-------|-------------|
| `/admin` | Dashboard with stats, sales chart, recent orders |
| `/admin/artworks` | Manage all artworks |
| `/admin/artworks/new` | Add new artwork |
| `/admin/artworks/[id]/edit` | Edit artwork details & images |
| `/admin/orders` | View & manage orders |
| `/admin/content` | Manage page content, testimonials, site settings |
| `/admin/settings` | Payment, storage, and social link settings |

### 👤 User Dashboard
| Route | Description |
|-------|-------------|
| `/dashboard` | User overview |
| `/dashboard/orders` | Order history |
| `/dashboard/orders/[id]` | Order details |
| `/dashboard/wishlist` | Saved/wishlisted artworks |
| `/dashboard/profile` | Edit profile & password |

### 🛒 E-commerce
- **Shopping cart** — persistent via Zustand + localStorage
- **Checkout** — shipping form with order summary
- **Wishlist** — save artworks for later
- **Filtering & search** — by type, topic, price range, and keyword
- **Admin order management** — status tracking, payment verification

### 📡 API Routes
All API routes are served at `/api/*` (Next.js App Router):

| Endpoint | Methods | Auth |
|----------|---------|------|
| `/api/health` | GET | — |
| `/api/auth/login` | POST | — |
| `/api/auth/register` | POST | — |
| `/api/auth/me` | GET | ✅ JWT |
| `/api/artworks` | GET, POST | POST needs admin |
| `/api/artworks/featured` | GET | — |
| `/api/artworks/latest` | GET | — |
| `/api/artworks/[slug]` | GET, PATCH, DELETE | PATCH/DELETE needs admin |
| `/api/artworks/upload-images` | POST | ✅ Admin |
| `/api/orders` | GET, POST | ✅ JWT |
| `/api/orders/all` | GET | ✅ Admin |
| `/api/orders/[id]` | GET | ✅ Owner/Admin |
| `/api/orders/[id]/status` | PATCH | ✅ Admin |
| `/api/orders/[id]/payment` | PATCH | ✅ Admin |
| `/api/wishlist` | GET, POST, DELETE | ✅ JWT |
| `/api/collections` | GET, POST | POST needs admin |
| `/api/collections/[slug]` | GET, PATCH, DELETE | PATCH/DELETE needs admin |
| `/api/contact` | POST, GET | GET needs admin |
| `/api/contact/messages/[id]/read` | PATCH | ✅ Admin |
| `/api/content/page/[page]` | GET, PUT | PUT needs admin |
| `/api/content/settings` | GET | — |
| `/api/content/settings/[key]` | PUT | ✅ Admin |
| `/api/content/testimonials` | GET, POST | POST needs admin |
| `/api/content/testimonials/[id]` | DELETE | ✅ Admin |
| `/api/content/newsletter` | POST | — |
| `/api/reviews` | POST | ✅ JWT |
| `/api/reviews/artwork/[artworkId]` | GET | — |
| `/api/dashboard/stats` | GET | ✅ Admin |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** database (e.g., [Neon](https://neon.tech), local PostgreSQL, or Supabase)
- **npm** or **yarn**

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Set Up Environment Variables

Copy the `.env.example` or create a `.env` file in `frontend/`:

```env
# Database
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/artist-portfolio?sslmode=require"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"

# Admin credentials (used by seed script)
ADMIN_NAME="Admin"
ADMIN_EMAIL="admin@artistportfol.io"
ADMIN_PASSWORD="Admin@123"

# Optional: Cloudinary / R2 for image storage
# STORAGE_PROVIDER="local"  # local | cloudinary | r2
# CLOUDINARY_CLOUD_NAME=""
# CLOUDINARY_API_KEY=""
# CLOUDINARY_API_SECRET=""

# Optional: Paystack for payments
# PAYSTACK_SECRET_KEY=""
# PAYSTACK_PUBLIC_KEY=""
```

### 3. Set Up the Database

Push the schema to your PostgreSQL database:

```bash
npx prisma db push
```

### 4. Seed Initial Data

This creates the admin user, site settings, page content, and sample testimonials:

```bash
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** to see the site.

---

## 🔐 Default Admin Credentials

After running the seed script, log in at `/auth/login` with:

| Email | Password |
|-------|----------|
| `admin@artistportfol.io` | `Admin@123` |

Then access the admin dashboard at **http://localhost:3000/admin**

> **⚠️ Important:** Change these credentials in production!

---

## 🧪 Running Without a Database

The app works **even without a database** — every page has built-in mock data:

- **Home page** (`/`) — all sections use mock artworks, testimonials, and content
- **Gallery/Shop** (`/shop`) — 24 mock artworks with full filter/search/sort
- **Artwork detail** (`/artwork/mock-1`) — full detail page with images and reviews
- **Collections** — sample collections with artworks
- **About** — placeholder artist bio
- **Contact** — working contact form (requires DB for submission)

The app gracefully falls back to mock data when API calls fail (when there's no PostgreSQL connection).

To start purely in mock mode:

```bash
npm run dev
# The pages will show mock data automatically
```

---

## 📁 Project Structure

```
frontend/
├── prisma/
│   ├── schema.prisma          # Database schema (PostgreSQL)
│   ├── seed.ts                # Seed script (admin + initial data)
│   └── config.ts              # Prisma config
├── src/
│   ├── app/
│   │   ├── api/               # All API routes (auth, artworks, orders, etc.)
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── auth/              # Login & register pages
│   │   ├── dashboard/         # User dashboard pages
│   │   ├── shop/              # Shop/gallery page
│   │   ├── artwork/[slug]/    # Artwork detail page
│   │   ├── collections/[slug]/# Collection page
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Checkout page
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact form
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles + Tailwind theme
│   ├── components/
│   │   ├── layout/            # Header, Footer, Layout wrapper
│   │   └── ui/                # UI components (Button, Badge, Card, Input, etc.)
│   ├── lib/
│   │   ├── api.ts             # Axios API client (points to /api/)
│   │   ├── api-utils/         # Server-side utilities (Prisma, auth, config, storage)
│   │   ├── store.ts           # Zustand stores (cart, auth, UI)
│   │   ├── utils.ts           # Formatting, helpers
│   │   └── types/             # TypeScript type definitions
│   └── types/
│       └── index.ts           # Shared types
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Run seed script |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |

---

## 🧰 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Animation:** framer-motion 12
- **Database:** PostgreSQL + Prisma ORM 7
- **State:** Zustand (persisted)
- **Forms:** react-hook-form + zod
- **UI:** Radix UI primitives, lucide-react icons
- **Charts:** recharts (admin dashboard)
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **HTTP:** Axios

---

## ☁️ Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set the `DATABASE_URL` environment variable in Vercel's dashboard.

### Docker

A `Dockerfile` is included for containerized deployment.

---

## 📄 License

MIT


URL:    http://localhost:3000/auth/login                                                                         
      Email:  admin@artistportfol.io                                                                                   
      Pass:   Admin@123    