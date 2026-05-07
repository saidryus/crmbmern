# CRMB Kiosk — Presentation Script
### Divided into 3 members for a live run-through

---

## 👤 Member 1 — Project Overview + Backend

**You cover:** What the project is, the MERN stack, the database, the API, and the backend structure.

---

### Opening (say this first)

"Our project is CRMB Kiosk — a self-service digital ordering system for an artisan bakery and café. It's built as a full MERN stack application, meaning MongoDB, Express, React, and Node.js. The customer uses it to browse the menu, add items to their cart, and place an order. Staff use the admin panel to manage products and view orders."

---

### The Stack

"We chose MERN because JavaScript runs on both the frontend and the backend, so the whole project uses one language. MongoDB stores our data as documents which maps naturally to JavaScript objects. Express handles the API. React renders the UI. Node.js runs the server."

*Point to the project folder structure:*

"The project is split into two completely separate folders — `frontend` and `backend`. They're deployed independently. The frontend is on Vercel, the backend is on Render, and the database is on MongoDB Atlas."

---

### The Database — MongoDB

*Open `backend/models/Product.js`*

"We have three Mongoose schemas. This is the Product schema. Notice the validation — `required` prevents saving incomplete products, `enum` restricts category to only Bread, Pastries, or Drinks, and `min: 0` prevents negative prices. `timestamps: true` automatically adds `createdAt` and `updatedAt` to every document."

*Open `backend/models/Order.js`*

"The Order schema has a sub-document called `orderItemSchema` embedded inside it — that's the relationship between orders and products. `unique: true` on `orderId` prevents duplicate orders. The custom validator ensures every order has at least one item."

*Open `backend/models/Admin.js`*

"The Admin schema uses bcrypt to hash passwords before saving. The `pre('save')` hook runs automatically before every save — so the plain text password is never stored in the database. `matchPassword()` is a custom method that compares a plain text input against the stored hash during login."

---

### The Backend — Express & Node

*Open `backend/server.js`*

"This is the entry point. When the server starts, it connects to MongoDB first. If the connection fails, the server won't start at all. Once connected, it checks if the database is empty — if it is, it automatically seeds 12 products and creates the admin account. This means anyone who clones the project just runs `npm run dev` and everything is ready."

*Open `backend/middleware/authMiddleware.js`*

"This is our `protect` middleware. It checks for the `X-Admin-Logged-In` header on every request. If the header is missing, it returns 401 Unauthorized and the route handler never runs. This is what makes certain routes admin-only."

*Open `backend/routes/productRoutes.js`*

"Here you can see the route and controller pattern. The route is the first part — `router.get('/')` — it defines the URL and HTTP method. The function after it is the controller — it does the actual work, queries MongoDB, and sends the response. Public routes have no `protect`. Admin-only routes have `protect` as a parameter before the handler, so it runs first and blocks unauthorized access."

---

### Handoff to Member 2

"That covers the backend — the database, the API, and the server. Member 2 will now walk through the frontend structure and the customer-facing flow."

---
---

## 👤 Member 2 — Frontend Structure + Customer Flow

**You cover:** App.jsx, contexts, the customer journey from splash to checkout.

---

### Frontend Structure

*Open `frontend/src/App.jsx`*

"This is `App.jsx` — the root of the entire frontend. It does four things. First, it wraps everything in context providers — these are the shared data stores that any component can access. Second, it defines all the routes — the map of the app. Third, it runs the idle timeout — if a customer walks away for 2 minutes, the app resets to the splash screen automatically. Fourth, it handles the page transition animations — going forward slides right, going back slides left."

---

### Contexts

"Contexts are like group chats. Instead of passing data through every component, any component can join the relevant group chat and read what it needs directly."

*Open `frontend/src/context/CartContext.jsx`*

"CartContext is the most important one. It stores the cart using `useReducer` — which we'll explain in a moment. It also uses `useEffect` to save the cart to localStorage every time it changes, so the cart survives a page refresh. The functions at the bottom — `addItem`, `removeItem`, `updateQuantity`, `clearCart` — are the dispatches for the reducer. They're wrappers so components don't have to write the action objects themselves."

---

### The Customer Flow — Splash to Menu

*Navigate to `https://crmbmern.vercel.app`*

"The customer sees the splash screen first. There's a jazz radio player, floating music notes, and a tap-to-begin prompt."

*Tap the screen*

"Tapping navigates to the menu. The page slides in from the right — that direction is calculated in `App.jsx` based on route depth. While products are loading from the API, skeleton cards are shown. Once the fetch completes, the real product cards animate in."

*Open `frontend/src/context/ProductsContext.jsx`*

"This is what powers that. On mount, `useEffect` calls `GET /api/products`. The backend queries MongoDB and returns the products. `loading` is set to true during the fetch — that's what shows the skeleton cards. `error` is set if the fetch fails — that shows a friendly error message instead of a blank screen."

---

### Browsing and Adding to Cart

*Back in the browser — tap a category filter*

