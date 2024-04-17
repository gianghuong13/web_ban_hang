// Node.js + Express server
const express = require('express');
const cors = require('cors'); // Make sure to install cors if you haven't already
const mongoose = require('mongoose');

const app = express();
app.use(cors()); // This will enable CORS
const port = 3001;

// Replace this with your MongoDB Atlas connection string
const url = 'mongodb+srv://commercial:05timE2NuctQg0Yy@cluster0.wfto06b.mongodb.net/things?retryWrites=true&w=majority&appName=Cluster0';
let categories = [];

mongoose.connect(url)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
    });

    mongoose.connection.db.collection('categories').find({}, { projection: { _id: 0, name: 1 } }).toArray()
      .then(data => {
        categories = data.map(category => category.name); // Store the category names
        console.log(categories); // Log the category names to the console
      })
      .catch(err => console.error('Error fetching data', err));
  })
  .catch(err => console.error('Connection error', err));

app.get('/api/categories', (req, res) => {
  res.json(categories);
});