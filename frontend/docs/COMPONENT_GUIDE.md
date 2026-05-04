# CRMB Kiosk — Component Guide
### What Every File Does, Why It Exists, and How It Connects

---

> **Who this is for:** Anyone who opens a file and wants to immediately understand what it does, what data it needs, and what it produces on screen. Every hook is explained — what it is, why this component needs it, and exactly what it does here.

---

## 🧩 What Is a Component?

A **component** is a self-contained piece of UI. Think of it like a LEGO brick — it has a specific shape, does one job, and can be combined with other bricks to build something bigger.

In CRMB, every `.jsx` file is a component. Some are full pages (like `Menu.jsx`). Some are small reusable pieces (like `CartButton.jsx`).

**The rule:** Each component should do one thing well.

---

## 📄 Pages — Full Screens

---

### `Splash.jsx` — The Welcome Screen

**What it shows:** The CRMB logo, "Tap to Begin" button, floating music notes, jazz radio player, and optionally a "Welcome back" greeting.

**What it does:**
- Plays the intro animation when the app loads
- Detects if the customer has ordered before
- Listens for the hidden admin long-press on the CRMB wordmark
- Navigates to `/menu` when tapped anywhere

**Key interactions:**
- Tap anywhere → go to menu
- Hold CRMB logo 3 seconds → admin access

---

#### Hooks Used in `Splash.jsx`

**`useState` — 3 separate pieces of memory**

```js
const [returning, setReturning] = useState(false);
const [holdProgress, setHoldProgress] = useState(0);
const [unlocked, setUnlocked] = useState(false);
```

- `returning` — Did this customer order before? Starts as `false`. Set to `true` if `crmb_order_history` exists in localStorage. When `true`, shows the "Welcome back ♩" greeting.
- `holdProgress` — A number from 0 to 1 representing how far through the 3-second hold the user is. At 0 the ring is invisible. At 1 the ring is fully drawn. Updated every 50ms by `useLongPress`.
- `unlocked` — Becomes `true` the moment the 3-second hold completes. Triggers the "Staff access unlocked" toast and prevents the normal tap-to-menu from firing.

**`useEffect` — Check order history on load**

```js
useEffect(() => {
  const history = localStorage.getItem('crmb_order_history');
  if (history && JSON.parse(history).length > 0) setReturning(true);
}, []);
```

The empty `[]` means this runs exactly once — when the Splash screen first appears. It reads localStorage to check if the customer has ordered before. If yes, `setReturning(true)` triggers the welcome back message. This is a side effect (reading from storage) so it belongs in `useEffect`, not directly in the component body.

**`useNavigate` — Move to another page**

```js
const navigate = useNavigate();
// Used in:
onClick={() => { if (!unlocked) { playNav(); navigate('/menu'); } }}
// And in useLongPress onComplete:
setTimeout(() => navigate('/admin-login'), 900);
```

`useNavigate` gives this component the ability to send the user to a different URL. Without it, tapping the screen would do nothing. The `if (!unlocked)` check prevents the normal tap from firing after the admin hold completes.

**`useSound` — Play audio feedback**

```js
const { playNav } = useSound();
```

`playNav` plays a soft descending tick when the customer taps to go to the menu. This is the first sound the customer hears — it confirms their tap registered. Without it, the screen would just silently change.

**`useLongPress` — Detect the 3-second hold**

```js
const longPressProps = useLongPress({
  duration: 3000,
  onProgress: (p) => setHoldProgress(p),
  onComplete: () => { setUnlocked(true); setTimeout(() => navigate('/admin-login'), 900); },
  onCancel: () => setHoldProgress(0),
});
```

This is the hidden admin trigger. `useLongPress` returns event handlers (`onMouseDown`, `onTouchStart`, etc.) that are spread onto the CRMB wordmark element. Every 50ms while held, `onProgress` fires with a 0–1 value that drives the amber ring animation. If the user releases early, `onCancel` resets the ring to 0. If they hold the full 3 seconds, `onComplete` fires — showing the unlock toast and navigating to admin login.

---

### `Menu.jsx` — The Main Ordering Screen

**What it shows:** The full product catalogue with category filters, search, a daily special card, and the house favourites strip.

**What it does:**
- Loads products from `ProductsContext`
- Filters products by category and search text
- Shows skeleton loading cards for 900ms on first load
- Handles adding items to cart with fly animation and toast

