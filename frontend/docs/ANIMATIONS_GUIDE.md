# CRMB Kiosk — Animations Guide
### How Every Animation Works and Why It's There

---

> **Who this is for:** Anyone who wants to understand the animations — what triggers them, how they're built, and why they make the app feel better. No animation experience needed.

---

## 🎬 Why Animations Matter in a Kiosk

A kiosk is a touchscreen device used by people who may have never seen the app before. Animations serve three purposes:

1. **Feedback** — "Yes, your tap registered." Without animations, users tap again thinking nothing happened.
2. **Orientation** — "You moved forward" (slide right) vs "you went back" (slide left). Animations communicate navigation direction.
3. **Delight** — A premium café deserves a premium feel. Smooth animations signal quality.

---

## 🛠️ The Animation Library: Framer Motion

All animations in CRMB use **Framer Motion** — a React animation library.

The key concept: instead of writing CSS animations manually, you describe *what state something should be in* and Framer Motion figures out how to get there smoothly.

**The three most important Framer Motion concepts:**

### `motion.div` / `motion.button` / `motion.img`
Adding `motion.` in front of any HTML element gives it animation superpowers.

```jsx
// Regular div — no animation
<div>Hello</div>

// Motion div — can animate
<motion.div
  initial={{ opacity: 0 }}   // starts invisible
  animate={{ opacity: 1 }}   // animates to visible
>
  Hello
</motion.div>
```

### `AnimatePresence`
Lets elements play an exit animation before they're removed from the screen. Without this, elements just disappear instantly.

```jsx
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}   // plays when isVisible becomes false
    >
      I fade in and out
    </motion.div>
  )}
</AnimatePresence>
```

### `whileTap` / `whileHover`
Shorthand for "animate to this state while the user is pressing/hovering."

```jsx
<motion.button whileTap={{ scale: 0.95 }}>
  Press me — I shrink slightly
</motion.button>
```

---

## 🗂️ Every Animation in CRMB

---

### 1. Page Transitions — Directional Slide

**What it looks like:** When navigating forward (e.g. Menu → Product), the new page slides in from the right and the old page slides out to the left. Going back reverses this.

**Why:** Mimics the natural mental model of "going deeper" (right) and "going back" (left). Users intuitively understand where they are.

**How it works:**
```
App.jsx calculates direction:
  routeOrder = ['/', '/menu', '/product', '/cart', '/checkout']
  dir = depth(new route) - depth(old route)
  dir > 0 = going forward = slide right
  dir < 0 = going back = slide left
  dir = 0 = same level = fade only

PageWrapper variants:
  enter:  x: dir > 0 ? '60%' : '-60%', opacity: 0
  center: x: 0, opacity: 1
  exit:   x: dir > 0 ? '-30%' : '30%', opacity: 0
```

The exit moves at 30% (not 60%) creating a parallax effect — the old page moves slower than the new one arrives, giving depth.

**Duration:** 280ms with `ease: [0.25, 0.1, 0.25, 1]` (standard browser ease-out curve — no spring overshoot)

---

### 2. Product Card Hover — Lift and Shadow

**What it looks like:** When hovering over a product card, it lifts 6px upward and the shadow deepens.

**Why:** Signals interactivity. On a touchscreen, this happens on press instead of hover.

**How it works:**
```jsx
<motion.article
  whileHover={{ y: -6 }}
  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
>
```

The card body also gets a deeper shadow on hover:
```jsx
<motion.div
  whileHover={{ boxShadow: '0 12px 40px rgba(30,20,10,0.14)' }}
>
```

---

### 3. Product Card Image Zoom

**What it looks like:** The product image zooms in slightly when the card is hovered.

**Why:** Creates a sense of depth and draws attention to the food photography.

**How it works:** The image uses `motion.img` with `whileHover={{ scale: 1.08 }}`. The image container has `overflow: hidden` so the zoom is clipped to the card boundary.

---

### 4. Add Button — "Add" ↔ "Added" Transition

**What it looks like:** When tapped, the "Add" text slides down and out, and "Added" (with a checkmark) slides up and in. The button also does a bounce.

**Why:** Clear confirmation that the tap registered. The directional slide (down/up) feels like the text is being replaced, not just swapped.

**How it works:**
```jsx
<AnimatePresence mode="wait">
  {isAdded ? (
    <motion.span key="added"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}>
      ✓ Added
    </motion.span>
  ) : (
    <motion.span key="add"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}>
      + Add
    </motion.span>
  )}
</AnimatePresence>
```

