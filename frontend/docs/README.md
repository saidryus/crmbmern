# CRMB Kiosk — Documentation Index

All guides for understanding the CRMB self-service kiosk app.
Written for team members at all levels — no deep coding knowledge required.

---

## 📚 Guides

| Guide | What it covers | Start here if... |
|---|---|---|
| [Hooks & Events Guide](../HOOKS_AND_EVENTS_GUIDE.md) | Every hook and browser event used in the app | Your instructor asks "what is a hook?" or "how does X work?" |
| [State Management Guide](STATE_MANAGEMENT_GUIDE.md) | How data is stored, shared, and updated | Your instructor asks "how does the cart work?" or "where is data stored?" |
| [Architecture Guide](ARCHITECTURE_GUIDE.md) | Why the project is structured the way it is | Your instructor asks "why did you choose X?" or "what would you change?" |
| [Data Flow Guide](DATA_FLOW_GUIDE.md) | Step-by-step trace of every user action | Your instructor asks "trace what happens when..." |
| [Component Guide](COMPONENT_GUIDE.md) | What every file does and how it connects | Your instructor asks "what does this component do?" |
| [Animations Guide](ANIMATIONS_GUIDE.md) | How every animation works and why | Your instructor asks "how does the fly animation work?" |
| [PWA & Offline Guide](PWA_AND_OFFLINE_GUIDE.md) | How the app installs and works offline | Your instructor asks "what makes this a PWA?" |
| [Design System Guide](DESIGN_SYSTEM_GUIDE.md) | Colors, fonts, and the visual language | Your instructor asks "why does it look like this?" |

---

## 🚀 Quick Start

```bash
cd crmb-kiosk
npm install
npm run dev
```

Open `http://localhost:5173`

---

## 🔐 Admin Access

Hold the **CRMB logo** on the splash screen for **3 seconds**.

Login: `crmb` / `admin`

---

## 🗂️ Project Structure (Quick Reference)

```
src/
├── admin/        ← Staff-only pages (login, dashboard)
├── components/   ← Reusable UI pieces
├── context/      ← Global state (cart, products, audio, etc.)
├── data/         ← Static seed data
├── hooks/        ← Reusable behaviour logic
├── pages/        ← Customer-facing screens
└── utils/        ← Pure helper functions
```

---

## 🧠 The 5 Most Important Concepts

1. **React Context** — shared data that any component can read without prop drilling
2. **useState** — a component's local memory; when it changes, the screen updates
3. **useEffect** — "when X changes, do Y" — used for side effects like saving to localStorage
4. **localStorage** — the browser's built-in storage; persists cart, products, and orders
5. **Framer Motion** — the animation library; `AnimatePresence` handles exit animations

---

*CRMB Artisan Bakery & Café — Est. 2024 — Manila, PH*