**Key interactions:**
- Tap category pill → filter products
- Type in search → filter by name
- Tap product card → go to product details
- Tap "Add" button → add to cart

---

#### Hooks Used in `Menu.jsx`

**`useState` — 4 pieces of local memory**

```js
const [activeCategory, setActiveCategory] = useState('All');
const [search, setSearch] = useState('');
const [addedId, setAddedId] = useState(null);
const [loading, setLoading] = useState(true);
```

- `activeCategory` — Which filter pill is selected. Starts as `'All'`. When changed, `useMemo` recalculates the filtered product list.
- `search` — What the customer typed in the search bar. Starts empty. Every keystroke updates this, which triggers a re-filter.
- `addedId` — The id of the product that was just added. Used to show the "Added" state on the correct card's button. Resets to `null` after 950ms.
- `loading` — Controls whether skeleton cards or real cards are shown. Starts `true`, becomes `false` after 900ms.

**`useMemo` — Efficient filtering**

```js
const filtered = useMemo(() => products.filter((p) => {
  const matchCat = activeCategory === 'All' || p.category === activeCategory;
  const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
  return matchCat && matchSearch && p.available;
}), [activeCategory, search]);
```

Without `useMemo`, the filter would run on every single render — including renders caused by unrelated state changes. `useMemo` caches the result and only recalculates when `activeCategory` or `search` actually changes. For a list of 12+ products this is a small optimisation, but it's the correct pattern for filtered lists.

**`useEffect` — Simulate loading**

```js
useEffect(() => {
  const t = setTimeout(() => setLoading(false), 900);
  return () => clearTimeout(t);
}, []);
```

Runs once on mount. Sets a 900ms timer that switches `loading` from `true` to `false`. The `return () => clearTimeout(t)` is a cleanup function — if the component unmounts before 900ms (e.g. user navigates away), the timer is cancelled to prevent a state update on an unmounted component.

**`useNavigate` — Navigate to product or splash**

```js
const navigate = useNavigate();
// Used for:
navigate('/product/' + product.id)  // tap a card
navigate('/')                        // tap the logo
```

**`useProducts` — Read the menu catalogue**

```js
const { products, categories, dailySpecial } = useProducts();
```

Reads from `ProductsContext`. This is why admin changes appear on the menu immediately — both the admin panel and the menu read from the same context. If the admin adds a product, `products` updates, `useMemo` recalculates, and the new card appears.

**`useCart` — Add items**

```js
const { addItem } = useCart();
// Used in handleAdd:
addItem(product);
```

Dispatches `ADD_ITEM` to the cart reducer. If the product is already in the cart, it increments the quantity. If not, it appends it with `quantity: 1`.

**`useToast` — Show add confirmation**

```js
const { addToast } = useToast();
addToast({ title: product.name + ' added', subtitle: formatPrice(product.price), image: product.image });
```

Shows the dark espresso pill notification at the bottom of the screen. Passes the product image so the thumbnail appears in the toast.

**`useFly` — Trigger fly-to-cart animation**

```js
const { flyToCart } = useFly();
const rect = e.currentTarget.closest('article')?.querySelector('img')?.getBoundingClientRect();
flyToCart(product.image, rect);
```

Gets the screen position of the product image and tells `FlyContext` to launch an animated thumbnail from there toward the cart button. `getBoundingClientRect()` returns the element's position on screen (top, left, width, height).

**`useSound` — Audio feedback**

```js
const { playAddToCart, playSelect, playNav } = useSound();
// playAddToCart → when Add is tapped
// playSelect    → when a category pill is tapped
// playNav       → when the logo or best seller chips are tapped
```

---

### `ProductDetails.jsx` — Single Product View

**What it shows:** A large hero image, product name, description, price, quantity selector, "You might also like" section, and the Add to Order button.

---

#### Hooks Used in `ProductDetails.jsx`

**`useState` — 3 pieces of memory**

```js
const [added, setAdded] = useState(false);
const [qty, setQty] = useState(1);
const [qtyDir, setQtyDir] = useState(1);
```

- `added` — Whether the item was just added. Switches the CTA button from "Add to Order" to "Added to Order" (green). Resets after 1500ms.
- `qty` — The selected quantity. Starts at 1. The + and − buttons change this. When "Add to Order" is tapped, `addItem` is called `qty` times.
- `qtyDir` — Direction of the last quantity change: `1` = up, `-1` = down. Used to animate the number sliding up (increment) or down (decrement).

