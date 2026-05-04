# CRMB Kiosk — Design System Guide
### The Visual Language of the App and Why Every Choice Was Made

---

> **Who this is for:** Anyone who wants to understand why the app looks the way it does — the colors, fonts, spacing, and the overall aesthetic direction. No design experience needed.

---

## 🎨 The Design Direction: Jazz Café Aesthetic

CRMB is an artisan bakery and café. The visual design should feel like walking into a warm, dimly lit jazz café — not a fast food chain, not a tech startup.

**The mood we're going for:**
- Warm, cozy, intimate
- Premium but approachable
- Timeless, not trendy
- Like aged paper, espresso, candlelight, and vinyl records

Every design decision — colors, fonts, spacing, animations — is made to reinforce this feeling.

---

## 🎨 The Color Palette

All colors are defined as CSS custom properties (variables) in `src/index.css`. This means changing a color in one place updates it everywhere in the app.

### The Full Palette

| Variable | Hex Value | Color | Used for |
|---|---|---|---|
| `--ink` | `#1e140a` | Deep tobacco brown | Primary text, main buttons |
| `--ink-soft` | `#4a3728` | Medium brown | Secondary text, labels |
| `--ink-muted` | `#8a6e5a` | Dusty taupe | Placeholder text, captions |
| `--parchment` | `#f5efe6` | Aged paper | Page backgrounds |
| `--parchment2` | `#ede4d8` | Slightly darker paper | Input backgrounds, secondary surfaces |
| `--parchment3` | `#e2d5c4` | Warm beige | Borders, dividers |
| `--cream` | `#faf7f2` | Near-white | Text on dark backgrounds |
| `--card` | `#ffffff` | Pure white | Card backgrounds |
| `--amber` | `#c8913a` | Warm amber | Primary accent, highlights, gold |
| `--amber-light` | `#e8b96a` | Lighter amber | Gradient highlights |
| `--amber-pale` | `#f5e4c0` | Amber tint | Subtle amber backgrounds |
| `--rose` | `#c4796a` | Dusty rose | Destructive actions, remove buttons |
| `--rose-pale` | `#f5e8e5` | Rose tint | Remove button backgrounds |
| `--sage` | `#7a9080` | Muted sage green | Success states, "Added" confirmation |
| `--sage-pale` | `#e8f0ec` | Sage tint | Success backgrounds |
| `--espresso` | `#1e140a` | Darkest brown | Primary buttons, dark surfaces |
| `--espresso2` | `#2e1e10` | Slightly lighter | Hero banners, dark cards |
| `--espresso3` | `#3e2a18` | Hover state | Gradient endpoints |

### Why These Colors?

**Parchment backgrounds** (`#f5efe6`) — Not pure white. Pure white feels clinical and cold. Aged parchment feels warm and inviting, like a handwritten menu.

**Amber accent** (`#c8913a`) — The color of espresso crema, honey, and candlelight. It's warm, premium, and immediately associated with café culture.

**Dusty rose** (`#c4796a`) — Used only for destructive actions (delete, remove). It's warm enough to fit the palette but distinct enough to signal "caution."

**Muted sage** (`#7a9080`) — Used for success states. It's calm and reassuring without being the aggressive green of a traffic light.

**No pure black** — Every "dark" color has warm brown undertones. Pure black (`#000000`) would feel harsh and out of place in a warm café aesthetic.

---

## 🔤 Typography

Three fonts are used, each with a specific role:

### Cormorant Garamond — The Serif (Headings & Prices)

**What it looks like:** Elegant, slightly condensed, with beautiful italic forms.

**Where it's used:**
- Page headings ("The Full Menu", "Your Order")
- Product names on cards
- Prices (₱120.00)
- The CRMB wordmark
- Receipt text
- Italic labels and taglines

**Why:** Cormorant Garamond has the feel of a printed menu from a fine restaurant. It's editorial, timeless, and slightly formal — exactly right for a premium bakery brand. The italic variant is especially beautiful and used for decorative text.

### DM Sans — The Sans-Serif (Body & UI)

**What it looks like:** Clean, geometric, highly readable at small sizes.

**Where it's used:**
- Body copy and descriptions
- Button labels
- Category tags
- Form inputs
- Navigation labels
- All functional UI text

**Why:** DM Sans was designed specifically for digital interfaces. It's extremely readable at small sizes (important for a kiosk where text might be read from a distance) and has a friendly, approachable quality that balances the formality of Cormorant Garamond.

### DM Mono — The Monospace (Order IDs)

**What it looks like:** Fixed-width, technical, like a typewriter.

**Where it's used:**
- Order IDs (e.g. `CRMB-LX4K2A-F3R9`)

**Why:** Order IDs are technical identifiers. Monospace fonts make them easier to read character by character and signal "this is a code/reference number." It also adds a subtle receipt-like quality to the success screen.

### How Fonts Are Loaded

All three fonts are loaded from Google Fonts in `index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=DM+Mono:wght@400;500&display=swap');
```

They're also cached by the service worker so they work offline.

---

## 📐 Spacing & Sizing

