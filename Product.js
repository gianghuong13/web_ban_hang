const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  category_id: {
    type: String,
    required: true,
  },
  available: {
    type: Boolean,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  colors: [String], // Assuming color is an array of strings
  sizes: [String], // Assuming size is an array of strings
  price: {
    original: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  description: String,
  reviews: [String], // Assuming reviews is an array of strings
  created: {
    type: Date,
    required: true,
  },
  updated: {
    type: Date,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
});

// Define the transformation function
function transformProductData(productData) {
  return {
    _id: productData._id || "", // Use the _id field
    category_id: productData.category_id || "", // Use the category_id field
    available: productData.available || false, // Use the available field
    stock: productData.stock || 0, // Use the stock field
    colors: productData.colors || [], // Use the color field
    sizes: productData.sizes || [], // Use the size field
    price: productData.price ? {
      original: parseFloat(productData.price.original) || 0,
      discount: parseFloat(productData.price.discount) || 0,
      price: parseFloat(productData.price.price) || 0,
    } : { original: 0, discount: 0, price: 0 },
    description: productData.description || "", // Use the description field
    reviews: productData.reviews || [], // Use the reviews field
    created: productData.created || new Date(), // Use the created field
    updated: productData.updated || new Date(), // Use the updated field
    name: productData.name || "", // Use the name field
    img: productData.img || "", // Use the img field
  };
}

module.exports = {
  ProductModel: mongoose.model("Product", ProductSchema),
  transformProductData: transformProductData,
};
