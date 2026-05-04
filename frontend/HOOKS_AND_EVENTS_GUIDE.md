# CRMB Kiosk — Hooks, Events & How Everything Works
### A Plain-English Guide for the Whole Team

---

> **Who this is for:** Anyone on the team — designers, junior devs, or people who are just curious — who wants to understand *why* the app behaves the way it does. No deep coding knowledge required. We'll explain every concept before using it.

---

## 🧠 First: What Is a Hook?

In React, a **hook** is a special function that lets a component "hook into" a feature — like remembering a value, reacting to something changing, or sharing data with other components.

Think of hooks like **power outlets in a wall**. The wall (React) provides electricity (features). Your component plugs in (calls the hook) to use that power. You don't need to know how the electricity works — you just plug in.

All hooks start with the word `use`. Examples: `useState`, `useEffect`, `useCart`, `useSound`.

---

## 📦 The Two Types of Hooks in This Project

### 1. React's Built-in Hooks
These come with React itself. We use them everywhere.

### 2. Custom Hooks
These are hooks *we wrote* specifically for CRMB. They live in `src/hooks/` or are exported from `src/context/` files.

---

## ⚙️ React's Built-in Hooks — What They Do

---

### `useState` — Remembering a Value

**Plain English:** Gives a component a piece of memory. When that memory changes, the screen updates automatically.

**Real example from Cart.jsx:**
```js
const [removingId, setRemovingId] = useState(null);
```
- `removingId` is the current value (starts as `null`)
- `setRemovingId(id)` changes it
- When it changes, the cart re-renders and plays the removal animation

**Where it's used in CRMB:**
| File | What it remembers |
|---|---|
| `Splash.jsx` | Whether the user is returning, how far the long-press has progressed |
| `Menu.jsx` | Which category is selected, what's typed in search, which item was just added |
| `Cart.jsx` | Which item is currently being removed (for animation) |
| `Checkout.jsx` | Whether we're on the summary, loading, or success screen |
| `AdminLogin.jsx` | Username, password, error message, loading state |
| `AdminDashboard.jsx` | Which modal is open, which product is being deleted |
| `NowPlaying.jsx` | Which track is showing, whether the player is expanded |
| `ProductsContext.jsx` | The full list of products |
| `CartContext.jsx` | The cart items array |

---

### `useEffect` — Reacting to Changes

**Plain English:** "When something changes (or when the component first appears), do this thing."

It's like setting up a rule: *"Every time X happens, run Y."*

**Real example from CartContext.jsx:**
```js
useEffect(() => {
  localStorage.setItem('crmb_cart', JSON.stringify(cart));
}, [cart]);
```
- **What it does:** Every time `cart` changes, save it to the browser's storage
- **Why:** So if the page refreshes, the cart isn't lost
- The `[cart]` at the end is the **dependency array** — it tells React "only run this when `cart` changes"

**Real example from AudioContext.jsx:**
```js
useEffect(() => {
  const audio = new Audio();
  audio.preload = 'none';
  audioRef.current = audio;
  // ... set up event listeners ...
  return () => {
    audio.pause(); // cleanup when component unmounts
  };
}, []); // empty [] = run once on mount
```
- **Empty `[]`** means "run this once when the component first appears"
- The `return () => {}` part is a **cleanup function** — it runs when the component is removed

**Where it's used in CRMB:**
| File | What it reacts to |
|---|---|
| `CartContext.jsx` | Cart changes → saves to localStorage |
| `ProductsContext.jsx` | Products change → saves to localStorage |
| `AudioContext.jsx` | Component mounts → creates the audio player |
| `AudioContext.jsx` | Stream index changes → loads new radio stream |
| `useNetwork.js` | Component mounts → listens for online/offline events |
| `useIdleTimeout.js` | Component mounts → starts the idle timer |
| `Menu.jsx` | Component mounts → shows skeleton for 900ms then reveals products |
| `CartButton.jsx` | Item count increases → triggers the bump animation |
| `NowPlaying.jsx` | Playing state changes → rotates track names every 45s |

---

### `useRef` — Pointing at Something Without Causing Re-renders