The button bounce:
```jsx
animate={isAdded ? { scale: [1, 1.18, 0.95, 1.05, 1] } : {}}
```

---

### 5. Fly to Cart — Product Image Animation

**What it looks like:** When "Add" is tapped, a small thumbnail of the product image launches from the card and flies toward the cart button, shrinking and fading as it arrives.

**Why:** The most satisfying micro-interaction in the app. It visually confirms where the item went and draws attention to the cart button.

**How it works:**
1. `flyToCart(imgSrc, originRect)` is called with the image URL and the source element's screen position
2. `FlyContext` reads the cart button's screen position via `cartRef`
3. A `motion.img` is rendered at the source position (fixed, z-index 9999)
4. It animates: translate to cart position, scale 0.3, opacity 0
5. After 700ms it's removed from state

```jsx
<motion.img
  initial={{ scale: 1, opacity: 1, x: 0, y: 0 }}
  animate={{
    x: fly.to.x - fly.from.x,  // how far to move horizontally
    y: fly.to.y - fly.from.y,  // how far to move vertically
    scale: 0.3,
    opacity: 0,
  }}
  transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
/>
```

---

### 6. Cart Button Bump

**What it looks like:** When an item is added, the cart button does a spring bounce and the bag icon wobbles.

**Why:** Draws the customer's eye to the cart button, confirming the item was added there.

**How it works:**
```jsx
// Detected in useEffect when itemCount increases:
controls.start({
  scale: [1, 1.2, 0.92, 1.06, 1],  // overshoot spring sequence
  transition: { duration: 0.42 }
});

// Bag icon wobble:
<motion.div
  key={itemCount}  // re-mounts on every count change
  animate={{ rotate: [0, -14, 10, -5, 0] }}
>
```

---

### 7. Cart Badge — Spring Pop

**What it looks like:** The item count badge on the cart button pops in with an overshoot spring when it first appears or changes.

**Why:** The overshoot (going past 1 then settling back) feels alive and satisfying.

**How it works:**
```jsx
<motion.span
  key={itemCount}  // re-mounts on every change to replay animation
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: [0, 1.35, 1], opacity: 1 }}  // overshoot to 1.35 then settle
  exit={{ scale: 0, opacity: 0 }}
  transition={{ type: 'spring', stiffness: 420, damping: 16 }}
>
```

---

### 8. Ripple Effect

**What it looks like:** When a `RippleButton` is tapped, a white circle expands from the exact tap point and fades out.

**Why:** Tactile feedback. Confirms the exact point of contact, like a real physical button press.

**How it works (not Framer Motion — pure DOM + CSS):**
1. Read tap coordinates relative to the button
2. Create a `<span>` element at those coordinates
3. Apply CSS: `animation: crmb-ripple 0.5s ease-out forwards`
4. The keyframe: `transform: scale(0) → scale(1)` with `opacity: 0` at end
5. Remove the element after 520ms

This is done imperatively (creating DOM elements directly) rather than with React state, because it needs to be instantaneous and shouldn't cause re-renders.

---

### 9. Cart Item Removal

**What it looks like:** When the trash button is tapped, the item slides right and fades out. The remaining items smoothly reflow into the gap.

**Why:** Without animation, items would just disappear and the list would jump. The animation makes it clear what happened and where.

**How it works:**
```jsx
// Two-step process:
// 1. Animate the item out (280ms)
animate={removingId === item.id
  ? { opacity: 0, x: 40, scale: 0.92 }
  : { opacity: 1, x: 0, scale: 1 }
}

// 2. After 280ms, actually remove from state
setTimeout(() => { removeItem(id); }, 280);

// The layout prop on remaining items:
<motion.div layout>  // automatically animates position changes
```

---

### 10. Quantity Number Transition

**What it looks like:** When + or − is tapped, the number slides up (increment) or down (decrement) and is replaced by the new number.

**Why:** The direction of the slide communicates whether the number went up or down — a subtle but meaningful detail.

**How it works:**
```jsx
// qtyDir: 1 = up, -1 = down
<AnimatePresence mode="wait" custom={qtyDir}>
  <motion.span
    key={qty}
    custom={qtyDir}
    variants={{
      enter: (d) => ({ y: d > 0 ? -16 : 16, opacity: 0 }),
      center: { y: 0, opacity: 1 },
      exit:  (d) => ({ y: d > 0 ? 16 : -16, opacity: 0 }),
    }}
  >
    {qty}
  </motion.span>
</AnimatePresence>
```

