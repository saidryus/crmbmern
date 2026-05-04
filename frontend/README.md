# 🧁 CRMB — Artisan Bakery & Café Kiosk

A self-service digital ordering kiosk for **CRMB Artisan Bakery & Café**. Built with React, Vite, Tailwind CSS, and Framer Motion. Designed to run on a touchscreen tablet in-store.

---

## 🚀 Getting Started

```bash
cd crmb-kiosk
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

To build for production:
```bash
npm run build
npm run preview
```

---

## 🗂 Project Structure

```
src/
├── admin/
│   └── pages/
│       ├── AdminLogin.jsx       # Staff login page (hidden access)
│       └── AdminDashboard.jsx   # Admin panel with orders + menu overview
├── components/
│   ├── admin/
│   │   └── ProtectedRoute.jsx   # Route guard for admin pages
│   ├── cart/
│   │   └── CartButton.jsx       # Persistent cart button with badge + bump animation
│   └── common/
│       ├── NowPlaying.jsx       # Jazz radio player widget
│       ├── OfflineBadge.jsx     # Floating offline indicator
│       ├── RippleButton.jsx     # Button with ripple effect + click sound
│       └── SkeletonCard.jsx     # Shimmer placeholder for product cards
├── context/
│   ├── AudioContext.jsx         # Jazz radio streaming state
│   ├── CartContext.jsx          # Global cart state (useReducer + localStorage)
│   ├── FlyContext.jsx           # "Fly to cart" animation system
│   └── ToastContext.jsx         # Toast notification system
├── data/
│   └── products.js              # Static product data + daily special logic
├── hooks/
│   ├── useIdleTimeout.js        # Auto-reset kiosk after inactivity
│   ├── useLongPress.js          # Long-press gesture detection
│   ├── useNetwork.js            # Online/offline detection
│   └── useSound.js              # Synthesized UI sounds (Web Audio API)
├── pages/
│   ├── Splash.jsx               # Welcome screen with long-press admin trigger
│   ├── Menu.jsx                 # Main menu with categories, search, daily special
│   ├── ProductDetails.jsx       # Product detail view with quantity selector
│   ├── Cart.jsx                 # Cart with quantity controls and summary
│   └── Checkout.jsx             # Order confirmation with queue progress
├── utils/
│   ├── formatPrice.js           # Format numbers as ₱ Philippine Peso
│   └── generateOrderId.js       # Generate unique CRMB-XXXX-XXXX order IDs
├── App.jsx                      # Root: providers, routing, page transitions
├── main.jsx                     # React entry point
└── index.css                    # Design tokens, Tailwind, print styles
```

---

## 🧠 Architecture

### State Management

All global state is handled via React Context API — no external state library.

| Context | What it manages |
|---|---|
| `CartContext` | Cart items, quantities, totals, localStorage persistence |
| `AudioContext` | Jazz radio stream, play/pause, volume, fade in/out |
| `FlyContext` | "Fly to cart" animation — tracks cart button position |
| `ToastContext` | Add-to-cart toast notifications (max 3, auto-dismiss) |

### Routing

React Router DOM v7. Routes are wrapped in a `PageWrapper` that applies directional slide transitions based on route depth:

```
/ → /menu → /product/:id → /cart → /checkout
```

Going deeper slides right. Going back slides left. Admin routes (`/admin-login`, `/admin`) are outside the `PageWrapper` and unaffected by the idle timeout.

---

## 🪝 Hooks

### `useIdleTimeout(onIdle, timeout)`
Fires `onIdle` after `timeout` ms of no user interaction. Resets on any mouse, touch, keyboard, or scroll event. Used to return the kiosk to the splash screen after 2 minutes of inactivity.

### `useLongPress({ onComplete, onCancel, onProgress, duration })`
Detects a sustained press on any element. Returns event handler props to spread onto the target. Fires `onProgress(0–1)` every 50ms while held, and `onComplete` when the full duration is reached. Used for the hidden admin access trigger on the CRMB logo.

### `useNetwork()`
Returns a live `boolean` — `true` if online, `false` if offline. Subscribes to the browser's `online`/`offline` events. Used by `OfflineBadge` and the Checkout page.

### `useSound()`
Returns 8 synthesized sound functions generated via the Web Audio API. No audio files required — all sounds are created from oscillators and gain nodes at runtime. The `AudioContext` is lazy-initialized on first use to comply with browser autoplay policies.

| Function | Sound | Used on |
|---|---|---|
| `playNav` | Soft descending tick | Navigation, back buttons |
| `playClick` | Crisp mid tick | RippleButton, generic CTAs |
| `playQtyUp` | Bright ascending tick | + quantity button |
| `playQtyDown` | Soft descending tick | − quantity button |
| `playAddToCart` | Warm double-pop | Add to cart |
| `playRemove` | Low descending thud | Remove item from cart |
| `playSuccess` | C major arpeggio | Order confirmed |
| `playSelect` | Triangle mid-pop | Category filter pills |

---

## 🛒 Cart System

The cart uses `useReducer` with four actions:

- `ADD_ITEM` — adds a product or increments quantity if already present
- `REMOVE_ITEM` — removes a product by id
- `UPDATE_QUANTITY` — sets exact quantity (removes if ≤ 0)
- `CLEAR_CART` — empties the cart after checkout

Cart state is persisted to `localStorage` under the key `crmb_cart` and rehydrated on page load.

---

## 🎬 Animations

All animations use **Framer Motion**.

| Animation | Where |
|---|---|
| Page slide transitions | `App.jsx` — `PageWrapper` with directional variants |
| Card hover lift + shadow | `Menu.jsx` — `ProductCard` `whileHover` |
| Image zoom on hover | `Menu.jsx` — `motion.img` `whileHover` |
| Add button burst | `Menu.jsx` — scale `[1, 1.18, 0.95, 1.05, 1]` |
| Add/Added text slide | `Menu.jsx` — `AnimatePresence mode="wait"` |
| Cart button bump | `CartButton.jsx` — `useAnimation` spring sequence |
| Cart badge pop | `CartButton.jsx` — overshoot spring `[0, 1.35, 1]` |
| Fly to cart | `FlyContext.jsx` — fixed-position `motion.img` |
| Ripple on tap | `RippleButton.jsx` — DOM-injected span + CSS keyframe |
| Qty number slide | `Cart.jsx` / `ProductDetails.jsx` — `AnimatePresence` vertical slide |
| Item removal | `Cart.jsx` — slide right + scale + height collapse |
| Queue progress | `Checkout.jsx` — animated connecting line + step icons |
| Receipt reveal | `Checkout.jsx` — staggered row-by-row slide-in |
| Morph checkout button | `Checkout.jsx` — width + borderRadius animate to spinner |
| Long-press ring | `Splash.jsx` — SVG `strokeDashoffset` animation |
| Skeleton shimmer | `SkeletonCard.jsx` — `backgroundPosition` sweep |

---

## 🎵 Jazz Radio

The `NowPlaying` component streams live jazz internet radio via three public stream URLs (no API key needed). Features:

- **Fade in/out** — volume ramps smoothly on play/pause
- **Expandable mini-player** — spinning vinyl disc, volume slider, live indicator
- **Auto-fallback** — if one stream errors, the next is tried automatically
- **Track display** — rotates through a list of classic jazz track names every 45s (cosmetic — actual stream metadata isn't exposed by the radio APIs)

---

## 🔐 Admin Access

Admin access is intentionally hidden from customers.

### How to access
1. Go to the **Splash screen**
2. **Press and hold the CRMB logo** for **3 seconds**
3. A circular amber progress ring fills around the logo
4. "Staff access unlocked" toast appears → redirects to `/admin-login`

### Credentials
```
Username: crmb
Password: admin
```

### What the admin panel shows
- Total orders, revenue, and menu item count
- Recent order history (from localStorage)
- Full menu item list with availability status

### Auth flow
- Login sets `localStorage.setItem('isAdmin', 'true')`
- `ProtectedRoute` checks this before rendering any `/admin` route
- Logout calls `localStorage.removeItem('isAdmin')` and redirects to `/`

---

## 📦 Data Layer

All data is static — no backend or database.

### `src/data/products.js`
12 products across 3 categories (Bread, Pastries, Drinks). Each product has:

```js
{
  id: 1,
  name: "Chocolate Croissant",
  description: "...",
  price: 120,           // PHP
  category: "Pastries",
  image: "https://...", // Unsplash URL
  available: true,
  bestSeller: true,
  tags: ["Contains Gluten", "Contains Dairy"], // dietary info
}
```

The `dailySpecial` export rotates through 7 products based on the day of the week.

### Order History
Saved to `localStorage` under `crmb_order_history` after each successful checkout. Stores up to 20 orders with id, total, date, item count, and full cart snapshot.

---

## 📲 PWA Support

The app is installable as a Progressive Web App via `vite-plugin-pwa`.

- **Service worker** caches all JS/CSS/HTML assets
- **Unsplash images** are cached via `CacheFirst` (30-day expiry)
- **Google Fonts** are cached via `StaleWhileRevalidate`
- **Offline mode** — the full menu and cart work without internet
- **Manifest** — `CRMB` app name, fullscreen display, espresso theme color

---

## 🎨 Design System

### Palette (CSS custom properties in `index.css`)

| Token | Value | Usage |
|---|---|---|
| `--ink` | `#1e140a` | Primary text |
| `--ink-soft` | `#4a3728` | Secondary text |
| `--ink-muted` | `#8a6e5a` | Muted / placeholder text |
| `--parchment` | `#f5efe6` | Page background |
| `--parchment2` | `#ede4d8` | Input backgrounds |
| `--parchment3` | `#e2d5c4` | Borders, dividers |
| `--card` | `#ffffff` | Card backgrounds |
| `--amber` | `#c8913a` | Primary accent |
| `--amber-light` | `#e8b96a` | Gradient highlights |
| `--rose` | `#c4796a` | Destructive / remove |
| `--sage` | `#7a9080` | Success states |
| `--espresso` | `#1e140a` | Buttons, dark surfaces |

### Typography

| Font | Usage |
|---|---|
| Cormorant Garamond | Headings, prices, italic labels |
| DM Sans | Body copy, UI labels, buttons |
| DM Mono | Order IDs, monospace values |

---

## 🛠 Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool + dev server |
| Tailwind CSS | 4 | Utility-first styling |
| Framer Motion | 12 | Animations |
| React Router DOM | 7 | Client-side routing |
| Lucide React | latest | SVG icon library |
| vite-plugin-pwa | 1.2 | PWA + service worker |

---

## 📋 Checkout Flow

1. User taps **Confirm Order**
2. Button morphs into a spinner (width animates to a circle)
3. Queue progress screen shows 4 steps: Received → Preparing → Baking → Ready
4. Each step icon springs in, the connecting line fills progressively
5. Success receipt reveals with staggered row-by-row animation
6. C major arpeggio plays
7. Order saved to localStorage history
8. Cart cleared
9. User can tap **Order More** or **New Order**
10. **Print Receipt** triggers `window.print()` with clean print styles

---

*CRMB Artisan Bakery & Café — Est. 2024 — Manila, PH*
