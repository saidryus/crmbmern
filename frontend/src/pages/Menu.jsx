import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, X, Star, Coffee, Wheat, Croissant, UtensilsCrossed, Sparkles } from "lucide-react";
import { useProducts } from "../context/ProductsContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useFly } from "../context/FlyContext";
import { formatPrice } from "../utils/formatPrice";
import CartButton from "../components/cart/CartButton";
import SkeletonCard from "../components/common/SkeletonCard";
import NowPlaying from "../components/common/NowPlaying";
import RippleButton from "../components/common/RippleButton";
import { useSound } from "../hooks/useSound";

const catMeta = {
  All:      { label: "The Full Menu",  sub: "Everything we make",    icon: UtensilsCrossed },
  Bread:    { label: "From the Oven",  sub: "Baked fresh daily",      icon: Wheat           },
  Pastries: { label: "Pastry Corner",  sub: "Buttery, flaky, golden", icon: Croissant       },
  Drinks:   { label: "At the Bar",     sub: "Brewed with intention",  icon: Coffee          },
};

const tagStyle = {
  Vegan:    { bg: "rgba(122,144,128,0.18)", color: "var(--sage)"  },
  New:      { bg: "rgba(200,145,58,0.18)",  color: "var(--amber)" },
  Seasonal: { bg: "rgba(196,121,106,0.18)", color: "var(--rose)"  },
};
const HIGHLIGHT_TAGS = ["Vegan", "New", "Seasonal"];

