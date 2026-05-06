# CRMB Kiosk — Data Flow Guide
### Tracing What Happens at Every Step of the Customer Journey

---

> **Who this is for:** Anyone who wants to understand exactly what the app does behind the scenes at each moment — from the customer tapping the screen to the receipt printing. Every file, function, API call, and database operation is named.

---

## 🗺️ The Complete Customer Journey

```
Splash Screen
    ↓ tap anywhere
Menu Page
    ↓ tap a product card
Product Details
    ↓ tap "Add to Order"
Menu Page (back)
    ↓ tap "Order" button
Cart Page
    ↓ tap "Proceed to Checkout"
Checkout Page
    ↓ tap "Confirm Order"
Loading / Queue Screen
    ↓ (2–4 seconds)
Success / Receipt Screen
    ↓ tap "New Order"
Splash Screen
```

---

## 1️⃣ App Startup

```
Browser opens localhost:5173 (or crmbmern.vercel.app)
    ↓
index.html loads → loads main.jsx
    ↓
main.jsx: ReactDOM.createRoot().render(<App />)
    ↓
App.jsx renders all Providers:
  ProductsProvider → CartProvider → AudioProvider → FlyProvider → ToastProvider
    ↓
ProductsProvider mounts → useEffect fires:
  → calls GET /api/products (via src/api/products.js)
  → fetch hits https://crmb-backend.onrender.com/api/products
  → Express productRoutes.js handles the request
  → Product.find() queries MongoDB Atlas
  → Returns array of 12 product documents
  → products state set, loading = false
    ↓
CartProvider checks localStorage for 'crmb_cart'
  → Restores any saved cart items
    ↓
React Router reads the URL → renders Splash page
```

**Files involved:** `main.jsx`, `App.jsx`, `ProductsContext.jsx`, `api/products.js`, `api/client.js`, `backend/routes/productRoutes.js`, `backend/models/Product.js`, `CartContext.jsx`

---

## 2️⃣ Splash Screen → Menu

```
Customer taps anywhere on Splash
    ↓
playNav() → soft descending tick (Web Audio API)
    ↓
navigate('/menu')
    ↓
AnimatePresence detects route change → slide right animation
    ↓
Menu.jsx renders
  → useProducts() reads products from ProductsContext (already loaded)
  → useMemo filters products: available === true
  → Renders ProductCards with staggered entrance animations
```

**Files involved:** `Splash.jsx`, `useSound.js`, `App.jsx`, `Menu.jsx`, `ProductsContext.jsx`

---

## 3️⃣ Adding an Item from the Menu

```
Customer taps "Add" on Chocolate Croissant card
    ↓
e.stopPropagation() — prevents card navigation
    ↓
playAddToCart() → warm double-pop sound
    ↓
addItem(product) from useCart:
  → cartReducer receives ADD_ITEM action
  → Checks if product._id already in cart
  → If yes: increments quantity
  → If no: appends { ...product, quantity: 1 }
    ↓
useEffect in CartContext:
  → localStorage.setItem('crmb_cart', JSON.stringify(cart))
    ↓
setAddedId(product._id) → button shows "Added" with checkmark
    ↓
flyToCart(product.image, imgRect) → thumbnail flies to cart button
    ↓
addToast({ title: "Chocolate Croissant added", ... })
    ↓
CartButton detects itemCount increased → bump animation
    ↓
After 950ms: setAddedId(null) → button returns to "Add"
```

**Files involved:** `Menu.jsx`, `useSound.js`, `CartContext.jsx`, `FlyContext.jsx`, `ToastContext.jsx`, `CartButton.jsx`

---

## 4️⃣ Checkout Flow

```
Customer taps "Confirm Order"
    ↓
MorphButton animates: full-width → small circle, label → spinner
    ↓
handleConfirm() in Checkout.jsx:
  → snapshot = cart.map(i => ({...i})) — saves cart before clearing
  → setOrderTotal(total)
  → setStatus('loading')
    ↓
Queue animation plays (4 steps, ~4 seconds total):
  received → preparing → baking → ready
    ↓
generateOrderId() → "CRMB-LX4K2A-F3R9"
    ↓
createOrder() from src/api/orders.js:
  → POST /api/orders
  → Body: { orderId, items: [...], total }
  → Express orderRoutes.js handles the request
  → Order.create() saves to MongoDB Atlas
  → Order document stored permanently in the database
    ↓
playSuccess() → C major arpeggio
    ↓
clearCart() → cart = []
    ↓
localStorage 'crmb_cart' = []
    ↓
setStatus('success') → receipt screen renders
```

