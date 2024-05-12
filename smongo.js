const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const { ProductModel, transformProductData } = require('./Product');


const app = express();
app.use(cors()); // This will enable CORS
app.use(bodyParser.json());
const port = 3001;
// MongoDB Atlas connection string
const url = 'mongodb+srv://commercial:05timE2NuctQg0Yy@cluster0.wfto06b.mongodb.net/things?retryWrites=true&w=majority&appName=Cluster0';

let categories = [];
let products = [];

mongoose.connect(url)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
    });

    // get categories
    mongoose.connection.db.collection('categories').find({}, { projection: { _id: 1, name: 1 } }).toArray()
      .then(data => {
        categories = data.map(category => ({
          id: category._id ? category._id.toString() : null,
          name: category.name
      })); // Store the category names
        // console.log(categories); // Log the category names to the console
      })
      .catch(err => console.error('Error fetching data', err));

    // get products
    mongoose.connection.db.collection('products').find({}, {
      projection: {
        _id: 1,
        name: 1,
        description: 1,
        img: 1,
        price: 1,
        category_id: 1,
        available: 1,
        stock: 1,
        colors: 1,
        sizes: 1,
        reviews: 1,
        created: 1,
        updated: 1
      }
    }).toArray()
    .then(data => {
      const { transformProductData } = require('./Product');
      products = data.map(product => transformProductData({
        id: product._id ? product._id.toString() : null,
        category_id: product.category_id ? product.category_id.toString() : null,
        name: product.name,
        description: product.description,
        img: product.img,
        price: product.price,
        available: product.available,
        stock: product.stock,
        colors: product.colors,
        sizes: product.sizes,
        reviews: product.reviews,
        created: product.created,
        updated: product.updated
      }));
    })
    .catch(err => console.error('Error fetching products', err));

  })
  .catch(err => console.error('Connection error', err));

app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/pagedproducts', async (req, res) => {
  const allProducts = await ProductModel.find({});
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  const lastIndex = page * limit;

  const results = {};
  results.totalProducts = allProducts.length;
  results.pageCount = Math.ceil(allProducts.length / limit);

  if (lastIndex < allProducts.length) {
    results.next = {
      page: page + 1,
    };
  }
  if (startIndex > 0) {
    results.prev = {
      page: page - 1,
    };
  }
  results.result = allProducts.slice(startIndex, lastIndex);
  res.json(results);
});


app.get(`/api/product/:id`, async (req, res) => {
  const { id } = req.params;
  try {
    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const transformedProduct = transformProductData(product);
    return res.status(200).json(transformedProduct);
  } catch (error) {
    console.error('Error fetching product', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post(`/api/product`, async (req, res) => {
  try {
    const newProduct = transformProductData(req.body); // Transform incoming product data
    const product = await ProductModel.create(newProduct);
    return res.status(201).json(transformProductData(product)); // Transform and send back the created product
  } catch (error) {
    console.error('Error creating product', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put(`/api/product/:id`, async (req, res) => {
  const { id } = req.params;
  try {
    const updatedProduct = transformProductData(req.body); // Transform incoming product data
    const product = await ProductModel.findByIdAndUpdate(id, updatedProduct, { new: true });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.status(200).json(transformProductData(product)); // Transform and send back the updated product
  } catch (error) {
    console.error('Error updating product', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an existing product
app.delete(`/api/product/:id`, async (req, res) => {
  const { id } = req.params;
  try {
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.status(200).json(transformProductData(product)); // Transform and send back the deleted product
  } catch (error) {
    console.error('Error deleting product', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});