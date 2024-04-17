// Node.js + Express server
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors()); // This will enable CORS
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
      mongoose.connection.db.collection('categories').find({}, { projection: { _id: 0, name: 1 } }).toArray()
      .then(data => {
        categories = data.map(category => category.name); // Store the category names
        console.log(categories); // Log the category names to the console
      })
      .catch(err => console.error('Error fetching data', err));

      // get products
      mongoose.connection.db.collection('products').find({}, { projection: { _id: 0, name: 1, description: 1, img: 1  } }).toArray()
      .then(data => {
        products = data.map(product => ({ 
          name: product.name, 
          description: product.description,
          img: product.img
        })); 
        console.log(products); // Log the product names, descriptions, and images to the console
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