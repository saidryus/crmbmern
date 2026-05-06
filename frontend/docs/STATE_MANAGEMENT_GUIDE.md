# CRMB Kiosk — State Management Guide
### How Data Lives, Changes, and Flows Through the App

---

> **Who this is for:** Anyone who wants to understand how the app "remembers" things — what's in the cart, which products exist, whether you're online. No coding experience needed.

---

## 🧠 What Is "State"?

**State** is just a fancy word for *information the app needs to remember right now.*

Think of it like a whiteboard in a café kitchen:
- "Table 3 ordered a latte" — that's state
- "We're out of croissants" — that's state
- "The kiosk is offline" — that's state

When the whiteboard changes, everyone who's looking at it sees the update immediately.

---

## 📍 Two Kinds of State

### 1. Local State — "This component's own whiteboard"

Some information only matters to one component. The search bar only needs to know what the user typed — nothing else cares.

Handled with `useState` inside the component itself.

**Examples:**

| Component | What it remembers locally |
|---|---|
| `Menu.jsx` | Search text, active category, which item was just added |
| `Cart.jsx` | Which item is currently being removed (for animation) |
| `Checkout.jsx` | Whether we're on summary / loading / success screen |
| `AdminLogin.jsx` | Username, password, error message, loading state |
| `AdminDashboard.jsx` | Which modal is open, which product is being deleted, orders list |
| `ProductDetails.jsx` | Selected quantity, whether item was just added |

### 2. Global State — "The shared whiteboard everyone can see"

Some information needs to be available to many components at once. The cart is the best example — the menu adds to it, the cart page displays it, checkout reads the total, and the cart button shows the count.

**Global state in CRMB is handled with React Context.**

---

## 🗂️ The Five Global State Systems

---

### 1. Cart State (`CartContext`)

**What it stores:** Everything in the customer's current order.

**The data structure:**
```js
cart = [
  { _id: "683abc...", name: "Chocolate Croissant", price: 120, quantity: 2, ... },
  { _id: "683def...", name: "Matcha Latte", price: 165, quantity: 1, ... }
]
```

> **Note:** Products now come from MongoDB, so they use `_id` (a MongoDB ObjectId string) instead of a numeric `id`.

**Operations available:**
- `addItem(product)` — add one unit (or increment if already there)
- `removeItem(_id)` — remove entirely
- `updateQuantity(_id, qty)` — set exact amount
- `clearCart()` — empty everything (after checkout)
- `total` — automatically calculated sum
- `itemCount` — total units across all items

**Why `useReducer` instead of `useState`?**

The cart has 4 different ways it can change. With `useReducer`, all the rules live in one `cartReducer` function:

```
Action: ADD_ITEM    → find by _id, increment or append
Action: REMOVE_ITEM → filter out by _id
Action: UPDATE_QTY  → set new quantity (remove if 0)
Action: CLEAR_CART  → return empty array
```

**Persistence:** Every time the cart changes, it's automatically saved to `localStorage`. If the page refreshes, the cart is restored. The customer never loses their order.

---

### 2. Products State (`ProductsContext`)

**What it stores:** The complete menu — fetched live from the MongoDB database via the REST API.

**How it works:**
```
Component mounts
    ↓
useEffect calls GET /api/products
    ↓
Backend queries MongoDB
    ↓
Products array returned and stored in React state
    ↓
Menu renders with real data
```

**Why it's global:** Both the customer menu AND the admin panel read the same product list. Admin mutations (add/edit/delete) call the API and update local state — changes appear on the menu instantly.

**Operations available:**
- `addProduct(p)` — POST /api/products (admin)
- `updateProduct(p)` — PUT /api/products/:id (admin)
- `deleteProduct(_id)` — DELETE /api/products/:id (admin)
- `refreshProducts()` — re-fetch from the API
- `loading` — true while the initial fetch is in flight
- `error` — error message if the fetch failed

**Daily Special:** Automatically picks a featured product based on the day of the week.

