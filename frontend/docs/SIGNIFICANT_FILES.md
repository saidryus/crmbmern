# CRMB Kiosk — Significant Files
### What every important file does, where it is, and why it matters

---

## 🗄️ Backend

---

### `backend/server.js`
**The entry point of the entire backend.**

This is the first file that runs when you start the server. It does four things in order:
1. Loads environment variables from `.env`
2. Sets up Express with CORS and JSON parsing middleware
3. Registers all route files under `/api/...`
4. Connects to MongoDB — if the connection fails, the server stops entirely
5. On successful connection, checks if the database is empty and auto-seeds it if so, then starts listening on port 5000

Nothing in the backend works without this file.

---

### `backend/models/Product.js`
**Defines what a product looks like in MongoDB.**

A Mongoose schema that enforces the shape and rules of every product document:
- `name`, `image` — required, can't be saved without them
- `price` — required, must be 0 or above
- `category` — must be one of `Bread`, `Pastries`, or `Drinks` (enum validation)
- `available`, `bestSeller` — booleans with defaults
- `tags` — array of strings
- `timestamps: true` — automatically adds `createdAt` and `updatedAt`

Every product in the database follows this exact shape.

---

### `backend/models/Order.js`
**Defines what an order looks like in MongoDB.**

Contains two schemas:
- `orderItemSchema` — a sub-document representing one item in the order (name, price, quantity, image). Has a `ref: 'Product'` relationship.
- `orderSchema` — the full order with `orderId` (unique), `items` array, `total`, and `status`

The `unique: true` on `orderId` prevents duplicate orders. The custom validator ensures every order has at least one item. `status` uses an enum so it can only be one of the defined values.

---

### `backend/models/Admin.js`
**Stores the admin account with a hashed password.**

Two key features:
- `pre('save')` hook — runs automatically before every save, hashes the password with bcrypt so plain text is never stored in the database
- `matchPassword()` instance method — compares a plain text input against the stored hash during login

This is what makes the login system secure.

---

### `backend/middleware/authMiddleware.js`
**The gatekeeper for admin-only routes.**

A single `protect` function that checks for the `X-Admin-Logged-In: true` header on incoming requests. If the header is present, the request passes through to the route handler. If it's missing, it immediately returns `401 Unauthorized` and the handler never runs.

Used as a parameter in routes that should only be accessible to logged-in staff:
```js
router.post('/', protect, createProduct); // protect runs first
```

---

### `backend/routes/productRoutes.js`
**All five product API endpoints.**

| Route | Auth | What it does |
|-------|------|--------------|
| `GET /api/products` | Public | Returns all products from MongoDB |
| `GET /api/products/:id` | Public | Returns one product by ID |
| `POST /api/products` | Admin | Creates a new product |
| `PUT /api/products/:id` | Admin | Updates an existing product |
| `DELETE /api/products/:id` | Admin | Deletes a product |

The route is `router.METHOD('path')`. The controller is the function after it — it does the database work and sends the response. Public routes have no `protect`. Admin routes have `protect` as a parameter before the handler.

---

### `backend/routes/orderRoutes.js`
**Order creation and retrieval.**

| Route | Auth | What it does |
|-------|------|--------------|
| `POST /api/orders` | Public | Saves a new order to MongoDB (called on checkout) |
| `GET /api/orders` | Admin | Returns all orders, newest first |
| `GET /api/orders/:id` | Admin | Returns one order by ID |
| `PATCH /api/orders/:id/status` | Admin | Updates an order's status |

The POST route is public because customers place orders without logging in. The GET routes are admin-only because only staff should see order history.

---

### `backend/routes/authRoutes.js`
**Admin login.**

One endpoint: `POST /api/auth/login`. Receives `{ username, password }`, finds the admin in MongoDB, runs `matchPassword()` to compare against the bcrypt hash. Returns `{ success: true, username }` on success or `401` on failure.

---

### `backend/seed.js`
**Populates the database with initial data.**

A standalone script that clears existing products and admin accounts, then inserts 12 default products and creates the admin account. Run once manually with `node seed.js`. The server also calls this logic automatically on first startup if the database is empty.

---

---

## ⚛️ Frontend

---

### `frontend/src/main.jsx`
**The true entry point of the React app.**

Mounts the React application into the `<div id="root">` in `index.html`. Wraps everything in `BrowserRouter` so React Router can manage navigation. This is the first React file that runs.

---

### `frontend/src/App.jsx`
**The root of the entire frontend.**

Four responsibilities:
1. **Context providers** — wraps everything in `ProductsProvider`, `CartProvider`, `AudioProvider`, `FlyProvider`, `ToastProvider` so every component has access to shared data
2. **Routes** — maps every URL to its page component
3. **Idle timeout** — resets the kiosk to the splash screen after 2 minutes of inactivity (admin routes excluded)
4. **Page transitions** — calculates slide direction (forward = right, back = left) and wraps every page in the animation

---

### `frontend/src/api/client.js`
**The single fetch wrapper for all API calls.**

Every request to the backend goes through this one function. It automatically:
- Prepends the backend base URL from `VITE_API_URL`
- Adds `Content-Type: application/json`
- Adds `X-Admin-Logged-In: true` when the admin is logged in
- Throws a readable error if the response is not 2xx