**Plain English:** A ref is like a sticky note you attach to something. You can read or change what's on the note at any time, but changing it doesn't cause the screen to redraw.

Used for two things:
1. **Pointing at a DOM element** (an actual HTML element on screen)
2. **Storing a value that shouldn't trigger re-renders** (like a timer ID)

**Real example from CartButton.jsx:**
```js
const prevCount = useRef(itemCount);
```
- Stores the *previous* item count so we can compare it to the current one
- If we used `useState` here, updating it would cause an extra re-render

**Real example from FlyContext.jsx:**
```js
const cartRef = useRef(null);
// Later, CartButton does:
cartRef.current = buttonDOMNode;
```
- `cartRef.current` points to the actual cart button on screen
- When a product is added, we read `cartRef.current.getBoundingClientRect()` to find out where the button is on screen, so the flying image knows where to go

**Where it's used in CRMB:**
| File | What it points to |
|---|---|
| `CartButton.jsx` | The button DOM node (for FlyContext) + previous item count |
| `FlyContext.jsx` | The cart button's position on screen |
| `AudioContext.jsx` | The HTMLAudioElement (the actual audio player) |
| `useIdleTimeout.js` | The timer ID (so we can cancel it) |
| `useLongPress.js` | Timer ID, interval ID, start time, active state |
| `ProductDetails.jsx` | The hero image (so flyToCart knows where to start) |
| `App.jsx` | The previous route path (for slide direction calculation) |

---

### `useCallback` — Keeping a Function Stable

**Plain English:** Without this, every time a component re-renders, every function inside it gets recreated as a brand new function. `useCallback` says "keep the same function unless these specific things change."

**Why it matters:** If a function is passed to a child component or used in a `useEffect` dependency array, a new function reference every render would cause unnecessary re-renders or infinite loops.

**Real example from CartContext.jsx:**
```js
const addItem = (product) => dispatch({ type: 'ADD_ITEM', payload: product });
```
vs. in `FlyContext.jsx`:
```js
const flyToCart = useCallback((imgSrc, originRect) => {
  // ...
}, []); // stable — never recreated
```
`flyToCart` is passed via context to every product card. Without `useCallback`, every render would give every card a new function reference, causing unnecessary re-renders across the whole menu grid.

**Where it's used in CRMB:**
| File | Function kept stable |
|---|---|
| `FlyContext.jsx` | `flyToCart` |
| `AudioContext.jsx` | `toggle`, `setVolume` |
| `ToastContext.jsx` | `addToast` |
| `ProductsContext.jsx` | `addProduct`, `updateProduct`, `deleteProduct`, `resetProducts` |
| `useIdleTimeout.js` | `reset` (the timer reset function) |
| `useLongPress.js` | `start`, `cancel` |

---

### `useReducer` — Managing Complex State

**Plain English:** Like `useState` but for when you have multiple related pieces of state that change together in specific ways. Instead of calling `setState` directly, you "dispatch an action" and a central function (the reducer) decides what the new state should be.

Think of it like a **vending machine**: you press a button (dispatch an action), the machine's logic (reducer) decides what to give you (new state). You don't reach inside and change things directly.

**Real example from CartContext.jsx:**
```js
const [cart, dispatch] = useReducer(cartReducer, [], loadCart);

// To add an item:
dispatch({ type: 'ADD_ITEM', payload: product });

// The reducer handles it:
case 'ADD_ITEM': {
  const existing = state.find((i) => i.id === action.payload.id);
  if (existing) {
    return state.map((i) => i.id === action.payload.id
      ? { ...i, quantity: i.quantity + 1 } : i);
  }
  return [...state, { ...action.payload, quantity: 1 }];
}
```

**Why not just useState?** The cart has 4 different operations (add, remove, update, clear). Putting all that logic in one `cartReducer` function makes it easy to read, test, and extend. With `useState` you'd have scattered `setCart` calls everywhere.

**Where it's used:** Only in `CartContext.jsx` — the cart is the only state complex enough to need it.

---

### `useContext` — Reading Shared Data

**Plain English:** Lets any component read data that was "provided" higher up in the app, without passing it down through every parent component.

