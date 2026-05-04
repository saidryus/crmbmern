# CRMB Kiosk — Data Flow Guide
### Tracing What Happens at Every Step of the Customer Journey

---

> **Who this is for:** Anyone who wants to understand exactly what the app does behind the scenes at each moment — from the customer tapping the screen to the receipt printing. Every file, function, and storage operation is named.

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

**What happens when the app first loads:**

```
Browser opens localhost:5173
    ↓
index.html loads → loads main.jsx
    ↓
main.jsx: ReactDOM.createRoot().render(<App />)
    ↓
App.jsx renders all Providers in order:
  ProductsProvider → CartProvider → AudioProvider → FlyProvider → ToastProvider
    ↓
ProductsProvider runs loadProducts():
  → Checks localStorage for 'crmb_products'
  → If found: uses saved products
  → If not found: copies from products.js → saves to localStorage
    ↓
CartProvider runs loadCart():
  → Checks localStorage for 'crmb_cart'
  → If found: restores saved cart
  → If not found: starts with empty []
    ↓
React Router reads the URL → renders Splash page
    ↓
Splash.jsx renders
  → Checks localStorage for 'crmb_order_history'
  → If orders exist: shows "Welcome back ♩"
  → useIdleTimeout starts 2-minute countdown
```

**Files involved:** `main.jsx`, `App.jsx`, `ProductsContext.jsx`, `CartContext.jsx`, `Splash.jsx`, `useIdleTimeout.js`

---

## 2️⃣ Splash Screen → Menu

**What happens when the customer taps the screen:**

```
Customer taps anywhere on Splash
    ↓
onClick fires on the motion.div wrapper
    ↓
playNav() from useSound → plays soft descending tick (Web Audio API)
    ↓
navigate('/menu') from useNavigate
    ↓
React Router updates the URL to /menu
    ↓
AnimatePresence in App.jsx detects route change
  → Calculates direction: depth(menu) > depth(splash) → dir = +1 → slide right
  → Old page (Splash) exits: slides left at 30%
  → New page (Menu) enters: slides in from right at 60%
    ↓
Menu.jsx renders
  → useState: loading = true
  → setTimeout 900ms → loading = false (skeleton → real cards)
  → useProducts() reads products from ProductsContext
  → Filters products by activeCategory ('All') and search ('')
  → Renders 6 SkeletonCards for 900ms, then ProductCards
```

**Files involved:** `Splash.jsx`, `useSound.js`, `App.jsx`, `Menu.jsx`, `ProductsContext.jsx`, `SkeletonCard.jsx`

---

## 3️⃣ Browsing the Menu

**What happens when the customer changes category:**

```
Customer taps "Pastries" filter pill
    ↓
playSelect() from useSound → plays triangle mid-pop
    ↓
setActiveCategory('Pastries') → local state updates
    ↓
useMemo recalculates filtered products:
  products.filter(p => p.category === 'Pastries' && p.name.includes(search))
    ↓
AnimatePresence mode="wait" → old grid fades out, new grid fades in
    ↓
ProductCards render with staggered entrance (delay: index * 0.05s)
```

**What happens when the customer searches:**

```
Customer types "latte" in search bar
    ↓
onChange fires → setSearch('latte')
    ↓
Animated X button appears (fade + rotate in)
    ↓
useMemo recalculates: products where name includes 'latte'
    ↓
Hero banner hides (AnimatePresence exit)
    ↓
Daily Special hides (AnimatePresence exit)
    ↓
Filtered results show: "Café Latte", "Matcha Latte", "Caramel Macchiato"
```

---

## 4️⃣ Adding an Item from the Menu

**What happens when the customer taps "Add" on a product card:**

```
Customer taps "Add" button on Chocolate Croissant card
    ↓
onClick fires → e.stopPropagation() (prevents card navigation)
    ↓
playAddToCart() from useSound → plays warm double-pop
    ↓
addItem(product) from useCart:
  → cartReducer receives ADD_ITEM action
  → Checks if product already in cart
  → If yes: increments quantity
  → If no: appends { ...product, quantity: 1 }
  → Returns new cart array
    ↓
useEffect in CartContext detects cart changed:
  → localStorage.setItem('crmb_cart', JSON.stringify(cart))
    ↓
setAddedId(product.id) → button changes to "Added" with checkmark
    ↓
flyToCart(product.image, imgRect) from useFly:
  → Reads cartRef.current.getBoundingClientRect() (cart button position)
  → Creates fly object: { id, imgSrc, from: {x,y}, to: {x,y} }
  → Adds to flies array → motion.img renders at product position
  → Animates: translate to cart button, scale 1→0.3, opacity 1→0
  → After 700ms: removes from flies array
    ↓
addToast({ title: "Chocolate Croissant added", subtitle: "₱120.00", image })
  → Adds to toasts array with unique id
  → ToastStack renders animated pill sliding up from bottom
  → After 2800ms: removes from toasts array
    ↓
CartButton detects itemCount increased (useEffect):
  → controls.start({ scale: [1, 1.2, 0.92, 1.06, 1] }) → bump animation
  → Badge re-mounts with new count → spring pop animation
    ↓
After 950ms: setAddedId(null) → button returns to "Add"
```