"Tapping a category pill updates `activeCategory` state in `Menu.jsx`. `useMemo` recalculates the filtered product list — it only re-runs when the category or search text actually changes, not on every render. That's an optimization."

*Tap Add on a product*

"Tapping Add calls `addItem` from `CartContext`. The cart reducer receives the `ADD_ITEM` action, checks if the product is already in the cart, and either increments the quantity or appends it as a new item. The cart button bumps — that's a `useEffect` in `CartButton` watching the item count. A thumbnail flies toward the cart button — that's `FlyContext`. A toast notification appears — that's `ToastContext`."

---

### Cart Page

*Tap the cart button*

"The cart page reads directly from `CartContext`. The + and − buttons call `updateQuantity`. If quantity reaches zero, the item is removed automatically — that's handled in the reducer. The trash button sets `removingId` state, which triggers the slide-out animation. After 280ms the item is actually deleted — the delay is so the animation has time to play."

---

### Handoff to Member 3

"That covers the frontend structure and the customer flow up to the cart. Member 3 will walk through checkout, the admin panel, and the technical highlights."

---
---

## 👤 Member 3 — Checkout + Admin Panel + Technical Highlights

**You cover:** The checkout flow, admin login, admin dashboard, and answering technical questions.

---

### Checkout Flow

*Tap Proceed to Checkout from the cart*

"The checkout page shows an order summary. When the customer taps Confirm Order, the button morphs from full-width into a small circle with a spinner. This prevents double-tapping and signals the order is being processed."

*Open `frontend/src/pages/Checkout.jsx`*

"Before anything is cleared, a snapshot of the cart is saved — `const snapshot = cart.map(i => ({...i}))`. This is critical because by the time the receipt appears, the cart is already empty. The snapshot is what the receipt reads."

"Then the queue animation plays — four steps with delays between them. Each `setQueueStep` update triggers the progress bar on screen."

"After the animation, `generateOrderId()` creates a unique human-readable ID. Then `createOrder()` is called — that's a POST request to `/api/orders`. The backend saves it permanently to MongoDB. Then `clearCart()` dispatches `CLEAR_CART` to the reducer, the cart becomes empty, and `useEffect` in CartContext saves the empty cart to localStorage."

*The receipt appears*

"The receipt reads from the snapshot. Items appear one by one with a staggered animation — 70ms apart — like a real receipt printing out."

---

### Admin Panel

*Navigate to `/admin-login`*

"The admin login page. Staff enter their credentials. `handleSubmit` calls `POST /api/auth/login`. The backend finds the admin in MongoDB and uses bcrypt to compare the password against the stored hash. If it matches, `isAdmin` is set in localStorage and the staff member is redirected to the dashboard."

*Open `frontend/src/components/admin/ProtectedRoute.jsx`*

"`ProtectedRoute` is a wrapper component that checks `localStorage.isAdmin`. If it's not there, it redirects to the login page. It lives in `components/admin/` not `admin/pages/` because it's not a page — it's reusable infrastructure that can wrap any route."

*Log in and show the dashboard*

"The admin dashboard fetches orders from `GET /api/orders` on mount using `useEffect`. That route has `protect` middleware — it checks the `X-Admin-Logged-In` header that `client.js` adds automatically when `isAdmin` is in localStorage."

*Show adding a product*

"Adding a product calls `POST /api/products`. The `protect` middleware runs first — if not logged in, 401. If logged in, `Product.create()` saves it to MongoDB. `ProductsContext` appends it to the products array. The menu shows it immediately because both the admin dashboard and the customer menu read from the same context."

---

### Technical Highlights — For Instructor Questions

**If asked about RESTful design:**
"Point to `productRoutes.js`. The URL is a noun — `/api/products`. The HTTP method is the action — GET reads, POST creates, PUT updates, DELETE removes. Status codes communicate the result — 201 for created, 404 for not found, 401 for unauthorized."

**If asked about useReducer:**
"The cart uses `useReducer` because it has four distinct operations with specific rules. All the logic is in one `cartReducer` function. `addItem`, `removeItem`, `updateQuantity`, and `clearCart` are just wrappers that call `dispatch` — they tell the reducer what happened and the reducer decides what the new cart state looks like."

**If asked about API integration:**
"Every API call goes through `src/api/client.js`. It adds the base URL and the admin header automatically. The frontend never touches MongoDB directly — it always asks the backend, and the backend does the database work."

**If asked about the database:**
"MongoDB Atlas — cloud hosted, permanent. Products, orders, and the admin account all live there. The server auto-seeds on first run so cloning the repo and running `npm run dev` is all you need."

---

### Closing

"To summarize — CRMB Kiosk is a full MERN stack application. MongoDB stores the data with schema validation. Express serves a RESTful API with protected routes. React manages the UI with contexts, useReducer, useState, and useEffect. Node.js runs the server. The frontend is on Vercel, the backend on Render, the database on Atlas — all three deployed and live."

---

*Live URL: https://crmbmern.vercel.app*
*Backend API: https://crmb-backend.onrender.com/api/products*
