# CRMB Kiosk — Architecture Guide
### Why the Project Is Built the Way It Is

---

> **Who this is for:** Anyone who wants to understand the big-picture decisions — why certain technologies were chosen, why the folders are organised the way they are, and what each part of the project is responsible for.

---

## 🏗️ What Is "Architecture"?

Architecture is the set of decisions made *before* writing code that determine how everything fits together. Like a building blueprint — it decides where the rooms go, how they connect, and what each room is for.

Good architecture means:
- New features are easy to add
- Bugs are easy to find
- Team members can work on different parts without breaking each other's work

---

## 🧱 The Tech Stack — MERN

CRMB is a full **MERN stack** application:

| Letter | Technology | Role |
|--------|------------|------|
| **M** | MongoDB | Database — stores products, orders, and admin accounts in the cloud |
| **E** | Express.js | REST API server — handles HTTP requests and talks to the database |
| **R** | React | Frontend UI — what the customer and admin see and interact with |
| **N** | Node.js | Runtime — runs the Express server |

### Supporting Technologies

| Technology | What it is | Why we chose it |
|---|---|---|
| **Vite** | Build tool & dev server | Extremely fast, modern, simple config |
| **Tailwind CSS** | Styling utility classes | Fast to write, consistent, no CSS file clutter |
| **Framer Motion** | Animation library | The best React animation library, simple API |
| **React Router DOM** | Page navigation | Standard routing for React apps |
| **Mongoose** | MongoDB object modelling | Schema validation, clean query API |
| **bcryptjs** | Password hashing | Securely stores admin password in the database |
| **cors** | Cross-origin requests | Allows the frontend to call the backend API |
| **nodemon** | Dev server auto-restart | Restarts the backend when files change |
| **Lucide React** | Icon library | Clean SVG icons, consistent style |
| **vite-plugin-pwa** | PWA support | Makes the app installable and offline-capable |
| **Web Audio API** | Sound synthesis | Built into browsers, no files needed, works offline |

---

## 📁 Full Project Structure

```
crmbmern/
│
├── backend/                        ← Express + Node.js server
│   ├── models/
│   │   ├── Product.js              ← Mongoose schema for menu items
│   │   ├── Order.js                ← Mongoose schema for customer orders
│   │   └── Admin.js                ← Mongoose schema for staff accounts (bcrypt)
│   ├── routes/
│   │   ├── authRoutes.js           ← POST /api/auth/login
│   │   ├── productRoutes.js        ← CRUD /api/products
│   │   └── orderRoutes.js          ← POST + GET /api/orders
│   ├── middleware/
│   │   └── authMiddleware.js       ← protect() — guards admin-only routes
│   ├── server.js                   ← Entry point, connects to MongoDB, starts Express
│   ├── seed.js                     ← One-time script to populate the database
│   ├── .env                        ← Local secrets (not committed to git)
│   └── .env.example                ← Template for .env
│
└── frontend/                       ← React + Vite app
    ├── public/                     ← Static files (favicon, icons)
    └── src/
        ├── admin/
        │   └── pages/
        │       ├── AdminLogin.jsx  ← Staff login (calls POST /api/auth/login)
        │       └── AdminDashboard.jsx ← Product + order management
        │
        ├── api/                    ← All backend communication lives here
        │   ├── client.js           ← Base fetch wrapper (URL + auth header)
        │   ├── auth.js             ← login(), logout()
        │   ├── products.js         ← getProducts(), createProduct(), etc.
        │   └── orders.js           ← createOrder(), getOrders()
        │
        ├── components/
        │   ├── admin/
        │   │   └── ProtectedRoute.jsx  ← Checks isAdmin in localStorage
        │   ├── cart/
        │   │   └── CartButton.jsx
        │   └── common/
        │       ├── NowPlaying.jsx
        │       ├── OfflineBadge.jsx
        │       ├── RippleButton.jsx
        │       └── SkeletonCard.jsx
        │
        ├── context/                ← Global React state
        │   ├── AudioContext.jsx
        │   ├── CartContext.jsx     ← useReducer cart (uses _id from MongoDB)
        │   ├── FlyContext.jsx
        │   ├── ProductsContext.jsx ← Fetches from /api/products
        │   └── ToastContext.jsx
        │
        ├── hooks/
        │   ├── useIdleTimeout.js
        │   ├── useLongPress.js
        │   ├── useNetwork.js
        │   └── useSound.js
        │
        ├── pages/
        │   ├── Splash.jsx
        │   ├── Menu.jsx            ← Reads products from ProductsContext
        │   ├── ProductDetails.jsx  ← Uses _id for routing (/product/:id)
        │   ├── Cart.jsx            ← Uses _id for cart operations
        │   └── Checkout.jsx        ← POSTs order to /api/orders
        │
        ├── utils/
        │   ├── formatPrice.js
        │   └── generateOrderId.js
        │
        ├── App.jsx
        ├── main.jsx
        └── index.css
```

