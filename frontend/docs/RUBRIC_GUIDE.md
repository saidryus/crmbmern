# CRMB Kiosk — Rubric Guide
### How This Project Satisfies Every Grading Criterion

---

> **Who this is for:** You — before your presentation or defense. Each rubric item is listed with exactly where it's implemented, what to say, and what code to point to.

---

## 📊 Rubric Overview

| Category | Criteria | Points |
|---|---|---|
| MERN Stack | MongoDB | 10 |
| MERN Stack | Express & Node | 10 |
| MERN Stack | Integration | 5 |
| API | RESTful Design | 10 |
| API | API Integration | 10 |
| API | Advanced API Features | 5 |
| React Hooks | useState | 8 |
| React Hooks | useReducer | 8 |
| React Hooks | Best Practices | 4 |
| E-commerce | Product Pages | 5 |
| E-commerce | Cart | 5 |
| E-commerce | Checkout | 5 |
| UI/UX | Design | 4 |
| UI/UX | Responsiveness | 3 |
| UI/UX | Usability | 3 |
| Code Quality | Code & Structure | 5 |
| **TOTAL** | | **100** |

---

## 🍃 MERN Stack — 25 points

---

### MongoDB — Schema design, relationships, validation (10 pts)

**Where:** `backend/models/`

**Three Mongoose schemas:**

#### `Product.js`
```js
const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true, min: 0 },
  category:    { type: String, enum: ['Bread', 'Pastries', 'Drinks'], required: true },
  image:       { type: String, required: true },
  available:   { type: Boolean, default: true },
  bestSeller:  { type: Boolean, default: false },
  tags:        { type: [String], default: [] },
}, { timestamps: true });
```

**What to say:**
- `required` — validation that prevents saving incomplete products
- `enum` — restricts category to only valid values
- `min: 0` — prevents negative prices
- `timestamps: true` — automatically adds `createdAt` and `updatedAt`
- `trim: true` — strips whitespace from string fields

#### `Order.js`
```js
const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, min: 1 },
  image:     { type: String },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  items:   { type: [orderItemSchema], validate: arr => arr.length > 0 },
  total:   { type: Number, required: true, min: 0 },
  status:  { type: String, enum: ['received','preparing','baking','ready','completed'], default: 'received' },
}, { timestamps: true });
```

**What to say:**
- `orderItemSchema` is a **sub-document** — an embedded schema inside Order
- `ref: 'Product'` creates a **relationship** between Order and Product (like a foreign key)
- `unique: true` on `orderId` prevents duplicate orders
- Custom validator ensures orders always have at least one item

#### `Admin.js`
```js
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
adminSchema.methods.matchPassword = async function(plainText) {
  return bcrypt.compare(plainText, this.password);
};
```

**What to say:**
- `pre('save')` is a **Mongoose middleware hook** — runs before every save
- Passwords are hashed with bcrypt — never stored as plain text
- `matchPassword()` is a custom **instance method** on the schema

---

### Express & Node — Routes, controllers, middleware (10 pts)

**Where:** `backend/server.js`, `backend/routes/`, `backend/middleware/`

#### `server.js` — The Express app
```js
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.get('/api/health',   healthCheck);
app.use(notFoundHandler);
app.use(globalErrorHandler);
```

**What to say:**
- `cors` middleware handles cross-origin requests between Vercel (frontend) and Render (backend)
- `express.json()` parses incoming JSON request bodies
- Routes are modular — each resource has its own file
- 404 and global error handlers at the bottom

#### `authMiddleware.js` — The `protect` middleware
```js
const protect = (req, res, next) => {
  if (req.headers['x-admin-logged-in'] === 'true') {
    return next();
  }
  return res.status(401).json({ message: 'Not authorized' });
};
```

**What to say:**
- Middleware sits between the request and the route handler
- Admin-only routes call `protect` before executing
- Returns `401 Unauthorized` if the header is missing

#### Route structure example (`productRoutes.js`):
```js
router.get('/',     getAll);          // public
router.get('/:id',  getOne);          // public
router.post('/',    protect, create); // admin only
router.put('/:id',  protect, update); // admin only
router.delete('/:id', protect, del);  // admin only
```

---

### Integration — Frontend-backend connection (5 pts)

**Where:** `frontend/src/api/`, `frontend/vite.config.js`, `frontend/.env`

