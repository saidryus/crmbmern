# CRMB Kiosk — Architecture Guide
### Why the Project Is Built the Way It Is

---

> **Who this is for:** Anyone who wants to understand the big-picture decisions — why certain technologies were chosen, why the folders are organised the way they are, and what each part of the project is responsible for.

---

## 🏗️ What Is "Architecture"?

Architecture is the set of decisions made *before* writing code that determine how everything fits together. Like a building blueprint — it decides where the rooms go, how they connect, and what each room is for.

Good architecture means:
- New features are easy to add
- Bugs are easy to find
- Team members can work on different parts without breaking each other's work

---

## 🧱 The Tech Stack — What We Use and Why

| Technology | What it is | Why we chose it |
|---|---|---|
| **React** | The UI framework | Industry standard, component-based, huge community |
| **Vite** | Build tool & dev server | Extremely fast, modern, simple config |
| **Tailwind CSS** | Styling utility classes | Fast to write, consistent, no CSS file clutter |
| **Framer Motion** | Animation library | The best React animation library, simple API |
| **React Router DOM** | Page navigation | Standard routing for React apps |
| **Lucide React** | Icon library | Clean SVG icons, consistent style, tree-shakeable |
| **vite-plugin-pwa** | PWA support | Makes the app installable and offline-capable |
| **Web Audio API** | Sound synthesis | Built into browsers, no files needed, works offline |

**No backend. No database. Why?**

This is a single-device kiosk. All data (cart, products, orders) lives in the browser's `localStorage`. This means:
- Zero server costs
- Works completely offline
- No network latency
- Simple deployment (just serve the built files)

The tradeoff: data is tied to one device. For a multi-device setup, a backend would be needed.

---

## 📁 Folder Structure — What Goes Where and Why

```
crmb-kiosk/
├── public/              ← Static files served as-is (favicon, icons)
├── src/
│   ├── admin/           ← Everything staff-only (hidden from customers)
│   │   └── pages/
│   │       ├── AdminLogin.jsx
│   │       └── AdminDashboard.jsx
│   │
│   ├── components/      ← Reusable UI pieces used across multiple pages
│   │   ├── admin/
│   │   │   └── ProtectedRoute.jsx   ← Route guard for admin pages
│   │   ├── cart/
│   │   │   └── CartButton.jsx       ← The persistent cart button in headers
│   │   └── common/
│   │       ├── NowPlaying.jsx       ← Jazz radio widget
│   │       ├── OfflineBadge.jsx     ← Floating offline indicator
│   │       ├── RippleButton.jsx     ← Button with ripple + sound
│   │       └── SkeletonCard.jsx     ← Loading placeholder cards
│   │
│   ├── context/         ← Global state — shared data for the whole app
│   │   ├── AudioContext.jsx         ← Jazz radio state
│   │   ├── CartContext.jsx          ← Shopping cart state
│   │   ├── FlyContext.jsx           ← Fly-to-cart animation state
│   │   ├── ProductsContext.jsx      ← Menu product catalogue
│   │   └── ToastContext.jsx         ← Pop-up notifications
│   │
│   ├── data/            ← Static seed data (the original 12 products)
│   │   └── products.js
│   │
│   ├── hooks/           ← Reusable behaviour logic (not tied to any one component)
│   │   ├── useIdleTimeout.js        ← Auto-reset kiosk after inactivity
│   │   ├── useLongPress.js          ← Detect held press (admin trigger)
│   │   ├── useNetwork.js            ← Online/offline detection
│   │   └── useSound.js              ← Synthesized UI sounds
│   │
│   ├── pages/           ← Full screens the customer sees
│   │   ├── Splash.jsx               ← Welcome screen
│   │   ├── Menu.jsx                 ← Main ordering screen
│   │   ├── ProductDetails.jsx       ← Single product view
│   │   ├── Cart.jsx                 ← Order review
│   │   └── Checkout.jsx             ← Payment & confirmation
│   │
│   ├── utils/           ← Pure helper functions (no React, no state)
│   │   ├── formatPrice.js           ← Format numbers as ₱ currency
│   │   └── generateOrderId.js       ← Create unique order IDs
│   │
│   ├── App.jsx          ← Root: providers, routing, page transitions
│   ├── main.jsx         ← Entry point — mounts React into the HTML
│   └── index.css        ← Design tokens, Tailwind, print styles
│
├── docs/                ← All documentation guides
├── vite.config.js       ← Build configuration
└── package.json         ← Dependencies and scripts
```

### Why this folder structure?

**`pages/` vs `components/`**
Pages are full screens — they fill the entire viewport and are tied to a URL route. Components are smaller, reusable pieces that appear inside pages. This separation makes it immediately clear what something is when you open a file.

