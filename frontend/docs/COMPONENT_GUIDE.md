# CRMB Kiosk — Component Guide
### What Every File Does, Why It Exists, and How It Connects

---

> **Who this is for:** Anyone who opens a file and wants to immediately understand what it does, what data it needs, and what it produces on screen.

---

## 🧩 What Is a Component?

A **component** is a self-contained piece of UI. Think of it like a LEGO brick — it has a specific shape, does one job, and can be combined with other bricks to build something bigger.

In CRMB, every `.jsx` file is a component. Some are full pages (like `Menu.jsx`). Some are small reusable pieces (like `CartButton.jsx`).

---

## 🌐 The API Layer (`src/api/`)

Before the components, it's important to understand the API layer — the bridge between the React frontend and the Express backend.

### `api/client.js` — Base Fetch Wrapper

**What it does:** Every API call in the app goes through this function. It:
- Prepends the backend URL from `VITE_API_URL`
- Adds `Content-Type: application/json`
- Adds `X-Admin-Logged-In: true` when `localStorage.isAdmin === 'true'`
- Throws a clear `Error` with the server's message on non-2xx responses

```js
export async function apiFetch(path, options = {}) {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const headers = {
    'Content-Type': 'application/json',
    ...(isAdmin ? { 'X-Admin-Logged-In': 'true' } : {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data;
}
```

### `api/auth.js` — Authentication

- `login(username, password)` — POST /api/auth/login, sets `localStorage.isAdmin = 'true'`
- `logout()` — removes `isAdmin` from localStorage

### `api/products.js` — Product CRUD

- `getProducts()` — GET /api/products
- `createProduct(data)` — POST /api/products
- `updateProduct(id, data)` — PUT /api/products/:id
- `deleteProduct(id)` — DELETE /api/products/:id

### `api/orders.js` — Orders

- `createOrder(data)` — POST /api/orders
- `getOrders()` — GET /api/orders (admin only)

---

## 📄 Pages — Full Screens

---

### `Splash.jsx` — The Welcome Screen

**What it shows:** CRMB logo, "Tap to Begin", jazz radio, floating music notes.

**Key interactions:**
- Tap anywhere → go to menu
- Hold CRMB logo 3 seconds → admin access (`/admin-login`)

#### Hooks Used

**`useState`**
- `returning` — Did this customer order before? Checks `localStorage.crmb_cart` for existing items.
- `holdProgress` — 0–1 value driving the amber ring animation during long press.
- `unlocked` — Becomes `true` when the 3-second hold completes.

**`useEffect`** — Checks localStorage for existing cart items on mount to show "Welcome back" greeting.

**`useLongPress`** — Detects the 3-second hold on the CRMB logo. Fires `onProgress` every 50ms and `onComplete` at 3 seconds.

**`useNavigate`** — `navigate('/menu')` on tap, `navigate('/admin-login')` after hold.

**`useSound`** — `playNav()` on tap to menu.

---

### `Menu.jsx` — The Main Ordering Screen

**What it shows:** Product catalogue with category filters, search, daily special, house favourites strip.

**Key interactions:**
- Tap category pill → filter products
- Type in search → filter by name
- Tap product card → go to `/product/:_id`
- Tap "Add" → add to cart

#### Hooks Used

**`useState`**
- `activeCategory` — Which filter pill is selected (`'All'` by default).
- `search` — What the customer typed in the search bar.
- `addedId` — The `_id` of the product just added. Shows "Added" state on that card's button. Resets after 950ms.

**`useMemo`** — Filters products by category, search text, and `available === true`. Only recalculates when `products`, `activeCategory`, or `search` changes.

**`useProducts`** — Reads `{ products, categories, dailySpecial, loading, error }` from `ProductsContext`. `loading` drives the skeleton cards. `error` shows a "Could not load menu" message if the backend is unreachable.

**`useCart`** — `addItem(product)` dispatches `ADD_ITEM` to the cart reducer.

**`useToast`** — `addToast()` shows the confirmation pill.

**`useFly`** — `flyToCart()` launches the thumbnail animation toward the cart button.

**`useNavigate`** — `navigate('/product/' + product._id)` on card tap.

**`useSound`** — `playAddToCart`, `playSelect`, `playNav`.

> **Note on `_id`:** Products from MongoDB use `_id` (a string like `"683abc..."`), not a numeric `id`. All product lookups, cart operations, and navigation use `_id`.

---

### `ProductDetails.jsx` — Single Product View

**What it shows:** Hero image, name, description, price, quantity selector, "You might also like", Add to Order button.

#### Hooks Used

**`useState`**
- `added` — Switches CTA from "Add to Order" to "Added to Order". Resets after 1500ms.
- `qty` — Selected quantity (starts at 1).
- `qtyDir` — Direction of last quantity change (`1` = up, `-1` = down) for the sliding number animation.

**`useRef`** — Points to the hero `<img>` DOM node. Used to get its screen position for the fly animation.

**`useParams`** — Reads `:id` from the URL. This is a MongoDB `_id` string.

```js
const { id } = useParams(); // e.g. "683abc123..."
const product = products.find((p) => p._id === id);
```

**`useProducts`** — Finds the product by `_id` and gets related products (same category, different `_id`).

**`useCart`** — `addItem(product)` × qty, and `cart.find(i => i._id === product._id)` to show the "already in cart" banner.

**`useNavigate`** — `navigate(-1)` goes back.

---

### `Cart.jsx` — Order Review

**What it shows:** All cart items with quantities, prices, summary card, checkout button.

#### Hooks Used

**`useState`**
- `removingId` — The `_id` of the item being removed. Triggers the slide-out animation before the item is actually deleted from state.