**What to say:**
- The frontend never touches MongoDB directly — it only calls API endpoints
- `src/api/client.js` is the single fetch wrapper used by all API calls
- In development, Vite proxies `/api/*` to `http://localhost:5000` — no CORS issues
- In production, `VITE_API_URL=https://crmb-backend.onrender.com/api` is set in Vercel's environment variables
- The frontend is deployed on Vercel, the backend on Render, the database on MongoDB Atlas — three separate services working together

---

## 🔌 API — 25 points

---

### RESTful Design — Proper endpoints, methods, status codes (10 pts)

**Where:** `backend/routes/`

**Full endpoint table:**

| Method | Endpoint | Auth | Status codes returned |
|--------|----------|------|-----------------------|
| POST | /api/auth/login | Public | 200, 400, 401, 500 |
| GET | /api/products | Public | 200, 500 |
| GET | /api/products/:id | Public | 200, 404, 500 |
| POST | /api/products | Admin | 201, 400, 401, 500 |
| PUT | /api/products/:id | Admin | 200, 400, 401, 404, 500 |
| DELETE | /api/products/:id | Admin | 200, 401, 404, 500 |
| POST | /api/orders | Public | 201, 400, 409, 500 |
| GET | /api/orders | Admin | 200, 401, 500 |
| GET | /api/orders/:id | Admin | 200, 401, 404, 500 |
| PATCH | /api/orders/:id/status | Admin | 200, 401, 404, 500 |
| GET | /api/health | Public | 200 |

**What to say:**
- `GET` for reading, `POST` for creating, `PUT` for full update, `PATCH` for partial update, `DELETE` for removing
- `201 Created` is returned when a new resource is created (not 200)
- `404 Not Found` when a specific resource doesn't exist
- `401 Unauthorized` when a protected route is accessed without auth
- `409 Conflict` for duplicate order IDs
- Validation errors return `400 Bad Request` with a descriptive message

---

### API Integration — Axios/fetch, loading & error handling (10 pts)

**Where:** `frontend/src/api/`, `frontend/src/context/ProductsContext.jsx`, `frontend/src/pages/Checkout.jsx`, `frontend/src/admin/pages/AdminDashboard.jsx`

---

**The simple version of what's happening:**

The frontend and backend are two separate programs. The only way they talk is through the API. Every feature follows this pattern — the frontend asks, the backend goes to the database, and sends the answer back.

---

**"Give me all products" — Menu loads**

Frontend asks (`frontend/src/api/products.js`):
```js
export const getProducts = () => apiFetch('/products');
```

Backend receives it (`backend/routes/productRoutes.js`):
```js
router.get('/', async (req, res) => {
  const products = await Product.find().sort({ createdAt: 1 });
  res.json(products);
});
```
Goes to MongoDB, gets all products, sends them back as JSON. `ProductsContext` stores the result and the menu displays them.

---

**"Save this order" — Customer checks out**

Frontend sends it (`frontend/src/pages/Checkout.jsx`):
```js
await createOrder({
  orderId: newId,
  items: snapshot,
  total,
});
```

Backend saves it (`backend/routes/orderRoutes.js`):
```js
router.post('/', async (req, res) => {
  const { orderId, items, total } = req.body;
  const order = await Order.create({ orderId, items, total });
  res.status(201).json(order);
});
```
Creates a permanent record in MongoDB. The admin dashboard will see this order.

---

**"Check these credentials" — Admin logs in**

Frontend sends it (`frontend/src/api/auth.js`):
```js
export const login = async (username, password) => {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem('isAdmin', 'true');
};
```

Backend checks it (`backend/routes/authRoutes.js`):
```js
router.post('/login', async (req, res) => {
  const admin = await Admin.findOne({ username });
  const match = await admin.matchPassword(password); // bcrypt compare
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ success: true, username: admin.username });
});
```
Finds the admin in MongoDB, compares the password against the bcrypt hash. If it matches, the frontend sets `isAdmin` in localStorage.

---

**"Save this new product" — Admin adds a product**

Frontend sends it (`frontend/src/api/products.js`):
```js
export const createProduct = (data) =>
  apiFetch('/products', { method: 'POST', body: JSON.stringify(data) });
```

Backend saves it (`backend/routes/productRoutes.js`):
```js
router.post('/', protect, async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});
```
`protect` checks the admin header first — if not logged in, returns 401. If logged in, saves to MongoDB and sends it back. The menu shows it immediately.

---

**"Give me all orders" — Admin dashboard loads**

Frontend asks (`frontend/src/api/orders.js`):
```js
export const getOrders = () => apiFetch('/orders');
```