Think of it like a **company-wide announcement board**. Instead of the CEO whispering a message to a manager, who tells a team lead, who tells an employee — the message is just posted on the board and anyone can read it directly.

**Real example:**
```js
// In CartContext.jsx — posting to the board:
<CartContext.Provider value={{ cart, addItem, total }}>
  {children}
</CartContext.Provider>

// In Cart.jsx — reading from the board:
const { cart, total } = useContext(CartContext);
// Or via the custom hook:
const { cart, total } = useCart();
```

**Where it's used:** Every custom hook in this project (`useCart`, `useToast`, `useAudio`, `useFly`, `useProducts`) is just a wrapper around `useContext`.

---

### `useNavigate` — Moving Between Pages

**Plain English:** Gives a component the ability to send the user to a different page programmatically (not just by clicking a link).

**Real examples:**
```js
const navigate = useNavigate();
navigate('/menu');        // go to menu
navigate('/cart');        // go to cart
navigate(-1);             // go back (like browser back button)
navigate('/', { replace: true }); // go home and clear history
```

**Where it's used:**
| File | When it navigates |
|---|---|
| `Splash.jsx` | Tap anywhere → `/menu`; long press complete → `/admin-login` |
| `Menu.jsx` | Tap product card → `/product/:id`; tap logo → `/` |
| `ProductDetails.jsx` | Tap back → previous page |
| `Cart.jsx` | Tap Menu → `/menu`; tap Checkout → `/checkout` |
| `Checkout.jsx` | After success → `/menu` or `/` |
| `AdminLogin.jsx` | After login → `/admin`; back link → `/` |
| `AdminDashboard.jsx` | After logout → `/` |
| `CartButton.jsx` | Tap → `/cart` |
| `App.jsx` | Idle timeout → `/` |

---

### `useLocation` — Knowing Where You Are

**Plain English:** Tells a component what the current URL path is.

**Where it's used in CRMB:**
- `App.jsx` — reads the current path to calculate which direction the page slide animation should go (going deeper = slide right, going back = slide left)
- `App.jsx` — the idle timeout checks the path so it doesn't redirect admin users back to splash

---

### `useParams` — Reading URL Variables

**Plain English:** When a URL has a variable part (like `/product/4`), `useParams` lets you read that variable.

**Real example from ProductDetails.jsx:**
```js
const { id } = useParams();
// If URL is /product/4, then id = "4"
const product = products.find((p) => p.id === Number(id));
```

**Where it's used:** Only in `ProductDetails.jsx` to know which product to show.

---

### `useAnimation` — Controlling Animations Imperatively

**Plain English:** Normally Framer Motion animations are declarative ("animate to this state"). `useAnimation` gives you a controller so you can trigger animations from code, like "play this animation now."

**Real example from CartButton.jsx:**
```js
const controls = useAnimation();

// When item count increases:
controls.start({
  scale: [1, 1.2, 0.92, 1.06, 1], // bounce sequence
  transition: { duration: 0.42 }
});

// Applied to the button:
<motion.button animate={controls}>
```

**Where it's used:** Only in `CartButton.jsx` for the bump animation when items are added.

---

## 🪝 Custom Hooks — Built for CRMB

---

### `useIdleTimeout` — Auto-Reset the Kiosk

**File:** `src/hooks/useIdleTimeout.js`

**Plain English:** A kiosk is a shared device. If a customer walks away mid-order, the next person shouldn't see their cart. This hook watches for inactivity and resets the app after 2 minutes.

**How it works:**
1. Sets a 2-minute countdown timer
2. Listens for any user activity: mouse move, touch, key press, scroll, click
3. Every time activity is detected, the timer resets to 2 minutes
4. If 2 minutes pass with no activity → fires the callback (navigate to splash)

**Where it's used:** `App.jsx` — wraps the entire app. Admin routes are excluded so staff don't get kicked out mid-session.

**Events it listens to:** `mousemove`, `mousedown`, `touchstart`, `keydown`, `scroll`, `click`

---

### `useLongPress` — Hidden Admin Access

**File:** `src/hooks/useLongPress.js`

**Plain English:** Detects when someone holds their finger/mouse down on something for a set amount of time. Used to trigger the hidden admin login — customers won't accidentally discover it, but staff know to hold the logo.