**`useRef` — Point to the hero image**

```js
const imgRef = useRef(null);
// Applied to the image:
<img ref={imgRef} src={product.image} />
// Used in handleAdd:
flyToCart(product.image, imgRef.current.getBoundingClientRect());
```

`useRef` gives direct access to the actual DOM element (the `<img>` tag). When the customer adds the item, `getBoundingClientRect()` is called on the image to get its exact screen position. This is the starting point of the fly-to-cart animation. A ref is used instead of state because reading the position doesn't need to trigger a re-render.

**`useParams` — Read the product ID from the URL**

```js
const { id } = useParams();
// If URL is /product/4, then id = "4"
const product = products.find((p) => p.id === Number(id));
```

React Router puts the `:id` part of the URL into `useParams`. This is how the component knows which product to show. `Number(id)` converts the string `"4"` to the number `4` for comparison.

**`useNavigate` — Go back**

```js
onClick={() => { playNav(); navigate(-1); }}
```

`navigate(-1)` is equivalent to pressing the browser's back button — it goes to the previous page in history.

**`useProducts` — Find the product**

```js
const { products } = useProducts();
const product = products.find((p) => p.id === Number(id));
```

Reads the live product list from context. If an admin edits this product while the customer is viewing it, the page would update automatically.

**`useCart` — Add items and check existing quantity**

```js
const { addItem, cart } = useCart();
const inCart = cart.find((i) => i.id === product?.id);
```

`addItem` adds the product. `inCart` checks if the product is already in the cart — if it is, a green "X already in your order" banner appears.

**`useToast`, `useFly`, `useSound`** — Same as Menu.jsx. Toast confirms the add, fly animates the image, sound plays the double-pop.

---

### `Cart.jsx` — Order Review

**What it shows:** All items in the cart with quantities, prices, a summary card, and the checkout button.

---

#### Hooks Used in `Cart.jsx`

**`useState` — Track which item is being removed**

```js
const [removingId, setRemovingId] = useState(null);
```

When the trash button is tapped, `setRemovingId(item.id)` is called immediately. This triggers the slide-out animation on that specific item. After 280ms (the animation duration), `removeItem(id)` is called to actually remove it from the cart. Without this two-step process, the item would just disappear instantly with no animation.

**`useNavigate` — Two destinations**

```js
navigate('/menu')      // back button in header
navigate('/checkout')  // proceed to checkout button
```

**`useCart` — The core of this page**

```js
const { cart, removeItem, updateQuantity, total, itemCount } = useCart();
```

- `cart` — The array of items to display
- `removeItem(id)` — Called after the removal animation completes
- `updateQuantity(id, qty)` — Called by + and − buttons. If qty reaches 0, the item is automatically removed
- `total` — Displayed in the summary card and on the checkout button
- `itemCount` — Shown in the header ("3 items")

**`useSound` — Three different sounds**

```js
const { playRemove, playQtyUp, playQtyDown } = useSound();
// playQtyUp   → + button
// playQtyDown → − button
// playRemove  → trash button
```

Each action has a distinct sound so the customer gets clear audio feedback for what they did. The ascending tick for + and descending tick for − subtly reinforce the direction of the change.

---

### `Checkout.jsx` — Order Confirmation

**What it shows:** Order summary → loading/queue screen → success receipt.

---

#### Hooks Used in `Checkout.jsx`

**`useState` — 6 pieces of memory managing the entire checkout flow**

```js
const [status, setStatus] = useState('summary');
const [orderId, setOrderId] = useState('');
const [orderTotal, setOrderTotal] = useState(0);
const [cartSnapshot, setCartSnapshot] = useState([]);
const [queueStep, setQueueStep] = useState('received');
const [countdown, setCountdown] = useState(0);
```

- `status` — Controls which screen is shown: `'summary'` → `'loading'` → `'success'`. This is the main state machine for the checkout flow.
- `orderId` — The generated order ID (e.g. `CRMB-LX4K2A-F3R9`). Set after the queue animation completes.
- `orderTotal` — Saved before `clearCart()` is called, so the receipt can show the correct total even after the cart is empty.
- `cartSnapshot` — A copy of the cart items saved before clearing. Used to show the itemised list on the receipt.
- `queueStep` — Which step of the queue is active: `'received'` → `'preparing'` → `'baking'` → `'ready'`. Updated every 600–1200ms during the loading screen.
- `countdown` — The "Ready in ~X min" number shown during loading. Counts down as steps progress.