Backend returns them (`backend/routes/orderRoutes.js`):
```js
router.get('/', protect, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});
```
`protect` blocks anyone not logged in. For the admin, returns all orders from MongoDB sorted newest first.

---

**The one thing connecting all of this — `frontend/src/api/client.js`:**

Every single frontend call above goes through this function. It handles three things automatically:
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
- Adds the correct backend URL automatically
- Adds the admin header when the user is logged in
- Throws a readable error if something goes wrong

---

**Loading and error handling in `ProductsContext`:**
```js
const [loading, setLoading] = useState(true);
const [error,   setError]   = useState(null);

const refreshProducts = async () => {
  setLoading(true);   // show skeleton cards
  setError(null);
  try {
    const data = await getProducts();
    setProducts(data);
  } catch (err) {
    setError(err.message); // show error message on screen
  } finally {
    setLoading(false);  // always hide skeleton cards when done
  }
};
```
- `loading = true` → skeleton cards show while waiting for the API
- `error` → "Could not load menu" message if the backend is unreachable
- `finally` → loading always turns off whether the request succeeded or failed

---

### Advanced API Features — Auth, payment, persistence (5 pts)

**What to say:**

**Auth:**
- Admin login verifies credentials against a bcrypt-hashed password in MongoDB
- After login, `isAdmin` is stored in localStorage
- Protected routes check the `X-Admin-Logged-In` header on every request
- Logout removes the flag — the next request to a protected route returns 401

**Persistence:**
- Products are stored permanently in MongoDB Atlas — survive server restarts, browser clears, and device changes
- Orders are saved to MongoDB on every checkout — the admin dashboard reads real order history from the database
- The seed script (`seed.js`) populates the database with initial data

**Data integrity:**
- Mongoose validation prevents invalid data from reaching the database
- `unique: true` on `orderId` prevents duplicate orders
- `enum` on category and status fields prevents invalid values

---

## ⚛️ React Hooks — 20 points

---

### useState — State handling and updates (8 pts)

**Where:** Every component. Key examples:

**What is `useState` in plain terms?**
`useState` is React's way of giving a component its own memory. When that memory changes, the screen updates automatically to reflect it. Think of it like a sticky note on a whiteboard — when you erase it and write something new, everyone looking at the whiteboard sees the change immediately.

Every `useState` has two parts:
- The **value** — what's currently written on the sticky note
- The **setter** — the pen you use to change it

```js
const [search, setSearch] = useState('');
//     ↑ value   ↑ setter    ↑ starting value
```

**What each one actually does in the app:**

**`Menu.jsx`**

| State | Starting value | What it controls on screen |
|---|---|---|
| `activeCategory` | `'All'` | Which filter pill is highlighted. When changed, the product grid re-filters instantly to show only that category. |
| `search` | `''` | What the customer typed in the search bar. Every keystroke updates this, which re-filters the product list in real time. |
| `addedId` | `null` | Tracks which product was just added to the cart. That product's "Add" button temporarily changes to "Added ✓" with a green color. Resets after 950ms. |

**`Cart.jsx`**

| State | Starting value | What it controls on screen |
|---|---|---|
| `removingId` | `null` | When the trash button is tapped, this is set to that item's ID. The item slides right and fades out. After 280ms the item is actually deleted. Without this, the item would just disappear instantly with no animation. |

**`Checkout.jsx`**

| State | Starting value | What it controls on screen |
|---|---|---|
| `status` | `'summary'` | The main switch controlling which screen is shown. `'summary'` = order review, `'loading'` = queue animation, `'success'` = receipt. |
| `orderId` | `''` | The generated order reference (e.g. `CRMB-LX4K2A-F3R9`). Shown on the receipt. |
| `orderTotal` | `0` | The total saved before the cart is cleared. The receipt needs this number even after the cart is empty. |
| `cartSnapshot` | `[]` | A copy of all cart items saved before clearing. The receipt shows the itemised list from this snapshot. |
| `queueStep` | `'received'` | Which step of the queue animation is active. Changes every 600–1200ms: received → preparing → baking → ready. |
| `countdown` | `0` | The "Ready in ~X min" number shown during the queue animation. Counts down as steps progress. |

**`AdminLogin.jsx`**

