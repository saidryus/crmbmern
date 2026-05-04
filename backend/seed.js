/**
 * seed.js
 * ─────────────────────────────────────────────────────────────
 * Run once to populate MongoDB with the 12 original products
 * and create the default admin account.
 *
 * Usage:
 *   node seed.js
 *
 * Safe to re-run — it clears existing products and admin before
 * inserting fresh data, so you can reset the DB at any time.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Admin = require('./models/Admin');

const PRODUCTS = [
  {
    name: 'Chocolate Croissant',
    description: 'Flaky, buttery croissant filled with rich dark chocolate. Baked fresh every morning.',
    price: 120,
    category: 'Pastries',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',
    available: true,
    bestSeller: true,
    tags: ['Contains Gluten', 'Contains Dairy'],
  },
  {
    name: 'Sourdough Loaf',
    description: 'Classic tangy sourdough with a crispy crust and chewy crumb. Made with 24-hour fermented dough.',
    price: 280,
    category: 'Bread',
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80',
    available: true,
    bestSeller: true,
    tags: ['Vegan', 'Contains Gluten'],
  },
  {
    name: 'Café Latte',
    description: 'Smooth espresso with velvety steamed milk. Made with our signature CRMB blend.',
    price: 150,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=600&q=80',
    available: true,
    bestSeller: false,
    tags: ['Contains Dairy'],
  },
  {
    name: 'Almond Danish',
    description: 'Laminated pastry topped with almond cream and toasted sliced almonds. A bakery classic.',
    price: 135,
    category: 'Pastries',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
    available: true,
    bestSeller: true,
    tags: ['Contains Nuts', 'Contains Gluten'],
  },
  {
    name: 'Cinnamon Roll',
    description: 'Soft, pillowy roll swirled with cinnamon sugar and topped with cream cheese glaze.',
    price: 110,
    category: 'Pastries',
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&q=80',
    available: true,
    bestSeller: false,
    tags: ['Contains Dairy', 'Contains Gluten'],
  },
  {
    name: 'Matcha Latte',
    description: 'Ceremonial grade matcha whisked with oat milk. Earthy, creamy, and perfectly balanced.',
    price: 165,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80',
    available: true,
    bestSeller: true,
    tags: ['Vegan', 'New'],
  },
  {
    name: 'Focaccia',
    description: 'Olive oil-drenched Italian flatbread with rosemary and sea salt. Crispy outside, airy inside.',
    price: 220,
    category: 'Bread',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
    available: true,
    bestSeller: false,
    tags: ['Vegan', 'Contains Gluten', 'Seasonal'],
  },
  {
    name: 'Iced Americano',
    description: 'Double shot espresso over ice with cold water. Clean, bold, and refreshing.',
    price: 130,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80',
    available: true,
    bestSeller: false,
    tags: ['Vegan'],
  },
  {
    name: 'Butter Croissant',
    description: 'Pure, classic French croissant. 72 layers of buttery, flaky perfection.',
    price: 95,
    category: 'Pastries',
    image: 'https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?w=600&q=80',
    available: true,
    bestSeller: false,
    tags: ['Contains Dairy', 'Contains Gluten'],
  },
  {
    name: 'Multigrain Loaf',
    description: 'Hearty loaf packed with seeds and whole grains. Nutty flavor with a dense, satisfying crumb.',
    price: 260,
    category: 'Bread',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
    available: true,
    bestSeller: false,
    tags: ['Vegan', 'Contains Nuts', 'Contains Gluten'],
  },
  {
    name: 'Caramel Macchiato',
    description: 'Espresso layered over vanilla-infused milk with a drizzle of house-made caramel.',
    price: 175,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510bd9d4?w=600&q=80',
    available: true,
    bestSeller: true,
    tags: ['Contains Dairy', 'Seasonal'],
  },
  {
    name: 'Blueberry Muffin',
    description: 'Moist, tender muffin bursting with fresh blueberries and a golden sugar crust on top.',
    price: 90,
    category: 'Pastries',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600&q=80',
    available: true,
    bestSeller: false,
    tags: ['New', 'Contains Gluten'],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Admin.deleteMany({});
    console.log('Cleared existing products and admin accounts');

    // Insert products
    await Product.insertMany(PRODUCTS);
    console.log(`Inserted ${PRODUCTS.length} products`);

    // Create default admin (password is hashed by the pre-save hook)
    await Admin.create({
      username: process.env.ADMIN_USERNAME || 'crmb',
      password: process.env.ADMIN_PASSWORD || 'admin123',
    });
    console.log(`Admin account created — username: ${process.env.ADMIN_USERNAME || 'crmb'}`);

    console.log('\nSeed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