**`useNavigate` — After success**

```js
onOrderMore={() => navigate('/menu')}
onDone={() => navigate('/')}
```

**`useCart` — Read, snapshot, and clear**

```js
const { cart, total, clearCart } = useCart();
// In handleConfirm:
const snapshot = cart.map((i) => ({ ...i }));  // save a copy
setCartSnapshot(snapshot);
setOrderTotal(total);
// ... after queue animation:
clearCart();
```

The snapshot is taken before `clearCart()` because once the cart is cleared, `cart` becomes an empty array. The receipt needs the items list, so we save it first.

**`useNetwork` — Offline warning**

```js
const online = useNetwork();
// If !online: shows warning banner and "Offline" pill in header
```

Doesn't block checkout — just warns the customer. In a real payment system, you'd disable checkout when offline.

**`useSound` — Success chime**

```js
const { playSuccess } = useSound();
// Called just before setStatus('success')
playSuccess(); // plays C major arpeggio: C5 → E5 → G5 → C6
```

The ascending arpeggio is the most satisfying sound in the app — it signals completion and reward.

---

### `AdminLogin.jsx` — Staff Login

---

#### Hooks Used in `AdminLogin.jsx`

**`useState` — 6 pieces of form state**

```js
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [showPw, setShowPw] = useState(false);
const [error, setError] = useState('');
const [shaking, setShaking] = useState(false);
const [loading, setLoading] = useState(false);
```

- `username` / `password` — Controlled inputs. Every keystroke updates these via `onChange`.
- `showPw` — Toggles the password field between `type="password"` and `type="text"`.
- `error` — The error message shown when credentials are wrong. Empty string = no error shown.
- `shaking` — When `true`, the form plays a shake animation. Set to `true` on wrong credentials, back to `false` after 600ms.
- `loading` — When `true`, the submit button shows a spinner. Prevents double-submission.

**`useNavigate` — Two destinations**

```js
navigate('/admin', { replace: true })  // on successful login
navigate('/')                           // back to kiosk link
```

`replace: true` means the login page is replaced in history — pressing back after login won't return to the login page.

---

### `AdminDashboard.jsx` — Staff Control Panel

---

#### Hooks Used in `AdminDashboard.jsx`

**`useState` — 2 modal controllers**

```js
const [modal, setModal] = useState(null);
const [delTarget, setDelTarget] = useState(null);
```

- `modal` — Controls which modal is open. `null` = no modal. `{ type: 'add' }` = add form. `{ type: 'edit', product: p }` = edit form pre-filled with product `p`.
- `delTarget` — The product currently being considered for deletion. `null` = no delete modal. When set, the delete confirmation modal appears showing that product's name.

**`useNavigate` — Logout**

```js
const navigate = useNavigate();
const handleLogout = () => {
  localStorage.removeItem('isAdmin');
  navigate('/', { replace: true });
};
```

**`useProducts` — Live product management**

```js
const { products, addProduct, updateProduct, deleteProduct } = useProducts();
```

- `products` — The live list. Any change here immediately updates the customer menu because both read from the same `ProductsContext`.
- `addProduct(p)` — Called when the add form is submitted. Auto-generates an id.
- `updateProduct(p)` — Called when the edit form is submitted. Matches by id.
- `deleteProduct(id)` — Called after delete confirmation. Removes from the array and saves to localStorage.

---

## 🧱 Reusable Components

---

### `CartButton.jsx` — The Persistent Cart Button

**Where it appears:** In the header of Menu and ProductDetails pages.

---

#### Hooks Used in `CartButton.jsx`

**`useEffect` — Watch for item count increases**

```js
useEffect(() => {
  if (itemCount > prevCount.current) {
    controls.start({
      scale: [1, 1.2, 0.92, 1.06, 1],
      transition: { duration: 0.42 }
    });
  }
  prevCount.current = itemCount;
}, [itemCount, controls]);
```

Every time `itemCount` changes, this effect runs. It compares the new count to the previous count (stored in `prevCount` ref). If the count went up (item was added), it triggers the bump animation. `prevCount.current = itemCount` updates the stored value for next time. This is why the button only bumps on adds, not on removes.

**`useRef` — Two purposes**

