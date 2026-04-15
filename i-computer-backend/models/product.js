import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  altNames: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  labelPrice: {
    type: Number,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
    default:"standard",
  },
  brand: {
    type: String,
    required: true,
    default: "generic",
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  reviews: {
    type: [
      {
        userEmail: {
          type: String,
          required: true,
        },
        userName: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    default: [],
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;