CRMB uses **Tailwind CSS** for spacing. Tailwind uses a 4px base unit:

| Class | Size | Used for |
|---|---|---|
| `p-3.5` | 14px | Card padding |
| `px-5` | 20px | Page horizontal padding |
| `py-4` | 16px | Button vertical padding |
| `gap-3` | 12px | Space between items |
| `rounded-xl` | 12px radius | Buttons, inputs |
| `rounded-2xl` | 16px radius | Cards |
| `rounded-3xl` | 24px radius | Large cards, modals |

**Why large border radii?** Rounded corners feel friendlier and more modern. Sharp corners feel corporate and cold. The large radii (16-24px) are consistent with premium app design in 2024.

**Why generous padding?** This is a touchscreen kiosk. Tap targets need to be large enough for fingers. The minimum recommended tap target size is 44×44px — all interactive elements meet or exceed this.

---

## 🌑 The Dark Splash Screen

The splash screen uses a completely different palette — deep espresso browns with amber accents on a near-black background.

**Why different from the rest of the app?**

The splash screen is the first thing a customer sees. It needs to:
1. Make a strong first impression
2. Feel premium and atmospheric
3. Stand out from the lighter menu screens

The dark background with warm amber glow pools creates a "candlelit room" effect — intimate and inviting. It's the visual equivalent of walking through a café door at night.

---

## 🎭 The Admin Panel

The admin panel uses the same design tokens as the customer-facing app but with a more functional, less decorative layout.

**Why the same design language?**
Consistency. Staff who use both the customer menu and the admin panel should feel like they're in the same app. Using the same colors, fonts, and spacing creates that continuity.

**What's different:**
- No hero banners or decorative elements
- More data-dense layout (tables, stats)
- Functional modals instead of full-page flows
- The admin login uses the dark splash palette to signal "this is a different mode"

---

## 🧩 Design Tokens — Why Variables Matter

All colors are defined as CSS variables (also called "design tokens"):

```css
:root {
  --amber: #c8913a;
  --parchment: #f5efe6;
  /* etc. */
}
```

**Why not just write the hex codes directly?**

Imagine the café decides to rebrand and change the amber accent from `#c8913a` to `#d4a853`. Without variables, you'd need to find and replace every instance of that color across dozens of files. With variables, you change it in one place and it updates everywhere instantly.

This is the same principle as using a variable in code instead of a "magic number."

---

## 📱 Responsive Design

CRMB is designed primarily for **tablet screens** (768px–1024px) in portrait orientation — the typical kiosk form factor.

**Breakpoints used:**
- `sm:` (640px+) — shows "Order" text next to cart icon
- `md:` (768px+) — shows NowPlaying in menu header, 3-column product grid

**On mobile (< 640px):**
- 2-column product grid
- Cart button shows icon only (no "Order" text)
- NowPlaying hidden from header (still on splash)

**On desktop (> 1024px):**
- Content is max-width constrained (`max-w-5xl` = 1024px, `max-w-xl` = 576px)
- Centered with parchment background on sides

---

## ✨ The "Jazz Café" Details

Small details that reinforce the aesthetic:

| Detail | Where | Why |
|---|---|---|
| Floating ♪ notes | Splash screen | Jazz atmosphere |
| Ornamental dot dividers (• · •) | Menu, Cart, Checkout | Like a printed menu |
| Dashed dividers | Receipt, Cart summary | Like a real receipt |
| Italic serif headings | Throughout | Editorial, magazine-like |
| "Baked fresh every morning ♪" | Menu footer | Handwritten menu feel |
| "Thank you for choosing CRMB" | Receipt | Personal, warm |
| Spinning vinyl disc | NowPlaying expanded | Jazz record player |
| Animated equalizer bars | NowPlaying | Live music feel |
| Amber glow pools | Splash, hero banners | Candlelight effect |

---

## ❓ Common Instructor Questions

**Q: Why not use a component library like Material UI or Chakra?**
Component libraries impose their own design language. CRMB has a very specific aesthetic (jazz café, warm parchment, amber accents) that would be difficult to achieve with a pre-built library. Tailwind CSS gives full control while still providing a consistent spacing and sizing system.

**Q: Why Tailwind CSS instead of regular CSS or CSS modules?**
Tailwind's utility classes mean you never leave the JSX file to style a component. For a team project, it also enforces consistency — everyone uses the same spacing scale, the same border radii, the same font sizes. The design tokens in `index.css` extend Tailwind with CRMB-specific colors.

**Q: How do you ensure the design is consistent across the whole app?**
Three mechanisms: (1) CSS custom properties for all colors, (2) Tailwind's utility system for spacing and sizing, (3) reusable components like `RippleButton` that encapsulate consistent styling. Any change to a design token or component propagates everywhere automatically.

**Q: Why is the splash screen dark when the rest of the app is light?**
The splash screen is a brand moment — it's the first impression. The dark, atmospheric design creates impact and sets the premium tone. The lighter parchment palette for the menu is more practical for reading product information. The contrast between the two also makes the transition from splash to menu feel like "entering" the café.

---

*CRMB Artisan Bakery & Café — Internal Technical Reference*