```js
const prevCount = useRef(itemCount);  // stores previous count without re-rendering
const btnRef = useRef(null);          // points to the button DOM node

// Callback ref syncs both:
const setRef = (node) => {
  btnRef.current = node;
  cartRef.current = node;  // shared with FlyContext
};
```

`prevCount` stores the previous item count. Using `useRef` instead of `useState` means updating it doesn't cause a re-render — we just need to remember the value, not react to it changing.

`btnRef` / `cartRef` point to the actual button DOM element. `FlyContext` needs this to calculate where the fly animation should end. The callback ref pattern (`setRef`) lets two different refs point to the same DOM node.

**`useAnimation` — Imperative animation control**

```js
const controls = useAnimation();
// Applied to the button:
<motion.button animate={controls}>
// Triggered in useEffect:
controls.start({ scale: [1, 1.2, 0.92, 1.06, 1] });
```

Normally Framer Motion animations are declarative ("animate to this state"). `useAnimation` gives an imperative controller — you call `controls.start()` from code to trigger an animation at a specific moment (when item count increases). This is necessary because the animation needs to be triggered by a side effect, not by a prop change.

**`useCart` — Read item count**

```js
const { itemCount } = useCart();
```

`itemCount` is the total number of units across all cart items. Shown in the badge. Also watched by `useEffect` to detect adds.

**`useFly` — Register cart position**

```js
const { cartRef } = useFly();
// cartRef.current = button DOM node (via setRef)
```

`FlyContext` needs to know where the cart button is on screen so fly animations know where to aim. By setting `cartRef.current` to the button's DOM node, any component that calls `flyToCart()` can read `cartRef.current.getBoundingClientRect()` to get the button's position.

**`useSound` — Nav sound on tap**

```js
const { playNav } = useSound();
onClick={() => { playNav(); navigate('/cart'); }}
```

**`useNavigate` — Go to cart**

```js
navigate('/cart')
```

---

### `NowPlaying.jsx` — Jazz Radio Widget

---

#### Hooks Used in `NowPlaying.jsx`

**`useState` — 3 pieces of UI state**

```js
const [trackIdx, setTrackIdx] = useState(() => Math.floor(Math.random() * TRACKS.length));
const [visible, setVisible] = useState(true);
const [expanded, setExpanded] = useState(false);
```

- `trackIdx` — Index into the TRACKS array (the fake track names). Starts at a random position so it doesn't always show "So What" first. Increments every 45 seconds.
- `visible` — Controls whether the track name is shown. Set to `false` briefly during the crossfade transition between tracks, then back to `true` with the new track name.
- `expanded` — Whether the mini-player is open. Toggled by the chevron button.

**`useEffect` — Two separate effects**

```js
// Effect 1: Rotate tracks every 45s while playing
useEffect(() => {
  if (!playing) return;
  const id = setInterval(() => {
    setVisible(false);
    setTimeout(() => { setTrackIdx((i) => (i + 1) % TRACKS.length); setVisible(true); }, 350);
  }, 45_000);
  return () => clearInterval(id);
}, [playing]);

// Effect 2: Collapse player when paused
useEffect(() => {
  if (!playing) setExpanded(false);
}, [playing]);
```

Effect 1 only runs when `playing` is `true` — no point rotating tracks if nothing is playing. The `setVisible(false)` → wait 350ms → `setTrackIdx` → `setVisible(true)` sequence creates a crossfade: old track fades out, new track fades in.

Effect 2 automatically collapses the expanded player when the user pauses. This prevents the expanded state from persisting after the music stops.

**`useAudio` — Control the radio**

```js
const { playing, loading, toggle, volume, setVolume } = useAudio();
```

- `playing` / `loading` — Drive the play/pause/spinner button state
- `toggle()` — Called when the play/pause button is tapped. Handles fade in/out internally.
- `volume` / `setVolume` — Bound to the volume slider in the expanded player

**`useSound` — UI feedback**

```js
const { playClick, playSelect } = useSound();
// playClick  → play/pause button
// playSelect → expand/collapse chevron
```

---

### `RippleButton.jsx` — Button with Ripple Effect

---

#### Hooks Used in `RippleButton.jsx`

**`useRef` — Point to the button DOM node**

```js
const ref = useRef(null);
// Applied to the button:
<motion.button ref={ref}>
// Used in handleClick:
const btn = ref.current;
const rect = btn.getBoundingClientRect();
const x = e.clientX - rect.left;  // tap X relative to button
const y = e.clientY - rect.top;   // tap Y relative to button
```