**Files involved:** `Checkout.jsx`, `api/orders.js`, `api/client.js`, `backend/routes/orderRoutes.js`, `backend/models/Order.js`, `CartContext.jsx`, `generateOrderId.js`

---

## 5️⃣ Admin Flow

```
Staff navigates to /admin-login
    ↓
AdminLogin.jsx renders
    ↓
Staff enters: username "crmb", password "admin123"
    ↓
handleSubmit() calls login() from src/api/auth.js:
  → POST /api/auth/login
  → Body: { username, password }
  → Express authRoutes.js handles the request
  → Admin.findOne({ username }) queries MongoDB
  → admin.matchPassword(password) → bcrypt.compare()
  → If match: returns { success: true, username }
  → login() sets localStorage.isAdmin = 'true'
  → navigate('/admin')
    ↓
ProtectedRoute checks localStorage.isAdmin === 'true'
  → Renders AdminDashboard
    ↓
AdminDashboard mounts:
  → useProducts() reads products (already in context)
  → getOrders() from src/api/orders.js:
    → GET /api/orders (with X-Admin-Logged-In: true header)
    → protect() middleware checks the header
    → Order.find().sort({ createdAt: -1 }) queries MongoDB
    → Returns all orders, newest first
  → Stats calculated: order count, revenue, menu item count
    ↓
Staff taps "Add Item":
  → ProductFormModal opens
  → Staff fills form and taps "Add Product"
  → addProduct(formData) in ProductsContext:
    → createProduct() from src/api/products.js
    → POST /api/products (with X-Admin-Logged-In: true header)
    → protect() middleware validates header
    → Product.create() saves to MongoDB Atlas
    → New product returned and appended to products state
  → New product card appears on customer menu immediately
    ↓
Staff taps Logout:
  → logout() from src/api/auth.js
  → localStorage.removeItem('isAdmin')
  → navigate('/')
```

**Files involved:** `AdminLogin.jsx`, `api/auth.js`, `backend/routes/authRoutes.js`, `backend/models/Admin.js`, `ProtectedRoute.jsx`, `AdminDashboard.jsx`, `api/orders.js`, `api/products.js`, `backend/middleware/authMiddleware.js`, `ProductsContext.jsx`

---

## 6️⃣ The Idle Timeout Flow

```
Customer starts browsing, gets distracted, walks away
    ↓
useIdleTimeout in App.jsx starts counting (2 minutes)
    ↓
Every user interaction resets the timer
    ↓
2 minutes pass with no interaction
    ↓
onIdle callback fires:
  → Checks: current path is not '/' and not '/admin'
  → navigate('/')
    ↓
App slides back to Splash screen
    ↓
Cart is NOT cleared — customer can return and continue
```

Admin routes are excluded — staff won't be kicked out while managing the menu.

---

## 💾 Data Storage Map

| Data | Where stored | Permanent? | Set by | Read by |
|---|---|---|---|---|
| Products | MongoDB Atlas | ✅ Yes | Admin dashboard / seed.js | Menu, ProductDetails, AdminDashboard |
| Orders | MongoDB Atlas | ✅ Yes | Checkout.jsx | AdminDashboard |
| Admin account | MongoDB Atlas | ✅ Yes | seed.js | authRoutes.js (login) |
| Cart items | localStorage (`crmb_cart`) | Until cleared | CartContext | CartContext, Cart, Checkout |
| Admin auth flag | localStorage (`isAdmin`) | Until logout | api/auth.js | ProtectedRoute, api/client.js |

---

## 🌐 API Request Flow

Every API call follows this path:

```
Frontend component
    ↓
src/api/*.js function (e.g. getProducts())
    ↓
src/api/client.js apiFetch()
  → adds Content-Type: application/json
  → adds X-Admin-Logged-In: true (if admin)
  → prepends VITE_API_URL
    ↓
HTTP request to Render backend
    ↓
Express route handler (e.g. productRoutes.js)
  → protect() middleware (if admin route)
    ↓
Mongoose model query (e.g. Product.find())
    ↓
MongoDB Atlas
    ↓
Response flows back up the chain
```

---

*CRMB Artisan Bakery & Café — Internal Technical Reference*
