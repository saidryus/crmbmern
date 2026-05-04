const mongoose = require('mongoose');

/**
 * Order model
 * Stores every confirmed checkout. The frontend generates the
 * human-readable orderId (CRMB-XXXXX) and sends it along so
 * receipts stay consistent between frontend and DB.
 */
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    name:     { type: String, required: true },
    price:    { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image:    { type: String },
  },
  { _id: false } // sub-documents don't need their own _id
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true, // e.g. "CRMB-LX4K2A-F3R9"
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['received', 'preparing', 'baking', 'ready', 'completed'],
      default: 'received',
    },
  },
  {
    timestamps: true, // createdAt = order date shown in admin dashboard
  }
);

module.exports = mongoose.model('Order', orderSchema);
