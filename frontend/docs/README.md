# CRMB Kiosk — Documentation Index

All guides for understanding the CRMB self-service kiosk app.
Written for team members at all levels — no deep coding knowledge required.

---

## 📚 Guides

| Guide | What it covers | Start here if... |
|---|---|---|
| [Architecture Guide](ARCHITECTURE_GUIDE.md) | Why the project is structured the way it is | Your instructor asks "why did you choose X?" or "what would you change?" |
| [State Management Guide](STATE_MANAGEMENT_GUIDE.md) | How data is stored, shared, and updated | Your instructor asks "how does the cart work?" or "where is data stored?" |
| [Data Flow Guide](DATA_FLOW_GUIDE.md) | Step-by-step trace of every user action | Your instructor asks "trace what happens when..." |
| [Component Guide](COMPONENT_GUIDE.md) | What every file does and how it connects | Your instructor asks "what does this component do?" |
| [Animations Guide](ANIMATIONS_GUIDE.md) | How every animation works and why | Your instructor asks "how does the fly animation work?" |
| [Design System Guide](DESIGN_SYSTEM_GUIDE.md) | Colors, fonts, and the visual language | Your instructor asks "why does it look like this?" |
| [PWA & Offline Guide](PWA_AND_OFFLINE_GUIDE.md) | How the app installs and works offline | Your instructor asks "what makes this a PWA?" |

---

## 🚀 Quick Start

```bash
# Terminal 1 — Backend
cd backend
npm install
node seed.js     # run once to populate the database
npm run dev      # starts on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev      # starts on http://localhost:5173
```

---

## 🔐 Admin Access

Navigate to `/admin-login` or hold the **CRMB logo** on the splash screen for **3 seconds**.

Login: `crmb` / `admin123`

---

## 🗂️ Project Structure (Quick Reference)

```
crmbmern/
├── backend/                  ← Express + Node.js REST API
│   ├── models/               ← Mongoose schemas (Product, Order, Admin)
│   ├── routes/               ← API route handlers
│   ├── middleware/           ← Auth middleware
│   ├── seed.js               ← Database seeder
│   └── server.js             ← Entry point
│
└── frontend/                 ← React + Vite app
    └── src/
        ├── admin/            ← Staff-only pages (login, dashboard)
        ├── api/              ← Fetch wrappers for backend calls
        ├── components/       ← Reusable UI pieces
        ├── context/          ← Global state (cart, products, audio, etc.)
        ├── hooks/            ← Reusable behaviour logic
        ├── pages/            ← Customer-facing screens
        └── utils/            ← Pure helper functions
```

---

## 🧠 The Key Concepts

1. **MERN Stack** — MongoDB stores data, Express serves the API, React renders the UI, Node.js runs the server
2. **REST API** — the frontend never touches the database directly; it calls API endpoints
3. **React Context** — shared data that any component can read without prop drilling
4. **useReducer** — the cart uses a reducer for predictable state transitions
5. **JWT-free Auth** — admin login sets `isAdmin` in localStorage; the backend checks `X-Admin-Logged-In` header

---

## 🌐 Live URLs

| | URL |
|---|---|
| Frontend | https://crmbmern.vercel.app |
| Backend API | https://crmb-backend.onrender.com/api |
| Health check | https://crmb-backend.onrender.com/api/health |

---

*CRMB Artisan Bakery & Café — Est. 2024 — Manila, PH*