---

## 🔌 How the App Starts Up

### Backend startup:
```
node server.js
    ↓
dotenv loads .env variables
    ↓
mongoose.connect(MONGO_URI) — connects to MongoDB Atlas
    ↓
On success: app.listen(5000) — Express starts accepting requests
On failure: process.exit(1) — server won't start without a DB
```

### Frontend startup:
```
Browser opens localhost:5173
    ↓
main.jsx mounts React into <div id="root">
    ↓
App.jsx renders all Providers:
  ProductsProvider → CartProvider → AudioProvider → FlyProvider → ToastProvider
    ↓
ProductsProvider calls GET /api/products
    ↓
Backend queries MongoDB → returns products array
    ↓
Products stored in React state → menu renders
    ↓
CartProvider restores cart from localStorage
    ↓
React Router reads URL → renders matching page
```

---

## 🛣️ Routing

**Customer routes** (slide animations, idle timeout):
```
/            → Splash screen
/menu        → Menu page
/product/:id → Product details (id = MongoDB _id)
/cart        → Cart page
/checkout    → Checkout page
```

**Admin routes** (no slide animation, no idle timeout):
```
/admin-login → Login page
/admin       → Dashboard (protected — redirects if not logged in)
```

---

## 🔒 Security Model

| Layer | Mechanism |
|-------|-----------|
| Admin login | bcrypt password comparison in `Admin.matchPassword()` |
| Protected API routes | `protect` middleware checks `X-Admin-Logged-In: true` header |
| Protected frontend routes | `ProtectedRoute` checks `localStorage.isAdmin === 'true'` |
| Database | MongoDB Atlas with IP allowlist and user credentials |
| Secrets | Stored in `.env`, never committed to git |

---

## 🌐 Deployment Architecture

```
Customer's browser
        ↓ HTTPS
  Vercel (frontend)
  https://crmbmern.vercel.app
        ↓ HTTPS API calls
  Render (backend)
  https://crmb-backend.onrender.com
        ↓ MongoDB driver
  MongoDB Atlas (database)
  boywonder.oawrar9.mongodb.net
```

The frontend and backend are deployed separately. The frontend is a static build (HTML/CSS/JS files) served by Vercel's CDN. The backend is a Node.js process running on Render's servers.

---

## ❓ Common Instructor Questions

**Q: Why MERN and not another stack?**
MERN is one of the most widely taught and used full-stack JavaScript combinations. Using JavaScript on both frontend and backend means one language across the entire project — easier to context-switch, shared utility functions, and a consistent mental model.

**Q: Why separate frontend and backend folders?**
Clear separation of concerns. The frontend is a React app that could theoretically work with any backend. The backend is an API that could serve any frontend. Keeping them separate makes each part independently deployable and testable.

**Q: Why MongoDB instead of a relational database like MySQL?**
MongoDB stores data as JSON-like documents, which maps naturally to JavaScript objects. Products, orders, and admin accounts are all naturally document-shaped. There are no complex relationships that would benefit from SQL joins.

**Q: Why Render for the backend and Vercel for the frontend?**
Vercel is purpose-built for frontend frameworks like React/Vite — zero-config deployment, global CDN, automatic HTTPS. Render is better suited for Node.js servers — it runs persistent processes, supports environment variables, and has a free tier for backend services.

**Q: What would you change if this were a real production app?**
1. Add proper JWT authentication with token expiry
2. Add rate limiting to the API
3. Add input sanitization middleware
4. Add unit and integration tests
5. Use a real payment gateway (Stripe, PayMongo)
6. Add image upload support instead of URL pasting
7. Add WebSocket support for real-time order status updates

---

*CRMB Artisan Bakery & Café — Internal Technical Reference*