| State | Starting value | What it controls on screen |
|---|---|---|
| `username` | `''` | What the staff member typed in the username field. |
| `password` | `''` | What the staff member typed in the password field. |
| `showPw` | `false` | Whether the password is shown as dots or plain text. Toggled by the eye icon. |
| `error` | `''` | The red error message shown when credentials are wrong. Empty string = no message shown. |
| `shaking` | `false` | When `true`, the login form plays a shake animation. Set to `true` on wrong credentials, back to `false` after 600ms. |
| `loading` | `false` | When `true`, the Sign In button shows a spinner instead of text. Prevents the staff member from tapping twice. |

**`AdminDashboard.jsx`**

| State | Starting value | What it controls on screen |
|---|---|---|
| `modal` | `null` | Controls which modal is open. `null` = no modal. `{ type: 'add' }` = the Add Product form slides up. `{ type: 'edit', product }` = the Edit form opens pre-filled with that product's data. |
| `delTarget` | `null` | The product currently being considered for deletion. When set, the "Delete Product?" confirmation modal appears showing that product's name. |
| `orders` | `[]` | The list of orders fetched from the database. Shown in the Recent Orders section with order ID, date, item count, and total. |
| `ordersErr` | `null` | Error message shown if the orders fetch failed (e.g. backend is down). |

---

### useReducer — Complex state (cart, checkout) (8 pts)

**Where:** `frontend/src/context/CartContext.jsx`

**What is `useReducer` in plain terms?**

Imagine the cart is a physical basket. `useReducer` is the rulebook for what you're allowed to do with that basket:

- **Rule 1 (ADD_ITEM):** Put an item in. If it's already there, just add one more of it instead of putting in a duplicate.
- **Rule 2 (REMOVE_ITEM):** Take an item out completely.
- **Rule 3 (UPDATE_QUANTITY):** Change how many of an item are in the basket. If you set it to zero, remove it entirely.
- **Rule 4 (CLEAR_CART):** Empty the whole basket (used after checkout).

The key idea: **nothing can change the cart without going through the rulebook.** There's no way to accidentally corrupt the cart state because every change is handled by the same central function.

**Why not just use `useState` for the cart?**

You could use `useState`, but you'd end up with scattered logic like this across multiple components:
```js
// In Menu.jsx
setCart([...cart, { ...product, quantity: 1 }]);

// In Cart.jsx
setCart(cart.filter(i => i._id !== id));

// In ProductDetails.jsx
setCart(cart.map(i => i._id === id ? { ...i, quantity: i.quantity + 1 } : i));
```

With `useReducer`, all of that logic lives in one place. Any component that wants to change the cart just says *what it wants to do* (the action), and the reducer figures out *how to do it*.

**How it works step by step:**

```
Customer taps "Add" on Chocolate Croissant
        ↓
addItem(product) is called in Menu.jsx
        ↓
dispatch({ type: 'ADD_ITEM', payload: product })
        ↓
cartReducer receives the action
        ↓
Checks: is Chocolate Croissant already in the cart?
  → YES: return cart with that item's quantity + 1
  → NO:  return cart with the new item appended (quantity: 1)
        ↓
React updates the cart state
        ↓
CartButton badge updates, Cart page updates, Checkout total updates
```

**The actual reducer function:**
```js
const cartReducer = (state, action) => {
  switch (action.type) {

    case 'ADD_ITEM': {
      // Is this product already in the cart?
      const existing = state.find((i) => i._id === action.payload._id);
      if (existing) {
        // Yes — just bump the quantity by 1
        return state.map((i) =>
          i._id === action.payload._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      // No — add it as a new item with quantity 1
      return [...state, { ...action.payload, quantity: 1 }];
    }

    case 'REMOVE_ITEM':
      // Filter out the item with this _id
      return state.filter((i) => i._id !== action.payload);

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      // If quantity is 0 or less, remove the item entirely
      if (quantity <= 0) return state.filter((i) => i._id !== id);
      // Otherwise update the quantity
      return state.map((i) => (i._id === id ? { ...i, quantity } : i));
    }

    case 'CLEAR_CART':
      // Empty the entire cart (called after successful checkout)
      return [];
  }
};
```

**What `useReducer` does in Checkout specifically:**

When the customer confirms their order, `clearCart()` is called which dispatches `CLEAR_CART`. But before that happens, `Checkout.jsx` saves a snapshot of the cart:

```js
const snapshot = cart.map((i) => ({ ...i })); // save a copy
setCartSnapshot(snapshot);   // store it in local state
setOrderTotal(total);        // store the total too

// ... queue animation plays ...

clearCart(); // NOW the cart is emptied
```

