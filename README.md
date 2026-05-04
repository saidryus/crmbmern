# CRMB Kiosk — MERN Stack

Self-service digital ordering kiosk for **CRMB Artisan Bakery & Café**, built as a full MERN application.

```
crmb-kiosk/     ← original project (kept for reference)
frontend/       ← React + Vite client (M E R N)
backend/        ← Express + Node.js REST API + MongoDB (M E R N)
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
# Edit .env — set MONGO_URI, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD

# Seed the database (run once — inserts 12 products + admin account)
node seed.js

# Start the server
npm run dev       # development (nodemon)
npm start         # production
```

Server runs on **http://localhost:5000**

---

### 2. Frontend

```bash
cd frontend
npm install

# Start the dev server
npm run dev
```

App runs on **http://localhost:5173**

The Vite dev server proxies `/api/*` requests to `http://localhost:5000` automatically, so no CORS issues in development.

---

## API Endpoints

### Auth
| Method | Path             | Auth     | Description          |
|--------|------------------|----------|----------------------|
| POST   | /api/auth/login  | Public   | Login, returns JWT   |
| GET    | /api/auth/me     | Required | Verify current token |

### Products
| Method | Path                 | Auth     | Description        |
|--------|----------------------|----------|--------------------|
| GET    | /api/products        | Public   | Get all products   |
| GET    | /api/products/:id    | Public   | Get single product |
| POST   | /api/products        | Required | Create product     |
| PUT    | /api/products/:id    | Required | Update product     |
| DELETE | /api/products/:id    | Required | Delete product     |

### Orders
| Method | Path                       | Auth     | Description         |
|--------|----------------------------|----------|---------------------|
| POST   | /api/orders                | Public   | Place an order      |
| GET    | /api/orders                | Required | Get all orders      |
| GET    | /api/orders/:id            | Required | Get single order    |
| PATCH  | /api/orders/:id/status     | Required | Update order status |

---

## Default Admin Credentials

Set in `backend/.env` (defaults from `.env.example`):
- **Username:** `crmb`
- **Password:** `admin123`

Change these before deploying.
