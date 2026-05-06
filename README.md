# CRMB Kiosk — MERN Stack

Self-service digital ordering kiosk for **CRMB Artisan Bakery & Café**, built as a full MERN application.

```
frontend/       ← React + Vite client
backend/        ← Express + Node.js REST API + MongoDB
```

---

## Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| MongoDB  | Database — products, orders, admins |
| Express  | REST API server                     |
| React    | Frontend UI (Vite + Tailwind)       |
| Node.js  | Backend runtime                     |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) **or** a MongoDB Atlas connection string

---

### 1. Backend

```bash
cd backend
npm install

# Copy the example env file and fill in your values
cp .env.example .env
# Edit .env — set MONGO_URI, PORT, ADMIN_USERNAME, ADMIN_PASSWORD

# Start the server — database is seeded automatically on first run
npm run dev       # development (nodemon)
npm start         # production
```

Server runs on **http://localhost:5000**

> The server checks if the database is empty on every startup. If it is, it automatically inserts the 12 default products and creates the admin account. No need to run `seed.js` manually.

---

### 2. Frontend

```bash
cd frontend
npm install

# Start the dev server
npm run dev
```

App runs on **http://localhost:5173**

The Vite dev server proxies `/api/*` requests to `http://localhost:5000` automatically — no CORS issues in development.

---

## API Endpoints

### Auth
| Method | Path            | Auth   | Description                        |
|--------|-----------------|--------|------------------------------------|
| POST   | /api/auth/login | Public | Verify credentials, returns success |

### Products
| Method | Path              | Auth     | Description      |
|--------|-------------------|----------|------------------|
| GET    | /api/products     | Public   | Get all products |
| GET    | /api/products/:id | Public   | Get one product  |
| POST   | /api/products     | Required | Create product   |
| PUT    | /api/products/:id | Required | Update product   |
| DELETE | /api/products/:id | Required | Delete product   |

### Orders
| Method | Path                   | Auth     | Description         |
|--------|------------------------|----------|---------------------|
| POST   | /api/orders            | Public   | Place an order      |
| GET    | /api/orders            | Required | Get all orders      |
| GET    | /api/orders/:id        | Required | Get single order    |
| PATCH  | /api/orders/:id/status | Required | Update order status |

### Health
| Method | Path         | Auth   | Description        |
|--------|--------------|--------|--------------------|
| GET    | /api/health  | Public | Server status check |

---

## Admin Auth

Admin routes are protected by the `protect` middleware in `backend/middleware/authMiddleware.js`.

The frontend sends `X-Admin-Logged-In: true` in the request header after a successful login. The `isAdmin` flag is stored in `localStorage` on the client side.

Default credentials (set in `backend/.env`):
- **Username:** `crmb`
- **Password:** `admin123`

---

## Deployment

| Service  | Purpose  | URL |
|----------|----------|-----|
| MongoDB Atlas | Database | cloud.mongodb.com |
| Render   | Backend  | https://crmb-backend.onrender.com |
| Vercel   | Frontend | https://crmbmern.vercel.app |

### Environment Variables

**Backend (`backend/.env`):**
```
MONGO_URI=mongodb+srv://...
PORT=5000
ADMIN_USERNAME=crmb
ADMIN_PASSWORD=admin123
FRONTEND_URL=https://crmbmern.vercel.app
```

**Frontend (`frontend/.env`):**
```
VITE_API_URL=https://crmb-backend.onrender.com/api
```

> **Note:** Render free tier spins down after 15 minutes of inactivity. The first request after that takes ~30 seconds to wake up.