This is important because the receipt needs to show what was ordered — but by the time the receipt appears, the cart is already empty. The snapshot preserves that information.

**Summary of what `useReducer` gives us:**
- One central place for all cart logic — no scattered `setState` calls
- Predictable behaviour — the same action always produces the same result
- Easy to understand — you can read the reducer and know exactly what the cart can and can't do
- Safe — no component can put the cart into an invalid state

---

### Best Practices — Clean usage, optimization (4 pts)

**Where:** Throughout the codebase

**`useMemo` in `Menu.jsx`:**
```js
const filtered = useMemo(() => products.filter((p) => {
  const matchCat = activeCategory === 'All' || p.category === activeCategory;
  const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
  return matchCat && matchSearch && p.available;
}), [products, activeCategory, search]);
```
Prevents re-filtering on every render — only recalculates when dependencies change.

**`useCallback` in `ProductsContext.jsx`:**
```js
const addProduct = useCallback(async (product) => {
  const created = await productsApi.createProduct(product);
  setProducts((prev) => [...prev, created]);
}, []);
```
Prevents function recreation on every render — stable reference for child components.

**Custom hooks:**
- `useCart()` — wraps `useContext(CartContext)` with an error guard
- `useProducts()` — wraps `useContext(ProductsContext)` with an error guard
- `useSound()`, `useNetwork()`, `useIdleTimeout()`, `useLongPress()` — reusable behaviour logic extracted from components

**`useRef` for non-rendering values:**
- `CartButton` uses `useRef` to store the previous item count — updating it doesn't trigger a re-render
- `ProductDetails` uses `useRef` to point to the hero image DOM node for the fly animation

---

## 🛒 E-commerce Features — 15 points

---

### Product Pages — Listing & details (5 pts)

**Listing — `Menu.jsx`:**
- Displays all available products in a responsive grid (2 cols mobile, 3 cols desktop)
- Category filter pills: All, Bread, Pastries, Drinks
- Live search by product name
- Daily Special card (rotates by day of week)
- House Favourites strip (best sellers)
- Skeleton loading cards while products are being fetched from the API
- Error state if the backend is unreachable

**Details — `ProductDetails.jsx`:**
- Hero image with category badge and best seller tag
- Full name, description, price
- Quantity selector with animated number transitions
- "Already in your order" banner if item is in cart
- "You might also like" section (same category, different product)
- Sticky "Add to Order" CTA button

---

### Cart — Add/remove/update items (5 pts)

**Where:** `frontend/src/pages/Cart.jsx`, `frontend/src/context/CartContext.jsx`

- **Add:** `addItem(product)` — increments quantity if already in cart, appends if new
- **Remove:** `removeItem(_id)` — slide-out animation then removes from state
- **Update quantity:** `updateQuantity(_id, qty)` — + and − buttons; auto-removes at 0
- **Persists:** Cart saved to `localStorage` on every change — survives page refresh
- **Summary:** Shows subtotal, service charge, and total with animated updates
- **Empty state:** Animated coffee cup with "Your table is empty" message

---

### Checkout — Order process (5 pts)

**Where:** `frontend/src/pages/Checkout.jsx`, `backend/routes/orderRoutes.js`

**The full flow:**
1. Customer reviews order summary with itemised list and total
2. Taps "Confirm Order" — button morphs into a spinner
3. Queue animation plays: Received → Preparing → Baking → Ready (4 steps, ~4 seconds)
4. `generateOrderId()` creates a unique human-readable ID (e.g. `CRMB-LX4K2A-F3R9`)
5. `POST /api/orders` saves the order permanently to MongoDB
6. Cart is cleared
7. Success receipt shows: order ID, itemised list, total, status
8. Customer can print the receipt or start a new order

---

## 🎨 UI/UX — 10 points

---

### Design — Clean and modern UI (4 pts)

**The aesthetic:** Jazz café — warm parchment backgrounds, espresso browns, amber accents, serif typography.

**Key design decisions:**
- **Cormorant Garamond** (serif) for headings and prices — editorial, premium feel
- **DM Sans** (sans-serif) for body text and UI — clean, readable at small sizes
- **CSS custom properties** for all colors — change one variable, updates everywhere
- **Framer Motion** animations — page transitions, card hovers, fly-to-cart, receipt reveal
- **Dark splash screen** — atmospheric first impression, contrasts with the lighter menu