**Files involved:** `Menu.jsx`, `useSound.js`, `CartContext.jsx`, `FlyContext.jsx`, `ToastContext.jsx`, `CartButton.jsx`

---

## 5️⃣ Product Details Page

**What happens when the customer taps a product card:**

```
Customer taps the card body (not the Add button)
    ↓
onClick fires on motion.article
    ↓
playNav() from useSound
    ↓
navigate('/product/1') (for Chocolate Croissant)
    ↓
React Router renders ProductDetails.jsx
    ↓
useParams() reads id = "1"
    ↓
useProducts() gets products array
    ↓
products.find(p => p.id === 1) → finds the product
    ↓
Hero image renders with scale-in animation
    ↓
useCart() checks if product is already in cart:
  → If yes: shows "X already in your order" green banner
    ↓
Customer adjusts quantity with + / - buttons:
  → playQtyUp() or playQtyDown() from useSound
  → setQtyDir(1 or -1) → number slides up or down
  → setQty(qty + 1 or qty - 1)
    ↓
Customer taps "Add to Order":
  → for loop: addItem(product) × qty times
  → playAddToCart()
  → flyToCart(product.image, imgRef.current.getBoundingClientRect())
  → addToast(...)
  → setAdded(true) → button morphs to "Added to Order" (green)
  → After 1500ms: setAdded(false), setQty(1)
```

**Files involved:** `ProductDetails.jsx`, `useSound.js`, `CartContext.jsx`, `FlyContext.jsx`, `ToastContext.jsx`, `ProductsContext.jsx`

---

## 6️⃣ Cart Page

**What happens when the customer reviews their order:**

```
Customer taps "Order" button in header
    ↓
playNav() from useSound
    ↓
navigate('/cart')
    ↓
Cart.jsx renders
    ↓
useCart() reads: cart array, total, itemCount
    ↓
If cart is empty:
  → Shows animated coffee cup with steam
  → "Your table is empty ☕"
    ↓
If cart has items:
  → Renders each item with image, name, category, price × qty
  → Qty controls: + / - with animated number slide and flash ring
  → Trash button: playRemove() → setRemovingId(id) → item slides right + fades
    → After 280ms: removeItem(id) → item removed from cart
    → AnimatePresence layout prop: remaining items reflow smoothly
  → Summary card: subtotal, service charge, total (animates when total changes)
    ↓
Customer taps "Proceed to Checkout":
  → playClick() (via RippleButton)
  → Ripple effect spawns at tap coordinates
  → navigate('/checkout')
```

**Files involved:** `Cart.jsx`, `useSound.js`, `CartContext.jsx`, `RippleButton.jsx`

---

## 7️⃣ Checkout Flow

**What happens when the customer confirms their order:**

```
Customer taps "Confirm Order"
    ↓
MorphButton.handleClick():
  → setPressed(true)
  → Button animates: width 100% → 56px, borderRadius 12 → 28px
  → Label fades out, spinner fades in
  → After 320ms: calls handleConfirm()
    ↓
handleConfirm() in Checkout.jsx:
  → snapshot = cart.map(i => ({...i})) — saves cart before clearing
  → setOrderTotal(total) — saves total before clearing
  → setStatus('loading')
    ↓
LoadingScreen renders with QueueProgress:
  Step 1 (600ms):  "Received" 📋 — progress bar fills to 25%
  Step 2 (1200ms): "Preparing" 👨‍🍳 — fills to 50%
  Step 3 (1200ms): "Baking" 🔥 — fills to 75%
  Step 4 (800ms):  "Ready!" ✅ — fills to 100%
  Each step: icon springs in, connecting line animates, label updates
    ↓
After all steps + 600ms:
  → generateOrderId() → "CRMB-LX4K2A-F3R9"
  → Saves to localStorage 'crmb_order_history':
    { id, total, date, items: count, cartSnapshot: [...] }
  → playSuccess() → C major arpeggio plays (C5→E5→G5→C6)
  → clearCart() → cart becomes []
  → useEffect in CartContext → localStorage 'crmb_cart' = []
  → setStatus('success')
    ↓
SuccessScreen renders:
  → Receipt card springs up from below
  → Amber top stripe
  → Checkmark icon springs in with rotation
  → "Order Confirmed" fades up
  → Cart items reveal one by one (staggered, 70ms apart) — receipt printing effect
  → Order ID, total, status row fade in
  → "Thank you for choosing CRMB" fades in
  → Action buttons slide up
  → "Print Receipt" button fades in last
    ↓
Customer taps "Print Receipt":
  → playClick()
  → window.print()
  → CSS @media print: hides everything except #print-receipt
  → Browser print dialog opens
```