**`useCart`**
- `cart` — Array of items (each with `_id`, `name`, `price`, `quantity`, etc.)
- `removeItem(_id)` — Called after the 280ms removal animation completes.
- `updateQuantity(_id, qty)` — Called by + and − buttons. Removes item if qty reaches 0.
- `total`, `itemCount`

**`useSound`** — `playRemove`, `playQtyUp`, `playQtyDown`.

**`useNavigate`** — `navigate('/menu')` (back), `navigate('/checkout')` (proceed).

---

### `Checkout.jsx` — Order Confirmation

**What it shows:** Order summary → loading/queue screen → success receipt.

#### Hooks Used

**`useState`** — 6 pieces managing the checkout state machine:
- `status` — `'summary'` → `'loading'` → `'success'`
- `orderId` — The generated order ID (e.g. `CRMB-LX4K2A-F3R9`)
- `orderTotal` — Saved before `clearCart()` so the receipt shows the correct total
- `cartSnapshot` — Copy of cart items saved before clearing, for the receipt
- `queueStep` — Current queue step: `received` → `preparing` → `baking` → `ready`
- `countdown` — "Ready in ~X min" countdown shown during loading

**`useCart`** — `cart`, `total`, `clearCart()`.

**`useNetwork`** — Shows offline warning banner if `!online`.

**`useSound`** — `playSuccess()` plays C major arpeggio on completion.

**`useNavigate`** — `navigate('/menu')` (order more), `navigate('/')` (new order).

**API call in `handleConfirm`:**
```js
await createOrder({
  orderId: newId,
  items: snapshot.map(item => ({
    productId: item._id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  })),
  total,
});
```
This saves the order permanently to MongoDB. If the call fails (e.g. offline), the customer still gets their receipt — the failure is logged but not shown.

---

### `AdminLogin.jsx` — Staff Login

#### Hooks Used

**`useState`** — `username`, `password`, `showPw`, `error`, `shaking`, `loading`.

**`useNavigate`** — `navigate('/admin', { replace: true })` on success, `navigate('/')` for back link.

**API call in `handleSubmit`:**
```js
await login(username.trim(), password);
// login() calls POST /api/auth/login
// On success: sets localStorage.isAdmin = 'true'
// On failure: throws Error with server's message
```

---

### `AdminDashboard.jsx` — Staff Control Panel

#### Hooks Used

**`useState`**
- `modal` — `null` | `{ type: 'add' }` | `{ type: 'edit', product }` — controls which modal is open.
- `delTarget` — Product being considered for deletion.
- `orders` — Array of orders fetched from the API.
- `ordersErr` — Error message if orders fetch failed.

**`useEffect`** — Fetches orders from `GET /api/orders` on mount.

**`useProducts`** — `products`, `addProduct()`, `updateProduct()`, `deleteProduct()`.

**`useNavigate`** — `navigate('/')` on logout.

**`logout()`** from `api/auth.js` — removes `isAdmin` from localStorage.

**Product mutations all go through the API:**
- Add → `createProduct()` → POST /api/products → MongoDB
- Edit → `updateProduct()` → PUT /api/products/:id → MongoDB
- Delete → `deleteProduct()` → DELETE /api/products/:id → MongoDB

---

## 🧱 Reusable Components

---

### `CartButton.jsx`

**Where it appears:** Header of Menu and ProductDetails pages.

**Key behaviour:** Bumps and wobbles when `itemCount` increases. Registers its DOM position with `FlyContext` so fly animations know where to aim.

**Hooks:** `useCart` (itemCount), `useFly` (cartRef), `useAnimation` (bump), `useRef` (DOM position), `useNavigate`, `useSound`.

---

### `ProtectedRoute.jsx`

**What it does:** Checks `localStorage.isAdmin === 'true'`. If true, renders children. If false, redirects to `/admin-login`.

```js
const token = localStorage.getItem('isAdmin') === 'true';
return token ? children : <Navigate to="/admin-login" replace />;
```

No hooks — reads localStorage synchronously on every render.

---

### `NowPlaying.jsx`, `RippleButton.jsx`, `SkeletonCard.jsx`, `OfflineBadge.jsx`

These are unchanged from the original app. See the Animations Guide for details on the shimmer and ripple effects.

---

## 🔧 Utility Functions

### `formatPrice.js`
```
formatPrice(120)    → "₱120.00"
formatPrice(1250.5) → "₱1,250.50"
```

### `generateOrderId.js`
```
generateOrderId() → "CRMB-LX4K2A-F3R9"
```
Format: `CRMB` prefix + base-36 timestamp + 4 random characters. Used as the human-readable order reference on receipts. Also stored as `orderId` in the MongoDB Order document.

---

## ❓ Common Instructor Questions

**Q: Why is there an `api/` folder? Why not call fetch directly in components?**
Centralising API calls in `src/api/` means: (1) the base URL is set in one place, (2) the auth header is added automatically, (3) error handling is consistent, (4) if an endpoint changes, you update one file not every component that uses it.

**Q: Why does `Checkout.jsx` not block the user if the order save fails?**
The kiosk is a customer-facing device. If the network hiccups during checkout, blocking the customer with an error would be a bad experience. The order save failure is logged silently — in a real production app, you'd queue failed orders for retry.

**Q: What's the difference between `_id` and `id`?**
`id` was the numeric identifier in the original static data file (`products.js`). `_id` is MongoDB's automatically generated unique identifier — a 24-character hex string like `"683abc123def456..."`. Since products now come from MongoDB, `_id` is used everywhere.

**Q: Why does `AdminDashboard` fetch orders in a `useEffect` instead of using a context?**
Orders are only needed in the admin dashboard — no customer-facing component needs them. Creating a full context for data used in one place would be over-engineering. A simple `useEffect` + local state is the right tool here.

---

*CRMB Artisan Bakery & Café — Internal Technical Reference*
