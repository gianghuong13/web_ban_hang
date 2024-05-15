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
    type: String,
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
  name: {
    type: String,
    required: true,
  },
  img: {
    type: [String],
    required: true,
  },
  review: {
    user_id: {
      type: [String], // Array of strings
      default: [] // Default value is an empty array
    },
    rating: {
      type: [Number], // Array of numbers
      default: [] // Default value is an empty array
    },
    review: {
      type: [String], // Array of strings
      default: [] // Default value is an empty array
    }
  },
});

// Define the transformation function
function transformProductData(productData) {
  // Correctly transform the img field to an array of strings (image URLs)
  let imgLinks = [];
  let review = {
    user_id: [],
    rating: [],
    review: []
  };
  if (typeof productData.img === 'string') {
    // Check if the string is a valid JSON array
    if (productData.img.trim().startsWith('[')) {
      try {
        // Parse the string as JSON and extract the URLs
        const imgArray = JSON.parse(productData.img.replace(/'/g, '"'));
        imgLinks = imgArray.map(imgObj => {
          return typeof imgObj === 'object' ? Object.keys(imgObj)[0] : imgObj;
        });
      } catch (error) {
        console.error('Error parsing image data', error);
        // If parsing fails, treat as a single URL
        imgLinks.push(productData.img);
      }
    } else {
      // If it's not a JSON array, assume it's a single URL
      imgLinks.push(productData.img);
    }
  } else if (Array.isArray(productData.img)) {
    // If it's an array
    if (productData.img.length > 0 && typeof productData.img[0] === 'string' && productData.img[0].trim().startsWith('[')) {
      // Check if the first element of the array is a string that can be parsed into an array of objects
      try {
        // Parse the string as JSON and extract the URLs
        const imgArray = JSON.parse(productData.img[0].replace(/'/g, '"'));
        imgLinks = imgArray.map(imgObj => {
          return typeof imgObj === 'object' ? Object.keys(imgObj)[0] : imgObj;
        });
      } catch (error) {
        console.error('Error parsing image data', error);
        // If parsing fails, treat as a single URL
        imgLinks.push(productData.img[0]);
      }
    } else {
      // If it's already an array of URLs, use it as is
      imgLinks = productData.img;
    }
  }

  if (productData.review && typeof productData.review === 'object') {
    // Check if user_id, rating, and review are arrays
    if (Array.isArray(productData.review.user_id)) {
      review.user_id = productData.review.user_id;
    }
    if (Array.isArray(productData.review.rating)) {
      review.rating = productData.review.rating;
    }
    if (Array.isArray(productData.review.review)) {
      review.review = productData.review.review;
    }
  }
  let averageRating = 0;
  if (productData.review && Array.isArray(productData.review.rating) && productData.review.rating.length > 0) {
    const sum = productData.review.rating.reduce((a, b) => a + b, 0);
    averageRating = parseFloat((sum / productData.review.rating.length).toFixed(2));
  }
  return {
    id: productData.id || "", // Use the _id field
    category_id: productData.category_id || "", // Use the category_id field
    available: productData.available || "FALSE", // Use the available field
    stock: productData.stock || 0, // Use the stock field
    colors: productData.colors || [], // Use the color field
    sizes: productData.sizes || [], // Use the size field
    price: productData.price ? {
      original: parseFloat(productData.price.original) || 0,
      discount: parseFloat(productData.price.discount) || 0,
      price: parseFloat(productData.price.price) || 0,
    } : { original: 0, discount: 0, price: 0 },
    description: productData.description || "", // Use the description field
    name: productData.name || "", // Use the name field
    img: imgLinks,
    review: review,
    averageRating: averageRating
  };
}

module.exports = {
  ProductModel: mongoose.model("Product", ProductSchema),
  transformProductData: transformProductData,
};