---

### 3. Audio State (`AudioContext`)

**What it stores:** The jazz radio player's current status.

**Why it's global:** The music needs to keep playing as the user navigates between pages. By living at the app root, it persists for the entire session.

**What it tracks:** `playing`, `loading`, `volume`, `stream`

---

### 4. Toast State (`ToastContext`)

**What it stores:** The queue of pop-up notifications currently visible.

**Why it's global:** Any component deep in the tree needs to trigger a notification without passing callbacks through every parent.

Maximum 3 toasts at once. Each auto-removes after ~2.8 seconds.

---

### 5. Fly State (`FlyContext`)

**What it stores:** The list of currently-animating "fly to cart" images.

**Why it's global:** The flying image animation needs the position of the product card (source) and the cart button (destination) — two completely unrelated components. Context is the only clean way to share this.

---

## 💾 Where Data Lives — Storage Map

| Data | Where stored | Survives refresh? |
|---|---|---|
| Products / menu | **MongoDB Atlas** (via API) | ✅ Yes — permanent cloud storage |
| Orders | **MongoDB Atlas** (via API) | ✅ Yes — permanent cloud storage |
| Admin account | **MongoDB Atlas** (via API) | ✅ Yes — permanent cloud storage |
| Cart items | `localStorage` (`crmb_cart`) | ✅ Yes — until browser is cleared |
| Admin auth flag | `localStorage` (`isAdmin`) | ✅ Yes — until logout or browser clear |
| Audio playing state | Memory only | ❌ No |
| Search text | Memory only | ❌ No |

**Key change from the original app:** Products and orders used to live only in `localStorage` — tied to one device, wiped if the browser was cleared. Now they live in MongoDB Atlas — permanent, accessible from any device, never lost.

---

## 🔄 How State Changes Trigger UI Updates

```
Admin adds a new product in the dashboard
    ↓
addProduct() calls POST /api/products
    ↓
Backend saves to MongoDB, returns the new product
    ↓
ProductsContext appends it to the products array
    ↓
React sees products changed
    ↓
Every component using useProducts() re-renders
    ↓
Menu immediately shows the new product card
```

This happens automatically. You don't manually tell components to update.

---

## 🌐 The API Layer (`src/api/`)

All communication with the backend goes through four files:

```
src/api/
├── client.js     ← base fetch wrapper — adds auth header, handles errors
├── auth.js       ← login(), logout()
├── products.js   ← getProducts(), createProduct(), updateProduct(), deleteProduct()
└── orders.js     ← createOrder(), getOrders()
```

**`client.js`** is the foundation. Every API call goes through it:
- Prepends the backend URL (`VITE_API_URL` from `.env`)
- Adds `X-Admin-Logged-In: true` header when admin is logged in
- Throws a clear error if the response is not 2xx

This means if the backend URL ever changes, you update it in one place.

---

## ❓ Common Instructor Questions

**Q: Why not use Redux?**
Redux adds significant complexity. For this app's scope, React's built-in Context API with `useReducer` is sufficient and much simpler to understand.

**Q: Why does the cart still use localStorage if we have a database?**
The cart is temporary — it only exists while the customer is ordering. It doesn't need to be in the database until checkout. localStorage is perfect for this: fast, no network required, and it survives page refreshes. When the customer confirms their order, the cart is saved to MongoDB as an Order document, then cleared.

**Q: What happens if the backend is down?**
`ProductsContext` has an `error` state. If the API call fails, the menu shows "Could not load menu — make sure the backend is running." The cart still works (localStorage) but no products will be visible.

**Q: Why does the cart use `_id` instead of `id`?**
MongoDB automatically assigns a unique `_id` field to every document (e.g. `"683abc123..."`). The original app used numeric `id` fields from the static data file. Since products now come from MongoDB, we use `_id` throughout — in the cart reducer, cart operations, and all product lookups.

---

*CRMB Artisan Bakery & Café — Internal Technical Reference*
