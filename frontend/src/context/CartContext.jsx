import { createContext, useContext, useReducer, useEffect } from 'react';

/**
 * CartContext
 * ─────────────────────────────────────────────────────────────
 * Global cart state for the entire kiosk app.
 * Uses useReducer for predictable state transitions and persists
 * the cart to localStorage so it survives page refreshes.
 *
 * WHY a context?
 *   The cart needs to be accessible from many unrelated components:
 *   - Menu.jsx adds items
 *   - CartButton.jsx shows the count
 *   - Cart.jsx displays and modifies items
 *   - Checkout.jsx reads the total and clears on success
 *   Passing cart state as props through every component would be
 *   messy and brittle. Context makes it globally available cleanly.
 *
 * WHY useReducer instead of useState?
 *   Cart state has multiple complex transitions (add, remove, update,
 *   clear). useReducer centralises all that logic in one pure function
 *   (cartReducer) making it easy to test, read, and extend. It also
 *   prevents bugs from scattered setState calls.
 *
 * WHY localStorage?
 *   Kiosk screens can be refreshed or crash. Persisting to localStorage
 *   means a customer's cart survives an accidental page reload.
 *
 * ─────────────────────────────────────────────────────────────
 * HOOK: useCart()
 * ─────────────────────────────────────────────────────────────
 * WHY it exists:
 *   Wraps useContext(CartContext) with a guard so you get a clear
 *   error message if you forget to add CartProvider. Also keeps
 *   imports clean — one import instead of two.
 *
 * WHAT it returns:
 *   cart           — array of { ...product, quantity } objects
 *   addItem(p)     — add product p (or increment if already in cart)
 *   removeItem(id) — remove product by id entirely
 *   updateQuantity(id, qty) — set exact quantity (removes if qty <= 0)
 *   clearCart()    — empty the cart (called after checkout)
 *   total          — sum of (price × quantity) for all items, in PHP
 *   itemCount      — total units across all items (shown on cart badge)
 *
 * WHERE it's used:
 *   Menu.jsx, ProductDetails.jsx, Cart.jsx, Checkout.jsx, CartButton.jsx
 *
 * EXAMPLE:
 *   const { addItem, total } = useCart();
 *   addItem(product);
 *   console.log(total); // e.g. 450
 */

const CartContext = createContext(null);

/**
 * cartReducer — pure function that handles all cart state transitions.
 * Each case returns a new array without mutating the existing state.
 *
 * Actions:
 *   ADD_ITEM       { payload: product }         — add or increment
 *   REMOVE_ITEM    { payload: id }              — remove by id
 *   UPDATE_QUANTITY { payload: { id, quantity }} — set exact qty
 *   CLEAR_CART     —                            — empty array
 */
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find((i) => i._id === action.payload._id);
      if (existing) {
        return state.map((i) =>
          i._id === action.payload._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    }

    case 'REMOVE_ITEM':
      return state.filter((i) => i._id !== action.payload);

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) return state.filter((i) => i._id !== id);
      return state.map((i) => (i._id === id ? { ...i, quantity } : i));
    }

    case 'CLEAR_CART':
      return [];

    default:
      return state;
  }
};

/**
 * loadCart — reads the persisted cart from localStorage on startup.
 * Passed as the initializer function to useReducer so it only runs once.
 */
const loadCart = () => {
  try {
    const saved = localStorage.getItem('crmb_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return []; // if JSON is corrupt, start fresh
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, [], loadCart);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('crmb_cart', JSON.stringify(cart));
  }, [cart]);

  // Action creators — thin wrappers around dispatch
  const addItem       = (product)          => dispatch({ type: 'ADD_ITEM',        payload: product });
  const removeItem    = (id)               => dispatch({ type: 'REMOVE_ITEM',     payload: id });
  const updateQuantity = (id, quantity)    => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const clearCart     = ()                 => dispatch({ type: 'CLEAR_CART' });

  // Derived values — computed from cart state
  const total     = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

/**
 * useCart
 * ─────────────────────────────────────────────────────────────
 * Custom hook to consume the CartContext.
 *
 * WHY a custom hook instead of useContext(CartContext) directly?
 *   1. Cleaner API — components write `useCart()` not
 *      `useContext(CartContext)` (which needs two imports)
 *   2. Error guard — if you use useCart() outside CartProvider,
 *      you get a clear message instead of a confusing undefined error
 *   3. Single source of truth — if the context shape ever changes,
 *      you only update this one hook, not every consumer
 *
 * RULE: Must be called inside a component that is a descendant
 * of <CartProvider>. CartProvider wraps the whole app in App.jsx.
 */
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
