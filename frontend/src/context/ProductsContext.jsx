import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as productsApi from '../api/products';

/**
 * ProductsContext
 * ─────────────────────────────────────────────────────────────
 * Global product catalogue — now backed by the MongoDB REST API
 * instead of localStorage.
 *
 * On mount, fetches all products from GET /api/products.
 * Admin mutations (add/update/delete) call the corresponding
 * POST / PUT / DELETE endpoints and update local state on success.
 *
 * Falls back gracefully if the backend is unreachable — the
 * loading/error states let the UI show a skeleton or error message.
 *
 * HOOK: useProducts()
 * Returns:
 *   products        — array of product objects from MongoDB
 *   categories      — ['All', 'Bread', 'Pastries', 'Drinks']
 *   dailySpecial    — today's featured product (rotates by day)
 *   loading         — true while the initial fetch is in flight
 *   error           — error message string or null
 *   addProduct(p)   — POST /api/products (admin)
 *   updateProduct(p)— PUT  /api/products/:id (admin)
 *   deleteProduct(id)— DELETE /api/products/:id (admin)
 *   refreshProducts()— re-fetch from the API
 */

const ProductsContext = createContext(null);

const CATEGORIES  = ['All', 'Bread', 'Pastries', 'Drinks'];

// Specials rotation — index maps to day of week (0=Sun … 6=Sat)
const SPECIALS_ROTATION = [0, 5, 10, 3, 8, 1, 6]; // array indices into products

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  /** Fetch all products from the backend */
  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load products on mount
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  /** Add a new product via the API */
  const addProduct = useCallback(async (product) => {
    const created = await productsApi.createProduct(product);
    setProducts((prev) => [...prev, created]);
    return created;
  }, []);

  /** Update an existing product via the API */
  const updateProduct = useCallback(async (updated) => {
    const saved = await productsApi.updateProduct(updated._id, updated);
    setProducts((prev) => prev.map((p) => (p._id === saved._id ? saved : p)));
    return saved;
  }, []);

  /** Delete a product via the API */
  const deleteProduct = useCallback(async (id) => {
    await productsApi.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  }, []);

  // Compute daily special from the current product list
  const todayIdx     = new Date().getDay(); // 0–6
  const specialIndex = SPECIALS_ROTATION[todayIdx];
  const dailySpecial = products[specialIndex] ?? products[0] ?? null;

  return (
    <ProductsContext.Provider value={{
      products,
      categories: CATEGORIES,
      dailySpecial,
      loading,
      error,
      addProduct,
      updateProduct,
      deleteProduct,
      refreshProducts,
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

/** useProducts — consume the ProductsContext */
export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be inside ProductsProvider');
  return ctx;
};