**Files involved:** `Checkout.jsx`, `useSound.js`, `CartContext.jsx`, `generateOrderId.js`, `formatPrice.js`, `index.css`

---

## 8️⃣ Admin Flow

**What happens when staff access the admin panel:**

```
Staff holds CRMB logo on Splash for 3 seconds
    ↓
useLongPress fires onProgress every 50ms:
  → setHoldProgress(elapsed / 3000) → 0 to 1
  → SVG circle strokeDashoffset animates → amber ring draws around logo
  → CRMB text glows brighter
    ↓
At 3 seconds: onComplete fires
  → setUnlocked(true)
  → "Staff access unlocked" toast springs up
  → After 900ms: navigate('/admin-login')
    ↓
AdminLogin.jsx renders
  → Dark espresso background, amber accents
  → Staff enters: username "crmb", password "admin"
  → handleSubmit():
    → Simulates 600ms delay
    → Checks credentials
    → If correct: localStorage.setItem('isAdmin', 'true') → navigate('/admin')
    → If wrong: setShaking(true) → form shakes animation → error message
    ↓
ProtectedRoute checks localStorage.getItem('isAdmin') === 'true'
  → If true: renders AdminDashboard
  → If false: redirects to /admin-login
    ↓
AdminDashboard renders:
  → useProducts() reads products from ProductsContext
  → Reads order history from localStorage
  → Calculates stats: order count, revenue, menu item count
    ↓
Staff taps "Add Item":
  → setModal({ type: 'add' })
  → ProductFormModal slides up
  → Staff fills form: name, description, price, category, image URL, toggles, tags
  → Taps "Add Product":
    → validate() checks required fields
    → addProduct(formData) in ProductsContext:
      → Generates new id (max existing id + 1)
      → Appends to products array
      → useEffect saves to localStorage 'crmb_products'
    → setModal(null) → modal slides out
    → New product appears in list with entrance animation
    → New product immediately visible on customer menu
    ↓
Staff taps Edit (pencil) on existing product:
  → setModal({ type: 'edit', product: p })
  → ProductFormModal opens pre-filled with product data
  → Staff changes price from ₱120 to ₱135
  → Taps "Save Changes":
    → updateProduct({ ...product, price: 135 })
    → products array updates
    → localStorage saves
    → Menu immediately shows new price
    ↓
Staff taps Delete (trash) on a product:
  → setDelTarget(product)
  → DeleteConfirmModal appears with product name
  → Staff taps "Delete":
    → deleteProduct(id)
    → Product removed from array
    → localStorage saves
    → Product disappears from list with exit animation
    → Product no longer appears on customer menu
    ↓
Staff taps Logout:
  → localStorage.removeItem('isAdmin')
  → navigate('/', { replace: true })
  → ProtectedRoute will now redirect to /admin-login
```

**Files involved:** `Splash.jsx`, `useLongPress.js`, `AdminLogin.jsx`, `ProtectedRoute.jsx`, `AdminDashboard.jsx`, `ProductsContext.jsx`

---

## 🔄 The Idle Timeout Flow

**What happens if a customer walks away:**

```
Customer starts browsing, gets distracted, walks away
    ↓
useIdleTimeout in App.jsx starts counting (2 minutes)
    ↓
Every user interaction (tap, scroll, move) resets the timer
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
    ↓
Next customer sees the Splash screen
```

**Note:** Admin routes are excluded from the idle timeout. Staff won't be kicked out while managing the menu.

---

## 💾 localStorage — The Complete Map

Every key stored in the browser:

| Key | What's stored | Set by | Read by |
|---|---|---|---|
| `crmb_cart` | Cart items array | CartContext | CartContext (on load) |
| `crmb_products` | Products array | ProductsContext | ProductsContext (on load) |
| `crmb_order_history` | Last 20 orders | Checkout.jsx | AdminDashboard, Splash |
| `isAdmin` | `"true"` string | AdminLogin.jsx | ProtectedRoute.jsx |

---

*CRMB Artisan Bakery & Café — Internal Technical Reference*