The ripple needs to start at the exact point where the user tapped. `useRef` gives direct access to the button's DOM node so we can call `getBoundingClientRect()` to get its position, then calculate where the tap was relative to the button's top-left corner.

**`useSound` — Click sound**

```js
const { playClick } = useSound();
// Called in handleClick before spawning the ripple
playClick();
```

Every `RippleButton` tap plays the same crisp click sound. This means all the major CTAs (Add to Order, Proceed to Checkout, Browse Menu) have consistent audio feedback without each component needing to import `useSound` separately.

---

### `SkeletonCard.jsx` — Loading Placeholder

**Hooks used:** None. This is a purely presentational component — it just renders shimmer shapes. No state, no effects, no context needed.

---

### `OfflineBadge.jsx` — Offline Indicator

---

#### Hooks Used in `OfflineBadge.jsx`

**`useNetwork` — Live connectivity status**

```js
const online = useNetwork();
// If !online: renders the badge
// If online: renders nothing (AnimatePresence handles the exit animation)
```

`useNetwork` returns a boolean that updates in real time when the device connects or disconnects. The badge appears and disappears automatically — no manual checking needed. `AnimatePresence` ensures the badge plays its exit animation (slide up + fade) before being removed from the DOM.

---

### `ProtectedRoute.jsx` — Admin Route Guard

**Hooks used:** None directly. It reads `localStorage` synchronously (not via a hook) and uses React Router's `<Navigate>` component to redirect.

```js
const isAdmin = localStorage.getItem('isAdmin') === 'true';
return isAdmin ? children : <Navigate to="/admin-login" replace />;
```

This is intentionally simple — it runs on every render of an admin route, so if `isAdmin` is removed from localStorage (logout), the next render will redirect automatically.

---

## 🔧 Utility Functions

---

### `formatPrice.js`

**What it does:** Converts a number to Philippine Peso format.

```
formatPrice(120)    → "₱120.00"
formatPrice(1250.5) → "₱1,250.50"
```

Uses the browser's built-in `Intl` API for locale-aware formatting. No React, no hooks — just a pure function. Called in almost every component that displays a price.

---

### `generateOrderId.js`

**What it does:** Creates a unique, human-readable order ID.

```
generateOrderId() → "CRMB-LX4K2A-F3R9"
```

Format: `CRMB` prefix + base-36 timestamp + 4 random characters. The timestamp makes IDs roughly sortable by time. The random suffix prevents collisions if two orders are placed in the same millisecond.

---

## ❓ Common Instructor Questions

**Q: What's the difference between a page and a component?**
Pages are full screens tied to a URL route. Components are smaller, reusable pieces that appear inside pages. The distinction is about scope and reusability — a `CartButton` appears in multiple pages, so it's a component. `Menu.jsx` is only ever the menu screen, so it's a page.

**Q: Why are some components defined inside other files (like `ProductCard` inside `Menu.jsx`)?**
`ProductCard` is only ever used inside `Menu.jsx`. Putting it in a separate file would add complexity without benefit. The rule is: if a component is used in more than one place, extract it. If it's only used in one place, it can live in the same file.

**Q: Why does `CartButton` need to know about `FlyContext`?**
The fly-to-cart animation needs to know where the cart button is on screen. `CartButton` registers its DOM position with `FlyContext` so that when any product card triggers `flyToCart()`, the animation knows where to aim. It's a coordination mechanism between two unrelated components.

**Q: Why does `Checkout.jsx` save a cart snapshot before clearing the cart?**
Once `clearCart()` is called, the cart array becomes empty. The success receipt needs to show the itemised list of what was ordered. By saving `cartSnapshot` before clearing, the receipt always has the correct items even though the cart is now empty.

**Q: What happens if a product is deleted from the admin panel while a customer has it in their cart?**
The cart stores a full snapshot of the product at the time it was added (name, price, image, etc.). Deleting the product from the menu doesn't affect items already in the cart. The customer can still check out with it.

**Q: Why does `useEffect` have a cleanup function (the `return () => ...` part)?**
The cleanup function runs when the component unmounts (is removed from the screen) or before the effect runs again. Without it, timers and event listeners would keep running even after the component is gone, causing memory leaks and bugs. For example, in `Menu.jsx`, the 900ms loading timer is cancelled if the user navigates away before it fires.

---

*CRMB Artisan Bakery & Café — Internal Technical Reference*