**Notable UI features:**
- Fly-to-cart animation when adding items
- Morphing checkout button (full-width → circle → spinner)
- Staggered receipt reveal (items appear one by one like a real receipt printing)
- Queue progress indicator during checkout
- Toast notifications for cart additions

---

### Responsiveness — Mobile-friendly layout (3 pts)

**Where:** Tailwind CSS responsive classes throughout

- **2-column grid** on mobile (`grid-cols-2`)
- **3-column grid** on tablet/desktop (`md:grid-cols-3`)
- Cart button shows icon only on small screens, icon + "Order" text on larger screens
- NowPlaying widget hidden from menu header on mobile (still on splash)
- Content max-width constrained on large screens (`max-w-5xl`, `max-w-xl`)
- All tap targets are minimum 44×44px (accessibility standard for touch)
- Designed primarily for **portrait tablet** — the typical kiosk form factor

---

### Usability — Navigation and flow (3 pts)

**The customer flow is linear and obvious:**
```
Splash → Menu → (Product Details) → Cart → Checkout → Receipt → Splash
```

**Usability features:**
- **Idle timeout** — kiosk resets to splash after 2 minutes of inactivity
- **Back buttons** on every page — customer never gets stuck
- **Cart button** always visible in the header — one tap to review order
- **Audio feedback** — every tap has a distinct sound confirming the action
- **Offline badge** — floating indicator when WiFi drops
- **Empty states** — clear messages when cart is empty or no search results
- **Loading states** — skeleton cards instead of blank screens
- **Error states** — friendly message if the backend is unreachable

---

## 🏗️ Code Quality — 5 points

---

### Code & Structure — Readability, organization (5 pts)

**Project structure:**
```
crmbmern/
├── backend/          ← completely separate from frontend
│   ├── models/       ← data layer
│   ├── routes/       ← API layer
│   ├── middleware/   ← cross-cutting concerns
│   └── server.js     ← entry point
└── frontend/
    └── src/
        ├── api/      ← all backend communication
        ├── context/  ← global state
        ├── hooks/    ← reusable logic
        ├── pages/    ← full screens
        ├── components/ ← reusable UI
        └── utils/    ← pure functions
```

**What to say:**
- Frontend and backend are completely separate — different folders, different `package.json`, deployed independently
- The `api/` folder is the only place that talks to the backend — no `fetch()` calls scattered in components
- Every context file has a corresponding custom hook (`useCart`, `useProducts`, etc.)
- Utility functions (`formatPrice`, `generateOrderId`) are pure functions with no React dependencies
- Comments explain *why* code exists, not just *what* it does
- Consistent naming: pages are PascalCase, hooks are camelCase with `use` prefix, API files are camelCase

---

## 💬 Quick Answers for Common Instructor Questions

**"What is MERN?"**
MongoDB (database), Express (server framework), React (frontend), Node.js (runtime). JavaScript is used on both frontend and backend.

**"How does the frontend connect to the backend?"**
Through HTTP requests. The frontend calls REST API endpoints using `fetch()`. All calls go through `src/api/client.js` which adds the base URL and auth header automatically.

**"Where is data stored?"**
Products, orders, and admin accounts are in MongoDB Atlas (cloud database). The cart is in `localStorage` (temporary, until checkout). Admin login state is in `localStorage` (until logout).

**"What is a Mongoose schema?"**
A blueprint for how data is structured in MongoDB. It defines field names, types, validation rules, and default values. Mongoose enforces these rules before saving to the database.

**"What is middleware?"**
A function that runs between the request arriving and the route handler executing. `protect` in `authMiddleware.js` checks for the admin header — if it's missing, it returns 401 and the route handler never runs.

**"What is useReducer and why use it over useState?"**
`useReducer` manages state through a pure function (the reducer) that handles named actions. It's better than `useState` when state has multiple complex transitions — like the cart, which has ADD, REMOVE, UPDATE, and CLEAR operations. All logic is in one place, making it easier to understand and debug.

**"What is a RESTful API?"**
An API that uses HTTP methods (GET, POST, PUT, DELETE) to perform operations on resources (products, orders). Each endpoint represents a resource, and the HTTP method indicates the operation. Status codes communicate the result (200 OK, 201 Created, 404 Not Found, etc.).

**"How is the admin password secured?"**
It's hashed with bcrypt before being stored in MongoDB. bcrypt is a one-way hashing algorithm — you can verify a password against the hash, but you can't reverse the hash to get the original password. The plain-text password is never stored anywhere.

---

*CRMB Artisan Bakery & Café — Internal Technical Reference*
