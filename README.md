# 🇧🇷 Sabor de Casa - Dubai Home Kitchen

> Authentic Brazilian homemade food delivery in Dubai

A full-stack food delivery platform featuring real-time order management, multi-language support, PWA capabilities, and comprehensive admin tools.

## ✨ Features

### 🌍 Multi-Language Support
- **3 Languages**: English, Portuguese (PT-BR), Arabic
- Persistent language selection via localStorage
- Full i18n coverage across all pages and components
- Real-time language switching

### 👨‍💼 Admin Panel
- **Orders Management**: Real-time order tracking with live updates (auto-hides delivered/cancelled orders)
- **Menu Management**: Full CRUD for menu items with image URL support
- **Coupons System**: Create percentage or fixed-value discount coupons with validation
- **Reports Dashboard**: Today's and total orders/revenue statistics
- **Status Control**: Update order status (pending → confirmed → preparing → delivering → delivered)
- **Smart Filtering**: Live queue automatically excludes delivered and cancelled orders

### 🛒 Customer Features loaded from Supabase
- **Shopping Cart**: Add/remove items with quantity control and UUID validation
- **Checkout**: Location type selection (Casa/Apartamento/Villa), delivery time, payment method
- **Free Delivery**: No delivery fees - simplified checkout flow
- **Apply Coupons**: Discount codes with minimum order validation and proper error feedback
- **Order Tracking**: View order history and real-time status updates
- **WhatsApp Integration**: Floating contact button with configurable numberime status updates
- **WhatsApp Integration**: Floating contact button

### 📱 Progressive Web App (PWA)
- Installable on mobile devices
- Offline-ready with service worker
- App manifest with icons and shortcuts
- Optimized caching strategies

### 🔐 Authentication & Aut with secure logout
- JWT-based sessions with automatic cleanup
- Admin role verification (user_roles table + user_metadata fallback)
- Protected routes with role-based access control
- Forced local logout to prevent stale sessionfication (user_metadata + RPC fallback)
- Protected routes

### 🎨 UI/UX
- Modern, responsive design with Tailwind CSS
- ShadcN UI components (Radix primitives)
- Smooth animations with Framer Motion
- Dark mode support
- Mobile-first approach

## 🆕 Recent Fixes & Improvements

### ✅ Cart & Orders
- **UUID Validation**: Cart now validates UUIDs to prevent "invalid UUID" errors during checkout
- **Data Integrity**: Automatically filters out invalid cart items from localStorage
- **Error Handling**: Pre-submission validation with user-friendly error messages

### ✅ Authentication
- **Logout Fix**: Forced local logout with automatic localStorage cleanup
- **Session Management**: Clears all Supabase session data (sb-* keys) on logout
- **Toast Feedback**: User confirmation messages for login/logout actions

### ✅ Menu System
- **Database Integration**: Menu items now loaded from Supabase with fallback to local data
- **Image Mapping**: Proper mapping of `image_url` from database to component props
- **Real-time Updates**: Changes in admin panel immediately reflect in customer view

### ✅ Admin Panel
- **Smart Queue**: Delivered and cancelled orders automatically hidden from live queue
- **Image Support**: Full support for external image URLs (Cloudinary, ImgBB, etc.)
- **Better Filtering**: Only active orders shown in real-time management view

### ✅ Checkout Flow
- **Simplified Process**: Removed delivery zone requirement (free delivery)
- **Location Type**: Added detailed location options (Casa, Apartamento, Villa, etc.)
- **Validation**: Phone number and address validation with helpful error messages

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

### Quick Start

```bash
# Clone the repository
git clone https://github.com/bryanfarialima/dubai-home-kitchen.git
cd dubai-home-kitchen

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

Visit `http://localhost:8080`

### Environment Setup

Create a `.env` file (use `.env.example` as template):

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_WHATSAPP_NUMBER=+971501234567
```

### Database Setup

1. **Apply Migrations**: In Supabase SQL Editor, execute:
   ```sql
   -- Content from: supabase/migrations/20260211021034_*.sql
   ```

2. **Apply RLS Policies** (CRITICAL for security):
   ```sql
   -- Content from: supabase/RLS_POLICIES.sql
   ```

3. **Create Admin User**: After signing up, promote yourself:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('your_user_id', 'admin');
   ```

4. **Add Categories & Menu Items**: Use the Admin Panel or SQL

### Deploy to Production

See detailed deploy guide: **[DEPLOY.md](./DEPLOY.md)**

Quick deploy options:
- **Vercel** (recommended): `vercel --prod`
- **Netlify**: Connect GitHub repo in Netlify dashboard

## � Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # ShadcN UI primitives
│   ├── Header.tsx       # Navigation with cart, auth, language
│   ├── CartDrawer.tsx   # Shopping cart sidebar
│   ├── MenuSection.tsx  # Menu display with DB integration
│   ├── FoodCard.tsx     # Individual menu item card
│   ├── WhatsAppButton.tsx
│   └── LanguageSwitcher.tsx
├── pages/               # Route pages
│   ├── Index.tsx        # Home/Menu page
│   ├── AdminPage.tsx    # Admin dashboard (4 tabs)
│   ├── CheckoutPage.tsx # Order placement
│   ├── OrdersPage.tsx   # Customer order history
│   └── AuthPage.tsx     # Login/Signup
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # User auth & admin check
│   └── CartContext.tsx  # Shopping cart state
├── hooks/               # Custom hooks
│   └── useOrders.ts     # Order fetching & filtering
├── integrations/
│   └── supabase/        # Supabase client & types
│       ├── client.ts
│       └── types.ts
├── i18n.ts             # i18next configuration
└── data/
    └── menuData.ts      # Fallback menu data

public/
├── manifest.json        # PWA manifest
└── robots.txt           # SEO

supabase/
├── config.toml          # Local Supabase config
├── RLS_POLICIES.sql     # Row Level Security policies
└── migrations/          # Database migrations

docs/
├── DEPLOY.md           # Deployment guide
├── TESTE_COMPLETO.md   # Testing checklist
└── GUIA_FOTOS_TEXTOS.md # Content guide
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

For detailed deployment instructions, see **[DEPLOY.md](./DEPLOY.md)**

Deploy the `dist/` folder to:
- **Vercel** (recommended - automatic deploys on push)
- **Netlify** (easy setup with GitHub integration)
- AWS S3 + CloudFront
- GitHub Pages (requires additional routing config)

**Important**: 
- PWA requires HTTPS in production
- Configure environment variables in your hosting platform
- Apply RLS policies before going live

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

### ✅ Completed
- [x] Admin panel with full CRUD operations
- [x] Real-time order management with smart filtering
- [x] Multi-language support (EN/PT/AR) with persistent selection
- [x] PWA installation with offline support
- [x] WhatsApp integration
- [x] Coupon system with validation
- [x] UUID validation in cart and orders
- [x] Secure logout with session cleanup
- [x] Database-driven menu with fallback
- [x] Image URL support for menu items
- [x] Location type selection in checkout
- [x] Free delivery flow

### 🔄 In Progress
- [ ] Enhanced image management (Supabase Storage integration)
- [ ] Advanced coupon features (usage limits, expiry dates)
- [ ] Customer reviews & ratings display
- [ ] Enhanced reports (charts, date filters)

### 🎯 Future Features
- [ ] Loyalty points system
- [ ] Push notifications for order updates
- [ ] Delivery driver app/interface
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] SMS notifications via Twilio
- [ ] Order scheduling (pre-orders)
- [ ] Multi-restaurant support
- [ ] Customer wishlists
- [ ] Referral program

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
