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

In CRMB, "state" includes things like:
- What items are in the cart
- Which category filter is selected
- Whether the jazz radio is playing
- The full list of menu products

---

## 📍 Two Kinds of State

### 1. Local State — "This component's own whiteboard"

Some information only matters to one component. For example, the search bar in the menu only needs to know what the user typed — nothing else in the app cares about that.

This is handled with `useState` inside the component itself.

**Examples of local state in CRMB:**

| Component | What it remembers locally |
|---|---|
| `Menu.jsx` | Search text, active category, which item was just added |
| `Cart.jsx` | Which item is currently being removed (for animation) |
| `Checkout.jsx` | Whether we're on summary / loading / success screen |
| `AdminLogin.jsx` | Username, password, error message |
| `AdminDashboard.jsx` | Which modal is open, which product is being deleted |
| `NowPlaying.jsx` | Which track name is showing, whether player is expanded |
| `ProductDetails.jsx` | Selected quantity, whether item was just added |

### 2. Global State — "The shared whiteboard everyone can see"

Some information needs to be available to many different components at once. The cart is the best example — the menu needs to add to it, the cart page needs to display it, the checkout needs to read the total, and the cart button needs to show the count.

Passing this information manually from component to component would be like whispering a message through 10 people — it gets messy and breaks easily.

**Global state in CRMB is handled with React Context.** Think of it as a shared whiteboard that any component can read from or write to directly.

---

## 🗂️ The Five Global State Systems

---

### 1. Cart State (`CartContext`)

**What it stores:** Everything in the customer's current order.

**The data structure:**
```
cart = [
  { id: 1, name: "Chocolate Croissant", price: 120, quantity: 2, ... },
  { id: 6, name: "Matcha Latte", price: 165, quantity: 1, ... }
]
```

**Operations available:**
- `addItem(product)` — add one unit (or increment if already there)
- `removeItem(id)` — remove entirely
- `updateQuantity(id, qty)` — set exact amount
- `clearCart()` — empty everything (after checkout)
- `total` — automatically calculated sum
- `itemCount` — total units across all items

**Why `useReducer` instead of `useState`?**

The cart has 4 different ways it can change. With `useState` you'd have scattered logic everywhere. With `useReducer`, all the rules live in one place called `cartReducer`:

```
Action: ADD_ITEM    → find if it exists, increment or append
Action: REMOVE_ITEM → filter it out
Action: UPDATE_QTY  → set new quantity (remove if 0)
Action: CLEAR_CART  → return empty array
```

It's like having a rulebook. Anyone who wants to change the cart has to go through the rulebook — no shortcuts, no inconsistencies.

**Persistence:** Every time the cart changes, it's automatically saved to `localStorage` (the browser's built-in storage). If the page refreshes, the cart is restored from storage. The customer never loses their order.

---

### 2. Products State (`ProductsContext`)

**What it stores:** The complete menu — all products the kiosk can sell.

**Why it's global:** Both the customer-facing menu AND the admin panel need to read the same product list. The admin also needs to add, edit, and delete products. If they used separate data sources, changes in admin wouldn't show up on the menu.

**The data structure:**
```
products = [
  {
    id: 1,
    name: "Chocolate Croissant",
    price: 120,
    category: "Pastries",
    image: "https://...",
    available: true,
    bestSeller: true,
    tags: ["Contains Gluten", "Contains Dairy"]
  },
  ...12 total items
]
```

**Operations available:**
- `addProduct(p)` — admin adds a new item
- `updateProduct(p)` — admin edits an existing item
- `deleteProduct(id)` — admin removes an item
- `resetProducts()` — restore the original 12 items

**Seeding:** On first load, if `localStorage` has no products, the original 12 from `products.js` are used as starting data. After that, `localStorage` is the source of truth.

**Daily Special:** Automatically picks a featured product based on the day of the week (Sunday = product 1, Monday = product 6, etc.)

---

### 3. Audio State (`AudioContext`)

**What it stores:** The jazz radio player's current status.

**Why it's global:** The music needs to keep playing as the user navigates between pages. If the audio player lived inside a single page component, it would stop every time the user navigated away. By living at the app root, it persists for the entire session.

**What it tracks:**
- `playing` — is music currently playing?
- `loading` — is the stream buffering?
- `volume` — current volume (0 to 1)
- `stream` — which radio stream is active

**The audio element itself** is stored in a `useRef` — not in state — because it's a mutable object we control directly (play, pause, set volume) and we don't want React to re-render every time we touch it.

---

### 4. Toast State (`ToastContext`)

**What it stores:** The queue of pop-up notifications currently visible.

**Why it's global:** Any component deep in the tree (a product card inside the menu grid) needs to trigger a notification without passing a callback function down through every parent. Context makes `addToast()` available everywhere.

**The data structure:**
```
toasts = [
  { id: 1234567, title: "Croissant added", subtitle: "₱120.00", image: "..." },
  { id: 1234568, title: "Matcha Latte added", subtitle: "₱165.00", image: "..." }
]
```

Maximum 3 toasts at once. Each auto-removes after ~2.8 seconds.

---

### 5. Fly State (`FlyContext`)

**What it stores:** The list of currently-animating "fly to cart" images.

**Why it's global:** The flying image animation needs two pieces of information from two completely unrelated components:
- Where the product image is on screen (from the product card)
- Where the cart button is on screen (from the header)

These components have no parent-child relationship. Context is the only clean way to share this information.

---

## 💾 Where Data Lives — Storage Map

| Data | Where stored | Survives refresh? | Survives browser wipe? |
|---|---|---|---|
| Cart items | `localStorage` (`crmb_cart`) | ✅ Yes | ❌ No |
| Products/menu | `localStorage` (`crmb_products`) | ✅ Yes | ❌ No |
| Order history | `localStorage` (`crmb_order_history`) | ✅ Yes | ❌ No |
| Admin auth | `localStorage` (`isAdmin`) | ✅ Yes | ❌ No |
| Audio playing state | Memory only | ❌ No | ❌ No |
| Search text | Memory only | ❌ No | ❌ No |
| Active category | Memory only | ❌ No | ❌ No |

---

## 🔄 How State Changes Trigger UI Updates

This is the core of how React works:

```
User taps "Add" button
    ↓
addItem(product) is called
    ↓
CartContext updates the cart array
    ↓
React sees the cart changed
    ↓
Every component using useCart() re-renders
    ↓
CartButton shows new count
Cart page shows new item
Checkout shows new total
```

This happens automatically. You don't manually tell components to update — React watches the state and does it for you.

---

## ❓ Common Instructor Questions

**Q: Why not use Redux?**
Redux is a more powerful state management library, but it adds significant complexity. For a kiosk app with a clear, contained scope, React's built-in Context API is sufficient and much simpler to understand and maintain.

**Q: Why localStorage instead of a database?**
This app is designed to run on a single kiosk device without a backend server. localStorage is built into every browser, requires no setup, and works offline. The tradeoff is that data is tied to one device and one browser — acceptable for a single-device kiosk.

**Q: What happens if localStorage is full?**
localStorage has a ~5MB limit. Order history is capped at 20 entries, and the product list is small. In practice, this limit won't be reached.

**Q: Why does the cart use `useReducer` but products use `useState`?**
The cart has 4 distinct operations with specific rules (e.g. "if quantity reaches 0, remove the item"). `useReducer` centralises these rules. Products have simpler operations (replace the array) that `useState` handles cleanly.

---

*CRMB Artisan Bakery & Café — Internal Technical Reference*