**`context/` separate from `hooks/`**
Context files contain both a Provider (the data source) and a custom hook (the way to read that data). They're tightly coupled — you can't use one without the other. Hooks in `hooks/` are standalone utilities with no Provider — they work anywhere.

**`utils/` for pure functions**
`formatPrice` and `generateOrderId` are just functions — they take input and return output, no React involved. Keeping them in `utils/` means they can be used anywhere without importing React.

**`admin/` separate from `pages/`**
Admin pages are intentionally isolated. This makes it visually clear in the codebase that these are staff-only screens, and it's easier to add access controls around the whole folder.

---

## 🔌 How the App Starts Up

When you open the app in a browser, this is what happens:

```
1. Browser loads index.html
2. index.html loads main.jsx
3. main.jsx mounts the React app into <div id="root">
4. App.jsx renders — wraps everything in providers:
   ProductsProvider → CartProvider → AudioProvider → FlyProvider → ToastProvider
5. ProductsProvider checks localStorage for products
   → If none found: seeds from products.js
6. CartProvider checks localStorage for cart
   → Restores any saved cart items
7. React Router reads the URL and renders the matching page
8. The page renders with all context data available
```

---

## 🛣️ Routing — How Pages Connect

React Router DOM manages navigation. There are two types of routes:

**Customer routes** (wrapped in `PageWrapper` for slide animations):
```
/           → Splash screen
/menu       → Menu page
/product/:id → Product details (e.g. /product/4)
/cart       → Cart page
/checkout   → Checkout page
```

**Admin routes** (no slide animation, no idle timeout):
```
/admin-login → Login page
/admin       → Dashboard (protected — redirects to /admin-login if not authenticated)
```

**Why are admin routes outside the PageWrapper?**
The slide animation and idle timeout are designed for the customer flow. Admin users shouldn't have their session reset after 2 minutes of inactivity, and the slide animation doesn't make sense for a dashboard.

---

## 🔒 Security Model

This is a kiosk app, not a banking app. The security is designed to be:
- **Invisible to customers** — they never see admin features
- **Accessible to staff** — who know the hidden gesture
- **Simple** — no complex auth infrastructure needed

**What's protected:**
- Admin routes require `localStorage.isAdmin === 'true'`
- Admin access requires a 3-second hold on the logo (hidden from customers)
- Credentials are hardcoded (`crmb` / `admin`) — acceptable for a single-device kiosk

**What's NOT protected (intentionally):**
- Cart data — customers can see their own cart
- Product data — the menu is public
- Order history — stored locally, only visible on that device

---

## 🧩 Component Architecture — How Components Relate

```
App (root)
├── Providers (data layer — invisible to users)
│   ├── ProductsProvider
│   ├── CartProvider
│   ├── AudioProvider
│   ├── FlyProvider
│   └── ToastProvider
│
├── OfflineBadge (always visible, floats above everything)
│
└── Pages (one visible at a time, based on URL)
    ├── Splash
    │   └── NowPlaying
    ├── Menu
    │   ├── CartButton
    │   ├── NowPlaying
    │   ├── SkeletonCard (×6, during loading)
    │   └── ProductCard (×N, after loading)
    ├── ProductDetails
    │   └── CartButton
    ├── Cart
    │   └── RippleButton (×2)
    ├── Checkout
    │   └── MorphButton
    ├── AdminLogin
    └── AdminDashboard
        ├── ProductFormModal
        └── DeleteConfirmModal
```

---

## ❓ Common Instructor Questions

**Q: Why React and not Vue or Angular?**
React is the most widely used frontend framework in the industry. It has the largest ecosystem, the most job opportunities, and the most learning resources. For a team learning web development, React is the most valuable skill to build.

**Q: Why Vite and not Create React App?**
Create React App is outdated and no longer maintained. Vite is the modern standard — it's significantly faster (dev server starts in milliseconds vs seconds), uses modern ES modules, and has better plugin support.

**Q: Why Tailwind CSS and not regular CSS?**
Tailwind lets you style components directly in JSX without switching between files. For a team project, it also enforces consistency — everyone uses the same spacing, sizing, and color scales. The design tokens in `index.css` extend Tailwind with CRMB-specific colors.

**Q: Why no TypeScript?**
TypeScript adds type safety but also significant complexity for a team that may be learning React for the first time. The project uses JSDoc comments and clear naming conventions to compensate. TypeScript would be the natural next step for a production version.

**Q: What would you change if this were a real production app?**
1. Add a backend (Node.js + Express or similar) for persistent, multi-device data
2. Add TypeScript for type safety
3. Add proper authentication (JWT tokens, not localStorage flags)
4. Add unit and integration tests
5. Add error boundaries for graceful error handling
6. Use a real image upload service instead of URL pasting

---

*CRMB Artisan Bakery & Café — Internal Technical Reference*
