const mongoose = require('mongoose');

/**
 * Product model
 * Mirrors the shape of the static products.js seed data so the
 * frontend can swap localStorage for real DB reads with no UI changes.
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      enum: ['Bread', 'Pastries', 'Drinks'],
      required: [true, 'Category is required'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    available: {
      type: Boolean,
      default: true,
    },
    bestSeller: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Product', productSchema);
