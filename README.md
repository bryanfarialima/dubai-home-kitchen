# 🇧🇷 Sabor de Casa - Dubai Home Kitchen

> Authentic Brazilian homemade food delivery in Dubai

A full-stack food delivery platform featuring real-time order management, multi-language support, and PWA capabilities.

## ✨ Features

### 🌍 Multi-Language Support
- **3 Languages**: English, Portuguese (PT-BR), Arabic
- Persistent language selection via localStorage
- Full i18n coverage across all pages and components
- Real-time language switching

### 👨‍💼 Admin Panel
- **Orders Management**: Real-time order tracking with live updates
- **Menu Management**: Create, edit, delete, and toggle availability of menu items
- **Coupons System**: Create percentage or fixed-value discount coupons
- **Reports Dashboard**: Today's and total orders/revenue statistics
- **Status Control**: Update order status (pending → confirmed → preparing → delivering → delivered)

### 🛒 Customer Features
- **Browse Menu**: Filter by categories (Mains, Snacks, Desserts, Combos)
- **Shopping Cart**: Add/remove items with quantity control
- **Checkout**: Select delivery zone, time, payment method (card/cash)
- **Apply Coupons**: Discount codes with minimum order validation
- **Order Tracking**: View order history and real-time status updates
- **WhatsApp Integration**: Floating contact button

### 📱 Progressive Web App (PWA)
- Installable on mobile devices
- Offline-ready with service worker
- App manifest with icons and shortcuts
- Optimized caching strategies

### 🔐 Authentication & Authorization
- Supabase Auth integration
- JWT-based sessions
- Admin role verification (user_metadata + RPC fallback)
- Protected routes

### 🎨 UI/UX
- Modern, responsive design with Tailwind CSS
- ShadcN UI components (Radix primitives)
- Smooth animations with Framer Motion
- Dark mode support
- Mobile-first approach

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.8** - Type safety
- **Vite 5.4** - Build tool & dev server
- **Tailwind CSS** - Styling
- **ShadcN UI** - Component library
- **Framer Motion** - Animations
- **i18next** - Internationalization
- **React Query (TanStack)** - Server state management
- **React Router v6** - Routing

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication
  - Storage

### PWA
- **vite-plugin-pwa** - PWA generation
- **Workbox** - Service worker strategies

## 🗄️ Database Schema

```sql
Tables:
- profiles (user data)
- user_roles (admin permissions)
- categories (menu categories)
- menu_items (dishes)
- delivery_zones (zones with fees)
- coupons (discount codes)
- orders (order records)
- order_items (order line items)
- reviews (customer reviews)

Functions:
- has_role(user_id, role) - Check user permissions
- handle_new_user() - Auto-create profile on signup
- update_updated_at() - Timestamp trigger
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ & npm
- Supabase account
- Git

### Installation

```bash
# Clone the repository
git clone <YOUR_REPO_URL>
cd dubai-home-kitchen

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env
# Edit .env with your Supabase credentials

# Run database migrations (in Supabase SQL Editor)
# Execute the SQL from supabase/migrations/

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_WHATSAPP_NUMBER=971501234567
```

### Promote User to Admin

```bash
# Using the promotion script
VITE_SUPABASE_URL="your_url" \
SUPABASE_SERVICE_ROLE_KEY="your_key" \
node scripts/promote_admin.js [user_id]

# Or via Supabase SQL Editor
UPDATE auth.users 
SET raw_user_meta_data = 
  jsonb_set(raw_user_meta_data, '{role}', '"admin"') 
WHERE id = 'user_id_here';
```

## 📂 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # ShadcN UI components
│   ├── Header.tsx      # Navigation header
│   ├── CartDrawer.tsx  # Shopping cart
│   ├── WhatsAppButton.tsx
│   └── LanguageSwitcher.tsx
├── pages/              # Route pages
│   ├── Index.tsx       # Home/Menu
│   ├── AdminPage.tsx   # Admin dashboard
│   ├── CheckoutPage.tsx
│   ├── OrdersPage.tsx
│   └── AuthPage.tsx    # Login/Signup
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── integrations/
│   └── supabase/       # Supabase client
├── i18n.ts            # i18next configuration
└── data/
    └── menuData.ts     # Sample menu data

public/
├── manifest.json       # PWA manifest
└── robots.txt

scripts/
├── promote_admin.js    # Admin promotion script
└── apply_migrations.js # Migration helper
```

## 🏗️ Build & Deploy

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# The build creates:
# - Optimized bundle in dist/
# - Service worker (sw.js)
# - PWA manifest
```

### Deployment
Deploy the `dist/` folder to any static hosting:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

**Important**: PWA requires HTTPS in production.

## 🧪 Development

```bash
# Start dev server (with HMR)
npm run dev

# Run type checking
npm run type-check

# Lint code
npm run lint

# Build
npm run build

# Clean cache and restart
rm -rf node_modules/.vite dist && npm run dev
```

## 📋 Roadmap

### ✅ Completed (Priority 1 & 2)
- [x] Admin panel with full CRUD
- [x] Real-time order management
- [x] Multi-language support (EN/PT/AR)
- [x] PWA installation
- [x] WhatsApp integration
- [x] Coupon system (basic)

### 🔄 In Progress (Priority 3)
- [ ] Advanced coupon features (usage limits, expiry)
- [ ] Loyalty points system
- [ ] Enhanced reports (charts, filters)
- [ ] Customer reviews & ratings
- [ ] Push notifications

### 🎯 Future Features
- [ ] Delivery driver app
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] SMS notifications
- [ ] Order scheduling
- [ ] Multi-restaurant support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Lovable.dev](https://lovable.dev)
- UI components from [ShadCN](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Backend by [Supabase](https://supabase.com)

---

**Made with ❤️ for the Brazilian community in Dubai** 🇧🇷🇦🇪