This means the base URL and auth header are never duplicated across the codebase.

---

### `frontend/src/api/products.js` / `orders.js` / `auth.js`
**Named functions for every API call.**

Clean wrappers around `client.js` so components never write raw fetch calls:
```js
getProducts()           → GET  /api/products
createProduct(data)     → POST /api/products
updateProduct(id, data) → PUT  /api/products/:id
deleteProduct(id)       → DELETE /api/products/:id
createOrder(data)       → POST /api/orders
getOrders()             → GET  /api/orders
login(username, password) → POST /api/auth/login
logout()                → removes isAdmin from localStorage
```

---

### `frontend/src/context/CartContext.jsx`
**The shopping cart — the most used context in the app.**

Uses `useReducer` with a `cartReducer` function that handles four actions:
- `ADD_ITEM` — appends or increments
- `REMOVE_ITEM` — filters out by `_id`
- `UPDATE_QUANTITY` — sets exact quantity, removes if 0
- `CLEAR_CART` — empties the array

`addItem`, `removeItem`, `updateQuantity`, `clearCart` are dispatch wrappers exposed to components. `total` and `itemCount` are derived values calculated from the cart array.

A `useEffect` saves the cart to `localStorage` on every change so it survives page refreshes.

---

### `frontend/src/context/ProductsContext.jsx`
**The product catalogue — connects the menu to the database.**

On mount, fetches all products from `GET /api/products` and stores them in state. Exposes `loading` and `error` states so the menu can show skeleton cards while loading and an error message if the fetch fails.

Admin mutations (`addProduct`, `updateProduct`, `deleteProduct`) call the API and update local state on success — so changes appear on the customer menu immediately without a page refresh.

---

### `frontend/src/pages/Menu.jsx`
**The main customer screen.**

Reads products from `ProductsContext`. Uses `useMemo` to filter by category and search text — only recalculates when those values change. Shows skeleton cards while `loading` is true. Shows an error message if `error` is set.

Handles adding to cart with the full chain: `addItem` → cart reducer → `useEffect` saves to localStorage → CartButton bumps → fly animation → toast notification.

---

### `frontend/src/pages/Checkout.jsx`
**The most complex page in the app.**

Manages a state machine with three screens: `summary` → `loading` → `success`.

Key sequence on confirm:
1. Snapshots the cart before clearing
2. Plays the queue animation (4 steps)
3. Generates a unique order ID
4. POSTs the order to `/api/orders` — saved permanently to MongoDB
5. Dispatches `CLEAR_CART`
6. Shows the receipt using the snapshot

---

### `frontend/src/pages/ProductDetails.jsx`
**Single product view.**

Reads the product `_id` from the URL via `useParams`, finds the matching product in `ProductsContext`. Shows the hero image, description, quantity selector, and Add to Order button. Uses `useRef` to get the image's screen position for the fly-to-cart animation.

---

### `frontend/src/pages/Cart.jsx`
**Order review page.**

Reads directly from `CartContext`. The trash button sets `removingId` state which triggers the slide-out animation — after 280ms the item is actually removed so the animation has time to play. The + and − buttons call `updateQuantity` which goes through the cart reducer.

---

### `frontend/src/admin/pages/AdminDashboard.jsx`
**Staff control panel.**

Fetches orders from `GET /api/orders` on mount using `useEffect`. Reads products from `ProductsContext`. All product mutations (add, edit, delete) call the API through `ProductsContext` functions which update both MongoDB and local state.

Uses `useState` to control two modals: the product form (add/edit) and the delete confirmation.

---

### `frontend/src/admin/pages/AdminLogin.jsx`
**Staff login page.**

Calls `POST /api/auth/login` with the entered credentials. On success, sets `localStorage.isAdmin = 'true'` and navigates to the dashboard. On failure, shows a shake animation and error message. Uses `useState` for all form fields, error state, and loading state.

---

### `frontend/src/components/admin/ProtectedRoute.jsx`
**Frontend route guard.**

Checks `localStorage.isAdmin === 'true'`. If true, renders the wrapped page. If false, redirects to `/admin-login`. Lives in `components/` not `pages/` because it's a reusable wrapper, not a page itself.

Works alongside `authMiddleware.js` on the backend — two separate layers of protection.

---

### `frontend/src/components/cart/CartButton.jsx`
**The persistent cart button in the header.**

Uses `useEffect` to watch `itemCount` — when it increases, triggers a bump animation via `useAnimation`. Registers its DOM position with `FlyContext` so fly animations know where to aim. Shows a badge with the item count that springs in with an overshoot animation.

---

### `frontend/vite.config.js`
**Frontend build configuration.**

In development, proxies all `/api/*` requests to `http://localhost:5000` so the frontend and backend can communicate without CORS issues. Also configures the PWA plugin for offline support and installability.

---

### `backend/.env` / `frontend/.env`
**Environment-specific configuration — never committed to git.**

`backend/.env` contains the MongoDB connection string, port, and admin credentials. `frontend/.env` contains the backend API URL. These files are in `.gitignore` — each environment (local, Render, Vercel) has its own copy with its own values.

---

*CRMB Artisan Bakery & Café — Internal Technical Reference*