function OrnamentDivider({ className = "" }) {
  return (
    <div className={"flex items-center gap-3 " + className}>
      <div className="h-px flex-1" style={{ background: "var(--parchment3)" }} />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="1.5" fill="var(--parchment3)" />
        <circle cx="2" cy="7" r="1" fill="var(--parchment3)" />
        <circle cx="12" cy="7" r="1" fill="var(--parchment3)" />
      </svg>
      <div className="h-px flex-1" style={{ background: "var(--parchment3)" }} />
    </div>
  );
}

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [addedId, setAddedId] = useState(null);
  const { products, categories, dailySpecial, loading, error } = useProducts();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { flyToCart } = useFly();
  const navigate = useNavigate();
  const { playAddToCart, playSelect, playNav } = useSound();

  const filtered = useMemo(() => products.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && p.available;
  }), [products, activeCategory, search]);

  const bestSellers = products.filter((p) => p.bestSeller);
  const meta = catMeta[activeCategory] || catMeta.All;

  const handleAdd = (e, product) => {
    e.stopPropagation();
    addItem(product);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 950);
    playAddToCart();
    addToast({ title: product.name + " added", subtitle: formatPrice(product.price), image: product.image });
    const rect = e.currentTarget.closest('article')?.querySelector('img')?.getBoundingClientRect()
      || e.currentTarget.getBoundingClientRect();
    flyToCart(product.image, rect);
  };

  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--parchment)" }}>
      <header className="sticky top-0 z-40 px-5 py-3"
        style={{ background: "rgba(245,239,230,0.96)", backdropFilter: "blur(24px)", borderBottom: "1px solid var(--parchment3)" }}>
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={() => { playNav(); navigate("/"); }} className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--espresso)" }}>
              <span className="font-serif font-bold text-sm leading-none" style={{ color: "var(--amber)" }}>C</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-serif font-bold leading-none tracking-[0.18em] text-base" style={{ color: "var(--ink)" }}>CRMB</p>
              <p className="text-xs font-light leading-none mt-0.5 italic" style={{ color: "var(--ink-muted)", fontFamily: "Cormorant Garamond, serif" }}>Artisan Bakery</p>
            </div>
          </button>
          <div className="hidden md:flex flex-1 justify-center"><NowPlaying dark={false} /></div>
          <div className="flex-1 md:flex-none relative md:w-52">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ink-muted)" }} />
            <input type="text" placeholder="Search the menu..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--parchment2)", color: "var(--ink)", border: "1px solid var(--parchment3)", fontFamily: "DM Sans, sans-serif", fontWeight: 300 }} />
            <AnimatePresence>
              {search && (
                <motion.button className="absolute right-2.5 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}
                  initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
                  <X size={12} style={{ color: "var(--ink-muted)" }} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <CartButton />
        </div>
      </header>

      <AnimatePresence>
        {!search && (
          <motion.div className="relative overflow-hidden"
            style={{ background: "linear-gradient(160deg, var(--espresso) 0%, var(--espresso3) 100%)", minHeight: 210 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 15% 60%, rgba(200,145,58,0.14) 0%, transparent 55%)" }} />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 font-serif font-bold select-none pointer-events-none"
              style={{ fontSize: 170, lineHeight: 1, color: "rgba(200,145,58,0.055)" }}>
              {activeCategory === "All" ? "M" : activeCategory[0]}
            </div>
            <div className="relative max-w-5xl mx-auto px-5 py-8">
              <motion.div key={activeCategory + "sub"} className="flex items-center gap-2 mb-3"
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }}>
                <div className="w-px h-4" style={{ background: "var(--amber)" }} />
                <span className="text-xs tracking-[0.3em] uppercase font-medium" style={{ color: "var(--amber)", fontFamily: "DM Sans, sans-serif" }}>{meta.sub}</span>
              </motion.div>
              <motion.h1 key={activeCategory + "h"} className="font-serif font-bold mb-5"
                style={{ fontSize: "clamp(28px, 5vw, 42px)", color: "var(--cream)", lineHeight: 1.1 }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.04 }}>
                {meta.label}
              </motion.h1>
              <AnimatePresence>
                {activeCategory === "All" && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.28, delay: 0.08 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Star size={11} fill="var(--amber)" stroke="none" />
                      <span className="text-xs tracking-[0.2em] uppercase" style={{ color: "rgba(200,145,58,0.7)", fontFamily: "DM Sans, sans-serif", fontWeight: 500 }}>House Favourites</span>
                    </div>
                    <div className="flex gap-2.5 overflow-x-auto pb-1">
                      {bestSellers.map((p) => (
                        <motion.button key={p._id} className="flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl text-left"
                          style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(200,145,58,0.18)", minWidth: 168 }}
                          whileTap={{ scale: 0.95 }} whileHover={{ background: "rgba(255,255,255,0.09)" }}
                          onClick={() => { playNav(); navigate("/product/" + p._id); }}>
                          <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" style={{ border: "1px solid rgba(200,145,58,0.14)" }} />
                          <div className="min-w-0">
                            <p className="text-xs font-medium leading-snug truncate" style={{ color: "var(--cream)", fontFamily: "DM Sans, sans-serif" }}>{p.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--amber-light)", fontFamily: "Cormorant Garamond, serif", fontWeight: 600 }}>{formatPrice(p.price)}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeCategory === "All" && !search && dailySpecial && (
          <motion.div className="max-w-5xl mx-auto px-5 pt-5"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <DailySpecialCard product={dailySpecial} onAdd={(e) => handleAdd(e, dailySpecial)}
              isAdded={addedId === dailySpecial._id} onClick={() => navigate("/product/" + dailySpecial._id)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sticky z-30 px-5 py-3"
        style={{ top: 57, background: "rgba(245,239,230,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--parchment3)" }}>
        <div className="max-w-5xl mx-auto flex gap-2 overflow-x-auto pb-0.5">
          {categories.map((cat) => {
            const active = activeCategory === cat;
            const Icon = catMeta[cat]?.icon;
            return (
              <motion.button key={cat} onClick={() => { playSelect(); setActiveCategory(cat); }}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm"
                style={active
                  ? { background: "var(--espresso)", color: "var(--cream)", fontFamily: "DM Sans, sans-serif", fontWeight: 500 }
                  : { background: "transparent", color: "var(--ink-soft)", border: "1px solid var(--parchment3)", fontFamily: "DM Sans, sans-serif" }}
                whileTap={{ scale: 0.93 }}>
                {Icon && <Icon size={12} />}
                {cat === "All" ? "All" : catMeta[cat]?.label.split(" ")[0]}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 pt-6">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-serif italic text-xl" style={{ color: "var(--ink)" }}>{search ? ('"' + search + '"') : meta.label}</p>
            <p className="text-xs font-light mt-0.5" style={{ color: "var(--ink-muted)", fontFamily: "DM Sans, sans-serif" }}>
              {filtered.length} {filtered.length === 1 ? "item" : "items"} available
            </p>
          </div>
          {!search && activeCategory === "All" && (
            <p className="text-xs italic font-light hidden md:block" style={{ color: "var(--ink-muted)", fontFamily: "Cormorant Garamond, serif" }}>Baked fresh every morning</p>
          )}
        </div>
        <OrnamentDivider className="mb-6" />
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} index={i} />)}
          </div>
        ) : error ? (
          <motion.div className="text-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="font-serif italic text-2xl mb-2" style={{ color: "var(--rose)" }}>Could not load menu</p>
            <p className="text-sm font-light" style={{ color: "var(--ink-muted)", fontFamily: "DM Sans, sans-serif" }}>
              Make sure the backend is running on port 5000
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeCategory + search} className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              {filtered.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i}
                  isAdded={addedId === product._id}
                  onAdd={(e) => handleAdd(e, product)}
                  onClick={() => navigate("/product/" + product._id)} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
        {!loading && filtered.length === 0 && (
          <motion.div className="text-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="font-serif italic text-3xl mb-2" style={{ color: "var(--parchment3)" }}>nothing here</p>
            <p className="text-sm font-light" style={{ color: "var(--ink-muted)", fontFamily: "DM Sans, sans-serif" }}>Try a different search or category</p>
          </motion.div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="mt-10 mb-4">
            <OrnamentDivider />
            <p className="text-center text-xs italic font-light mt-3" style={{ color: "var(--ink-muted)", fontFamily: "Cormorant Garamond, serif" }}>
              All items made in-house daily - CRMB Artisan Bakery and Cafe
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DailySpecialCard({ product, onAdd, isAdded, onClick }) {
  return (
    <motion.div className="relative overflow-hidden rounded-2xl mb-5 cursor-pointer group"
      style={{ background: "var(--espresso2)", border: "1px solid rgba(200,145,58,0.2)", boxShadow: "0 4px 24px rgba(30,20,10,0.12)" }}
      whileHover={{ y: -2 }} onClick={onClick}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(200,145,58,0.1) 0%, transparent 60%)" }} />
      <div className="flex items-center gap-4 p-4 relative">
        <div className="relative flex-shrink-0 overflow-hidden rounded-xl" style={{ width: 88, height: 88 }}>
          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={11} style={{ color: "var(--amber)", flexShrink: 0 }} />
            <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: "var(--amber)", fontFamily: "DM Sans, sans-serif" }}>Today s Special</span>
          </div>
          <h3 className="font-serif font-semibold text-lg leading-tight mb-1" style={{ color: "var(--cream)" }}>{product.name}</h3>
          <p className="text-xs font-light line-clamp-2 mb-2" style={{ color: "rgba(245,239,230,0.55)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.5 }}>{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="font-serif font-semibold text-base" style={{ color: "var(--amber-light)" }}>{formatPrice(product.price)}</span>
            <motion.button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium"
              style={isAdded
                ? { background: "rgba(122,144,128,0.25)", color: "var(--sage)", fontFamily: "DM Sans, sans-serif" }
                : { background: "var(--amber)", color: "var(--espresso)", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}
              onClick={onAdd} whileTap={{ scale: 0.85 }} animate={isAdded ? { scale: [1, 1.1, 1] } : {}}>
              {isAdded ? "Added" : "+ Add"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProductCard({ product, index, isAdded, onAdd, onClick }) {
  const highlightTags = (product.tags || []).filter((t) => HIGHLIGHT_TAGS.includes(t));
  return (
    <motion.article className="cursor-pointer group flex flex-col" style={{ borderRadius: 20 }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -6,
        transition: { type: 'spring', stiffness: 320, damping: 22 },
      }}
      onClick={onClick}>
      <div className="relative overflow-hidden flex-shrink-0"
        style={{ height: 172, borderRadius: "16px 16px 0 0", border: "1px solid var(--parchment3)", borderBottom: "none" }}>
        <motion.img
          src={product.image} alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
          style={{ transform: "scale(1.01)" }}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(30,20,10,0.52) 0%, rgba(30,20,10,0.04) 50%, transparent 100%)" }} />
        {product.bestSeller && (
          <motion.div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: "var(--amber)" }}
            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 + 0.18 }}>
            <Star size={8} fill="var(--espresso)" stroke="none" />
            <span style={{ fontSize: 9, fontWeight: 700, color: "var(--espresso)", fontFamily: "DM Sans, sans-serif", letterSpacing: "0.04em" }}>FAVOURITE</span>
          </motion.div>
        )}
        {highlightTags.length > 0 && (
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1">
            {highlightTags.map((tag) => {
              const s = tagStyle[tag] || {};
              return (
                <span key={tag} className="px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: s.bg, color: s.color, fontFamily: "DM Sans, sans-serif", fontSize: 9, letterSpacing: "0.04em" }}>
                  {tag}
                </span>
              );
            })}
          </div>
        )}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="font-serif font-semibold" style={{ fontSize: 15, color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>{formatPrice(product.price)}</span>
        </div>
      </div>
      <motion.div
        className="flex flex-col flex-1 p-3.5"
        style={{ background: "var(--card)", border: "1px solid var(--parchment3)", borderTop: "none", borderRadius: "0 0 16px 16px" }}
        whileHover={{ boxShadow: "0 12px 40px rgba(30,20,10,0.14)" }}
        transition={{ duration: 0.25 }}
      >
        <span className="text-xs font-medium tracking-widest uppercase mb-1.5 block"
          style={{ color: "var(--amber)", fontFamily: "DM Sans, sans-serif", fontSize: 9, letterSpacing: "0.12em" }}>{product.category}</span>
        <h3 className="font-serif font-semibold leading-snug mb-1.5 flex-1" style={{ fontSize: 15, color: "var(--ink)" }}>{product.name}</h3>
        <p className="text-xs leading-relaxed line-clamp-2 mb-3"
          style={{ color: "var(--ink-muted)", fontFamily: "DM Sans, sans-serif", fontWeight: 300, lineHeight: 1.6 }}>{product.description}</p>
        <div className="h-px mb-3" style={{ background: "var(--parchment2)" }} />
        <div className="flex items-center justify-between">
          <span className="font-serif font-semibold text-base" style={{ color: "var(--ink)" }}>{formatPrice(product.price)}</span>
          <motion.button
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium overflow-hidden"
            style={isAdded
              ? { background: "var(--sage-pale)", color: "var(--sage)", border: "1px solid rgba(122,144,128,0.3)", fontFamily: "DM Sans, sans-serif" }
              : { background: "var(--espresso)", color: "var(--cream)", fontFamily: "DM Sans, sans-serif" }}
            onClick={onAdd}
            whileTap={{ scale: 0.78 }}
            animate={isAdded ? { scale: [1, 1.18, 0.95, 1.05, 1] } : {}}
            transition={{ duration: 0.35 }}>
            <AnimatePresence mode="wait">
              {isAdded ? (
                <motion.span key="added" className="flex items-center gap-1"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M1.5 5.5l2.5 2.5 5.5-5" stroke="var(--sage)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Added
                </motion.span>
              ) : (
                <motion.span key="add" className="flex items-center gap-1"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M5.5 1.5v8M1.5 5.5h8" stroke="var(--cream)" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                  Add
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </motion.article>
  );
}