**How it works:**
1. User presses down on the CRMB logo
2. A timer starts counting to 3 seconds
3. Every 50ms, it reports progress (0 to 1) — used to draw the circular ring
4. If the user releases early → progress resets, nothing happens
5. If they hold for 3 full seconds → "Staff access unlocked" toast appears, navigates to admin login

**Returns:** Event handler props to spread onto any element:
- `onMouseDown` / `onTouchStart` → starts the timer
- `onMouseUp` / `onMouseLeave` / `onTouchEnd` → cancels if released early

**Where it's used:** `Splash.jsx` — attached to the CRMB wordmark

**Why not just a button?** A regular button would be visible and obvious. A long press is invisible to customers but discoverable by staff who know about it.

---

### `useNetwork` — Online/Offline Detection

**File:** `src/hooks/useNetwork.js`

**Plain English:** Watches whether the device has an internet connection and returns `true` (online) or `false` (offline) in real time.

**How it works:**
1. Reads `navigator.onLine` immediately (browser's built-in connectivity check)
2. Listens for `online` and `offline` events on the window
3. Updates the returned value whenever connectivity changes

**Where it's used:**
- `OfflineBadge.jsx` — shows the floating "Offline Mode" pill when disconnected
- `Checkout.jsx` — shows a warning banner and disables checkout confidence when offline

---

### `useSound` — Synthesized UI Sounds

**File:** `src/hooks/useSound.js`

**Plain English:** Plays short sound effects when users interact with the app. All sounds are generated mathematically using the browser's Web Audio API — no audio files needed, works offline.

**Why synthesized sounds?** No file downloads, no loading time, works in offline/PWA mode, and the sounds are perfectly consistent every time.

**The 8 sounds:**

| Function | Sound | Triggered by |
|---|---|---|
| `playNav` | Soft descending tick | Navigation buttons, back buttons, logo |
| `playClick` | Crisp mid tick | RippleButton (Checkout, Browse Menu, etc.) |
| `playQtyUp` | Bright ascending tick | + quantity button |
| `playQtyDown` | Soft descending tick | − quantity button |
| `playAddToCart` | Warm double-pop | Add button on menu cards and product detail |
| `playRemove` | Low descending thud | Trash button in cart |
| `playSuccess` | C major arpeggio (C→E→G→C) | Order confirmed |
| `playSelect` | Triangle mid-pop | Category filter pills, NowPlaying expand |

**Where it's used:** Splash, Menu, ProductDetails, Cart, Checkout, CartButton, NowPlaying, RippleButton

---

## 🌐 Context Hooks — Shared State Across the App

These are hooks that come with their own "Provider" — a wrapper that makes the data available to all components inside it.

---

### `useCart` — The Shopping Cart

**Context file:** `src/context/CartContext.jsx`

**Plain English:** Gives any component access to the cart — what's in it, how to add/remove items, and the total price.

**What it provides:**
| Value | Type | What it is |
|---|---|---|
| `cart` | Array | List of items, each with product info + quantity |
| `addItem(product)` | Function | Add one of this product (or increment if already there) |
| `removeItem(id)` | Function | Remove a product entirely |
| `updateQuantity(id, qty)` | Function | Set exact quantity (removes if qty reaches 0) |
| `clearCart()` | Function | Empty the cart (called after checkout) |
| `total` | Number | Sum of all prices × quantities |
| `itemCount` | Number | Total units across all items (shown on cart badge) |

**Persistence:** Cart is saved to `localStorage` automatically. Survives page refreshes.

**Used in:** Menu, ProductDetails, Cart, Checkout, CartButton

---

### `useToast` — Pop-up Notifications

**Context file:** `src/context/ToastContext.jsx`

**Plain English:** Shows a small notification that slides up from the bottom of the screen and disappears after a few seconds. Used to confirm when an item is added to the cart.

**What it provides:**
| Value | What it does |
|---|---|
| `addToast({ title, subtitle, image, duration })` | Shows a notification |

**Used in:** Menu (when Add is tapped), ProductDetails (when Add to Order is tapped)

---

### `useAudio` — Jazz Radio Player

**Context file:** `src/context/AudioContext.jsx`

**Plain English:** Controls the background jazz radio stream. Lives at the app root so music keeps playing as you navigate between pages.

**What it provides:**
| Value | What it is |
|---|---|
| `playing` | `true` if music is currently playing |
| `loading` | `true` if the stream is buffering |
| `toggle()` | Start or stop playback (with fade in/out) |
| `volume` | Current volume (0 to 1) |
| `setVolume(v)` | Change the volume |
| `stream` | Current stream info `{ name, genre }` |

**Used in:** NowPlaying component (the jazz player widget in the menu header and splash screen)

---

### `useFly` — Flying Image Animation

**Context file:** `src/context/FlyContext.jsx`

**Plain English:** When you tap "Add" on a product, a small thumbnail of that product flies across the screen toward the cart button. This hook makes that possible by sharing the cart button's screen position with the product cards.

**What it provides:**
| Value | What it does |
|---|---|
| `flyToCart(imgSrc, originRect)` | Launches the fly animation from a position toward the cart |
| `cartRef` | A reference that CartButton attaches to itself |

**How the two sides connect:**
- CartButton says: "I'm here" (attaches `cartRef` to its DOM node)
- Product card says: "I'm here, fly to wherever cartRef is" (calls `flyToCart`)
- FlyContext calculates the path and animates a floating image between them

**Used in:** Menu (product cards), ProductDetails (hero image), CartButton (registers its position)

---

### `useProducts` — The Menu Catalogue

**Context file:** `src/context/ProductsContext.jsx`

**Plain English:** The single source of truth for all products. Both the customer-facing menu and the admin panel read from and write to this same list. Changes made in the admin panel appear on the menu immediately.

**What it provides:**
| Value | What it does |
|---|---|
| `products` | Full array of all products |
| `categories` | `['All', 'Bread', 'Pastries', 'Drinks']` |
| `dailySpecial` | Today's featured product (rotates by day of week) |
| `addProduct(p)` | Add a new product (admin only) |
| `updateProduct(p)` | Edit an existing product (admin only) |
| `deleteProduct(id)` | Remove a product (admin only) |
| `resetProducts()` | Restore the original 12 products |

**Persistence:** Products are saved to `localStorage` under `crmb_products`. On first load, the original 12 products from `products.js` are used as the starting data.

**Used in:** Menu, ProductDetails, AdminDashboard

---

## 🎬 Events — Things That Happen in the Browser

Events are things the browser detects and tells your code about. Here are the key ones used in CRMB:

---

### Mouse & Touch Events

| Event | What triggers it | Used in |
|---|---|---|
| `onClick` | User taps or clicks | Every button in the app |
| `onMouseDown` | Mouse button pressed down | `useLongPress` — starts the hold timer |
| `onMouseUp` | Mouse button released | `useLongPress` — cancels if released early |
| `onMouseLeave` | Cursor moves off the element | `useLongPress` — cancels if cursor drifts away |
| `onTouchStart` | Finger touches screen | `useLongPress` — starts the hold timer on mobile |
| `onTouchEnd` | Finger lifts off screen | `useLongPress` — cancels if released early |
| `onTouchCancel` | Touch interrupted (e.g. phone call) | `useLongPress` — cancels gracefully |

---

### Window Events

| Event | What triggers it | Used in |
|---|---|---|
| `mousemove` | Mouse moves anywhere | `useIdleTimeout` — resets the idle timer |
| `mousedown` | Any mouse click | `useIdleTimeout` — resets the idle timer |
| `touchstart` | Any touch on screen | `useIdleTimeout` — resets the idle timer |
| `keydown` | Any key pressed | `useIdleTimeout` — resets the idle timer |
| `scroll` | Page scrolls | `useIdleTimeout` — resets the idle timer |
| `click` | Any click | `useIdleTimeout` — resets the idle timer |
| `online` | Device connects to internet | `useNetwork` — sets `online = true` |
| `offline` | Device loses internet | `useNetwork` — sets `online = false` |

---

### Audio Events

These are events on the `HTMLAudioElement` (the actual audio player object):

| Event | What triggers it | Used in |
|---|---|---|
| `play` | Audio starts playing | `AudioContext` — sets `playing = true` |
| `pause` | Audio pauses | `AudioContext` — sets `playing = false` |
| `waiting` | Stream is buffering | `AudioContext` — sets `loading = true` |
| `canplay` | Buffer ready, can play | `AudioContext` — sets `loading = false` |
| `error` | Stream failed to load | `AudioContext` — tries the next stream URL |

---

### Form Events

| Event | What triggers it | Used in |
|---|---|---|
| `onChange` | Input value changes | Search bar, admin form fields |
| `onSubmit` | Form submitted | AdminLogin form |
| `onError` | Image fails to load | Admin product form (hides broken image preview) |

---

## 🗺️ How It All Connects — The Big Picture

```
App.jsx
│
├── ProductsProvider  ← products list, add/edit/delete
│   ├── CartProvider  ← cart items, totals
│   │   ├── AudioProvider  ← jazz radio
│   │   │   ├── FlyProvider  ← fly-to-cart animation
│   │   │   │   ├── ToastProvider  ← notifications
│   │   │   │   │   ├── OfflineBadge  (useNetwork)
│   │   │   │   │   ├── Splash  (useLongPress, useSound)
│   │   │   │   │   ├── Menu  (useProducts, useCart, useToast, useFly, useSound)
│   │   │   │   │   ├── ProductDetails  (useProducts, useCart, useToast, useFly, useSound)
│   │   │   │   │   ├── Cart  (useCart, useSound)
│   │   │   │   │   ├── Checkout  (useCart, useNetwork, useSound)
│   │   │   │   │   ├── AdminLogin
│   │   │   │   │   └── AdminDashboard  (useProducts)
│   │   │   │   │
│   │   │   │   └── CartButton  (useCart, useFly, useSound, useAnimation)
│   │   │   │
│   │   │   └── NowPlaying  (useAudio, useSound)
│   │   │
│   │   └── RippleButton  (useSound)
│   │
│   └── useIdleTimeout  (in AppRoutes — watches the whole app)
```

---

## 🔄 The Full Flow: What Happens When You Add an Item

Here's every hook and event that fires when a customer taps "Add" on a product card:

1. **`onClick`** fires on the Add button
2. **`playAddToCart()`** from `useSound` — plays the double-pop sound
3. **`addItem(product)`** from `useCart` — adds the item to the cart array
4. **`useEffect`** in `CartContext` — detects cart changed, saves to `localStorage`
5. **`flyToCart(imgSrc, rect)`** from `useFly` — launches the flying image animation
6. **`addToast(...)`** from `useToast` — shows the "item added" notification
7. **`useEffect`** in `CartButton` — detects `itemCount` increased, triggers bump animation via `useAnimation`
8. **`AnimatePresence`** in `CartButton` — animates the badge number changing

All of that happens in under 100 milliseconds from a single tap.

---

## 🔐 The Admin Access Flow

1. Customer sees the Splash screen
2. Staff member **holds the CRMB logo for 3 seconds**
3. `useLongPress` fires `onProgress` every 50ms → draws the amber ring around the logo
4. At 3 seconds, `onComplete` fires → "Staff access unlocked" toast appears
5. After 900ms, `useNavigate` sends to `/admin-login`
6. Staff enters `crmb` / `admin`
7. On success: `localStorage.setItem('isAdmin', 'true')` + navigate to `/admin`
8. `ProtectedRoute` checks `localStorage` before rendering any `/admin` page
9. On logout: `localStorage.removeItem('isAdmin')` + navigate to `/`

---

## 📱 PWA & Offline

The app is a **Progressive Web App** — it can be installed on a tablet like a native app and works without internet.

- **Service Worker** (generated by `vite-plugin-pwa`) caches all JS, CSS, and HTML
- **`useNetwork`** detects when internet is lost and shows the `OfflineBadge`
- **`localStorage`** keeps cart, products, and order history available offline
- The jazz radio stream requires internet — it stops when offline, but everything else works

---

*CRMB Artisan Bakery & Café — Internal Technical Reference*
*Last updated: 2026*