---

### 11. Queue Progress Animation

**What it looks like:** During checkout, a 4-step progress indicator shows Received → Preparing → Baking → Ready. Each step has an icon that springs in, and a connecting line that fills progressively.

**Why:** Gives the customer something to watch during the simulated wait. Makes the app feel like a real ordering system.

**How it works:**
- The connecting line is a `motion.div` with `scaleX` animating from 0 to the current fraction
- Each step icon uses `motion.div` with a pulsing glow when active
- Completed steps show an animated checkmark that springs in with rotation
- The progress bar at the bottom fills with a gradient

---

### 12. Receipt Reveal — Staggered Row Animation

**What it looks like:** On the success screen, the receipt items appear one by one from top to bottom, like a real receipt printing out.

**Why:** The most theatrical moment in the app. It makes the confirmation feel ceremonial and satisfying.

**How it works:**
```jsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.07,  // 70ms between each child
        delayChildren: 0.5      // start after 500ms
      }
    }
  }}
>
  {cartSnapshot.map((item) => (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -12, height: 0 },
        visible: { opacity: 1, x: 0, height: 'auto' }
      }}
    >
      {item.name} × {item.quantity}
    </motion.div>
  ))}
</motion.div>
```

---

### 13. Morphing Checkout Button

**What it looks like:** When "Confirm Order" is tapped, the button shrinks from full-width to a small circle, and the text morphs into a spinning loader.

**Why:** Prevents double-tapping. Clearly communicates that the order is being processed. The morph is more interesting than a simple disabled state.

**How it works:**
```jsx
<motion.button
  animate={pressed
    ? { width: 56, borderRadius: 28 }   // becomes a circle
    : { width: '100%', borderRadius: 12 } // full width pill
  }
  transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
>
  <AnimatePresence mode="wait">
    {pressed ? <Spinner /> : <Label />}
  </AnimatePresence>
</motion.button>
```

---

### 14. Long Press Progress Ring

**What it looks like:** When holding the CRMB logo, an amber circle draws around it progressively over 3 seconds.

**Why:** Gives visual feedback that the hold is being detected and shows how much longer to hold.

**How it works:**
```jsx
// SVG circle with animated strokeDashoffset
<motion.circle
  strokeDasharray={301.6}  // circumference of the circle (2π × 48)
  animate={{ strokeDashoffset: 301.6 * (1 - holdProgress) }}
  // holdProgress goes from 0 to 1 over 3 seconds
  // At 0: full gap (invisible)
  // At 1: no gap (full circle drawn)
/>
```

---

### 15. Skeleton Shimmer

**What it looks like:** During the 900ms loading period on the menu, placeholder cards show a white shimmer sweeping left to right.

**Why:** Tells the user content is loading without a blank screen or spinner. The shimmer matches the exact shape of the real cards, so the transition feels seamless.

**How it works:**
```jsx
<motion.div
  style={{
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
    backgroundSize: '200% 100%',
  }}
  animate={{ backgroundPosition: ['-200% 0', '200% 0'] }}
  transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
/>
```

---

## ❓ Common Instructor Questions

**Q: Why Framer Motion instead of CSS animations?**
CSS animations are great for simple transitions but become complex for interactive animations (like the fly-to-cart that needs to calculate positions at runtime) or exit animations (which CSS can't do without JavaScript anyway). Framer Motion handles all of this declaratively.

**Q: What is `AnimatePresence` and why is it needed?**
React removes elements from the DOM immediately when they're no longer rendered. `AnimatePresence` intercepts this removal, lets the element play its exit animation, and then removes it. Without it, exit animations are impossible.

**Q: What's the difference between `spring` and `ease` transitions?**
`ease` follows a fixed curve (like CSS `ease-out`) — it always takes the same time. `spring` simulates physics — it can overshoot and bounce back, which feels more natural for UI interactions. We use `spring` for interactive elements (buttons, badges) and `ease` for page transitions.

**Q: Why does the cart badge use `key={itemCount}`?**
When React sees the same component with a new `key`, it treats it as a completely new component — unmounting the old one and mounting a new one. This forces the badge to replay its entrance animation every time the count changes, even though it's the same element.

---

*CRMB Artisan Bakery & Café — Internal Technical Reference*
