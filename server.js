const express = require("express");
const cors = require("cors");
const bcrypt = require('bcrypt');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const port = process.env.PORT || 5000;
var jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const { ProductModel } = require('./Product');


const mongoUrl = 'mongodb+srv://commercial:05timE2NuctQg0Yy@cluster0.wfto06b.mongodb.net/things?retryWrites=true&w=majority&appName=Cluster0';

const db  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'root',
  password        : '',
  database        : 'ecommerce',

});

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Allow cookies
}));

app.use(express.json()); // for parsing application/json
app.get('/', (req, res) => {
  db.getConnection((err, connection) => {
    if(err) throw err;
    console.log('Connected as ID ' + connection.threadId);
    connection.query('SELECT * FROM users', (err, rows) => {
      connection.release(); // return the connection to pool
      if(!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    })
  })
}); 



app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  key:'userId',
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false,
  expires: 60 * 60 * 24 } // set to true if your using https
}));

app.get('/account/user', (req, res) => {
  if (req.session.username) {
    // User is logged in, return user data
    res.status(200).json({ valid: true, username: req.session.username, user_id: req.session.user_id});
  } else {
    // No user is logged in, return an error message
    res.status(401).json({ valid: false, message: 'Not authenticated' });
  }
});


app.put('/account/password', async (req, res) => {
  if (!req.session.username) {
    // No user is logged in, return an error message
    res.status(401).json({ valid: false, message: 'Not authenticated' });
    return;
  }
  console.log(req.body);
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Check if new password and confirm password match
  if (newPassword !== confirmPassword) {
    res.status(400).json({ message: 'New password and confirm password do not match' });
    return;
  }

  // Fetch the user from the database
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [req.session.username], async (err, results) => {
    if (err) {
      res.status(500).json({ message: err.toString() });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(currentPassword.toString(), user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }

    // Current password is correct, hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    const updateQuery = 'UPDATE users SET password = ? WHERE username = ?';
    db.query(updateQuery, [hashedPassword, req.session.username], (err, result) => {
      if (err) {
        res.status(500).json({ message: err.toString() });
        return;
      }
      res.status(200).json({ message: 'Password updated successfully' });
    });
  });
});

app.put('/account/user', (req, res) => {
  if (!req.session.username) {
    // No user is logged in, return an error message
    res.status(401).json({ valid: false, message: 'Not authenticated' });
    return;
  }

  const { email, mobileNumber } = req.body;

  if (!email && !mobileNumber) {
    // Both fields are empty, do nothing
    res.status(400).json({ message: 'Both fields are empty' });
    return;
  }

  // Find the user
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [req.session.username], (err, results) => {
    if (err) {
      console.error('Error finding user:', err);
      res.status(500).json({ message: 'Error finding user' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // User found, update the fields if they are not empty
    const user = results[0];
    const updateQuery = 'UPDATE users SET email = ?, phone = ? WHERE username = ?';
    const params = [email || user.email, mobileNumber || user.mobileNumber, req.session.username];

    // Update the user
    db.query(updateQuery, params, (err, result) => {
      if (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Error updating user' });
        return;
      }
      res.status(200).json({ message: 'User updated successfully' });
    });
  });
});

const handleLogout = () => {
  axios.get('http://localhost:5000/account/signout', { withCredentials: true })
    .then(() => {
      setUsername(null);
      window.location.reload();
    })
    .catch(err => {
      console.error('Error logging out:', err);
    });
};

app.listen(5000, () => {
  console.log(`Listening @ port ${port}` );
});
app.post('/account/signup', async (req, res) => {
  console.log(req.body);
  const {firstName, lastName, username, email, phone, password } = req.body;

  // Check for duplicate username or email
  const checkQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
  db.query(checkQuery, [username, email], async (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: err.toString() });
    } else {
      if (results.length > 0) {
        // User with provided username or email already exists
        res.status(400).json({ message: 'User with provided username or email already exists' });
      } else {
        // No user with provided username or email exists, proceed with sign up
        try {
          // Encrypt the password
          const hashedPassword = await bcrypt.hash(password.toString(), 10);

          // Insert the new user into the database
          const insertQuery = 'INSERT INTO users (first_name, last_name, username, email, phone, password, registeredAt) VALUES (?, ?, ?, ?, ?, ?, NOW())';
          db.query(insertQuery, [firstName, lastName, username, email, phone, hashedPassword], (err, result) => {
            if (err) {
              console.log(err);
              res.status(500).json({ message: err.toString() });
            } else {
              res.status(200).json({ message: 'User created successfully' });
            }
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: error.toString() });
        }
      }
    }
  });
});

app.get("/api", (req, res) => {
    return res.json({message: "from backend"});
})

app.post('/account/signin', async (req, res) => {
  const { username, password } = req.body;

  // Fetch the user from the database
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({Login: false, message: err.toString()});
    } else {
      if (results.length > 0) {
        bcrypt.compare(password.toString(), results[0].password, (err, isMatch) => {
          if (err) {
            return res.status(500).json({Login: false, message: err.toString()});
          } else {
            if (isMatch) {
              req.session.username = results[0].username;
              req.session.user_id = results[0].user_id;
              const updateQuery = 'UPDATE users SET lastLogin = NOW() WHERE username = ?';
              db.query(updateQuery, [username], (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log('Last login updated successfully');
                }
              });
              console.log(req.session.username);
              return res.json({Login: true, username: req.session.username, user_id: results[0].user_id, message: 'User signed in successfully'});
            } else {
              console.log(req.session.username);
              return res.json({Login: false, message: 'Incorrect username or password'});
            }
          }
        });
      } else {
        return res.status(400).json({Login: false, message: 'User not found'});
      }
    }
  });
});

app.get('/account/signout', (req, res) => {
  // Destroy the session
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).send('Error logging out');
    } else {
      res.send('Logout successful');
    }
  });
});

app.get('/account/:userId/address/default', (req, res) => {
  const userId = req.params.userId;
  const query = 'SELECT * FROM address WHERE user_id = ? AND `primary` = 1';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user cart:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(results[0]);
    }
  });
});


app.put('/account/profile', async (req, res) => {
  console.log('PUT /account/profile called');

  const { mobileNumber, email, userId } = req.body;

  const updateQuery = 'UPDATE users SET phone = ?, email = ? WHERE user_id = ?';
  db.query(updateQuery, [mobileNumber, email, userId], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: err.toString() });
    } else {
      res.status(200).json({ message: 'User data updated successfully' });
    }
  });
});

app.get('/account/:userId/addresses', (req, res) => {
  const userId = req.params.userId;
  const query = 'SELECT * FROM address WHERE user_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user cart:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(results);
    }
  });
});

function insertAddress(req, res, country, province, city, address, primary) {
  const query = 'INSERT INTO address (user_id, country, province, city, address, `primary`) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [req.session.user_id, country, province, city, address, primary ? 1 : 0], (err, results) => {
    if (err) {
      res.status(500).json({ message: err.toString() });
      return;
    }
    const address_id = results.insertId;
    res.status(201).json({ address_id, country, province, city, address, primary });
  });
}

app.post('/account/:userId/address', async (req, res) => {
  if (!req.session.user_id) {
    // No user is logged in, return an error message
    res.status(401).json({ valid: false, message: 'Not authenticated' });
    return;
  }

  const { country, province, city, address, primary } = req.body;

  // Validate the input
  if (!country || !province || !city || !address) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  const duplicateCheckQuery = 'SELECT * FROM address WHERE user_id = ? AND country = ? AND province = ? AND city = ? AND address = ?';
  db.query(duplicateCheckQuery, [req.session.user_id, country, province, city, address], (err, results) => {
    if (err) {
      res.status(500).json({ message: err.toString() });
      return;
    }

    // If the input is a duplicate, return an error message
    if (results.length > 0) {
      res.status(400).json({ message: 'This address already exists' });
      return;
    }
    
  // If the new address is primary, check if there's already a primary address for the user
  if (primary) {
    const checkQuery = 'SELECT * FROM address WHERE user_id = ? AND `primary` = 1';
    db.query(checkQuery, [req.session.user_id], (err, results) => {
      if (err) {
        res.status(500).json({ message: err.toString() });
        return;
      }
      
      
      // If there's already a primary address, update it to be non-primary
      if (results.length > 0) {
        const updateQuery = 'UPDATE address SET `primary` = 0 WHERE user_id = ? AND `primary` = 1';
        db.query(updateQuery, [req.session.user_id], (err, results) => {
          if (err) {
            res.status(500).json({ message: err.toString() });
            return;
          }

          // Continue to insert the new address
          insertAddress(req, res, country, province, city, address, primary);
        });
      } else {
        // Continue to insert the new address
        insertAddress(req, res, country, province, city, address, primary);
      }
    });
  } else {
    // Continue to insert the new address
    insertAddress(req, res, country, province, city, address, primary);
  }
});
});

app.put('/account/:userId/address/:addressId/primary', (req, res) => {
  if (!req.session.user_id) {
    // No user is logged in, return an error message
    res.status(401).json({ valid: false, message: 'Not authenticated' });
    return;
  }

  const userId = req.params.userId;
  const addressId = req.params.addressId;

  // First, set any primary address to non-primary
  const updateQuery = 'UPDATE address SET `primary` = 0 WHERE user_id = ? AND `primary` = 1';
  db.query(updateQuery, [userId], (err, results) => {
    if (err) {
      res.status(500).json({ message: err.toString() });
      return;
    }

    // Then, set the selected address to primary
    const setPrimaryQuery = 'UPDATE address SET `primary` = 1 WHERE user_id = ? AND address_id = ?';
    db.query(setPrimaryQuery, [userId, addressId], (err, results) => {
      if (err) {
        res.status(500).json({ message: err.toString() });
        return;
      }

      if (results.affectedRows === 0) {
        res.status(404).json({ message: 'Address not found' });
      } else {
        res.status(200).json({ message: 'Address updated successfully' });
      }
    });
  });
});

app.delete('/account/address/remove/:addressId', (req, res) => {
  const addressId = req.params.addressId;
  const deleteQuery = 'DELETE FROM address WHERE address_id = ?';
  db.query(deleteQuery, [addressId], (err, result) => {
    if (err) {
      console.error('Error deleting address:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json({ message: 'Address removed successfully' });
    }
  });
});


app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

  app.get('/api/cart/:cartId', (req, res) => {
    const cartId = req.params.cartId;
    const query = 'SELECT * FROM carts WHERE cart_id = ?';
    db.query(query, [cartId], (err, results) => {
    if (err) {
      console.error('Error fetching user cart:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/api/cartdetails/:cartId', (req, res) => {
  const cartId = req.params.cartId;
  const query = 'SELECT * FROM cartdetails WHERE cart_id = ?';
  db.query(query, [cartId], (err, results) => {
    if (err) {
      console.error('Error fetching user cart:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.post('/api/cart/:userId/add-item', async (req, res) => {
  const userId = req.params.userId;
  const { productId, quantity, note } = req.body;

  try {
    // Retrieve product details from MongoDB
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const price = product.price.price;
    // Check if the cart already exists for the user
    const checkQuery = 'SELECT * FROM carts WHERE user_id = ? AND status = 1';
    db.query(checkQuery, [userId], async (err, results) => {
      if (err) {
        console.error('Error checking user cart:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      let cartId;
      if (results.length > 0) {
        // Cart exists, use its id
        cartId = results[0].cart_id;
        checkProductAndInsert(cartId);
      } else {
        // Cart doesn't exist, create a new one
        const insertCartQuery = 'INSERT INTO carts (user_id, createdAt, status) VALUES (?, NOW(), ?)';
        db.query(insertCartQuery, [userId, 1], (err, result) => {
          if (err) {
            console.error('Error creating cart:', err);
            return res.status(500).json({ error: 'Error creating cart' });
          }
          // Get the ID of the newly inserted cart
          cartId = result.insertId;
          checkProductAndInsert(cartId);
        });
      }
    });

    function checkProductAndInsert(cartId) {
      // Now we have a valid cartId, either from an existing cart or a new one
      // Check if the product is already in the cart
      const checkProductQuery = 'SELECT * FROM cartdetails WHERE cart_id = ? AND product_id = ? AND note = ?';
      db.query(checkProductQuery, [cartId, productId, note], (err, productResults) => {
        if (err) {
          console.error('Error checking product in cart:', err);
          return res.status(500).json({ error: 'Error checking product in cart' });
        }

        if (productResults.length > 0) {
          // Product is already in the cart, update the quantity
          const updateQuery = 'UPDATE cartdetails SET quantity = quantity + ?, priceEach = ?, note = ? WHERE cart_id = ? AND product_id = ? AND note = ?';
          db.query(updateQuery, [quantity, price, note, cartId, productId, note], (err, result) => {
            if (err) {
              console.error('Error updating cart:', err);
              return res.status(500).json({ error: 'Error updating cart' });
            }
            res.status(200).json({ message: 'Cart updated successfully' });
          });
        } else {
          // Product is not in the cart, add it
          const insertQuery = 'INSERT INTO cartdetails (cart_id, product_id, quantity, priceEach, note) VALUES (?, ?, ?, ?, ?)';
          db.query(insertQuery, [cartId, productId, quantity, price, note], (err, result) => {
            if (err) {
              console.error('Error adding product to cart:', err);
              return res.status(500).json({ error: 'Error adding product to cart' });
            }
            res.status(201).json({ message: 'Product added to cart successfully' });
          });
        }
      });
    }
  } catch (error) {
    console.error('Error retrieving product details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Route to update user cart in MySQL
app.put('/api/cart/:cartId/update-item/:detailsId', (req, res) => {
  const cartId = req.params.cartId;
  const detailsId = req.params.detailsId;
  const { quantity } = req.body;
  const updateQuery = 'UPDATE cartdetails SET quantity = ? WHERE cartdetails_id = ? AND cart_id = ?';
  db.query(updateQuery, [quantity, detailsId, cartId], (err, result) => {
    if (err) {
      console.error('Error updating item quantity in user cart:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json({ message: 'Item quantity updated in user cart successfully' });
    }
  });
});

app.get('/api/user_cart/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `SELECT * FROM user_cart_view WHERE user_id = ?`;
  db.query(query, [userId], (error, results, fields) => {
    if (error) {
      console.error('Error fetching user cart data:', error);
      res.status(500).json({ error: 'Error fetching user cart data' });
    } else {
      res.json(results);
    }
  });
});

app.put('/api/user_cart/:cartId/primary/', (req, res) => {
  const cartId = req.params.cartId;
  const updateQuery = 'UPDATE carts SET status = 0 WHERE cart_id = ?';
  db.query(updateQuery, [cartId], (err, result) => {
    if (err) {
      console.error('Error updating cart status:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json({ message: 'Cart status updated successfully' });
    }
  });
});

app.get('/api/checkout/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `SELECT * FROM user_profile_view WHERE user_id = ?`;
  db.query(query, [userId], (error, results, fields) => {
    if (error) {
      console.error('Error fetching user profile data:', error);
      res.status(500).json({ error: 'Error fetching user profile data' });
    } else {
      res.json(results);
    }
  });
});

// Route to delete user cart from MySQL
app.delete('/api/cart/:cartId/remove-item/:detailsId', (req, res) => {
  const cartId = req.params.cartId;
  const detailsId = req.params.detailsId;
  const deleteQuery = 'DELETE FROM cartdetails WHERE cartdetails_id = ? AND cart_id = ?';
  db.query(deleteQuery, [detailsId, cartId], (err, result) => {
    if (err) {
      console.error('Error deleting item from user cart:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json({ message: 'Item removed from user cart successfully' });
    }
  });
});

app.get('/cart/total/:cartId', (req, res) => {
  const cartId = req.params.cartId;
  db.getConnection((err, connection) => {
    if(err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'Error getting database connection' });
      return;
    }
    connection.query('CALL CalculateCartTotal(?, @totalAmount)', [cartId], (err, results) => {
      if(err) {
        console.error('Error calling CalculateCartTotal:', err);
        res.status(500).json({ error: 'Error calculating cart total' });
        connection.release();
        return;
      }
      connection.query('SELECT @totalAmount AS totalAmount', (err, results) => {
        connection.release(); 
        if(err) {
          console.error('Error getting totalAmount:', err);
          res.status(500).json({ error: 'Error getting cart total' });
          return;
        }
        res.send(results[0]);
      });
    });
  });
});

app.get('/api/order/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `SELECT * FROM user_orders_view WHERE user_id = ?`;
  db.query(query, [userId], (error, results, fields) => {
    if (error) {
      console.error('Error fetching orders data:', error);
      res.status(500).json({ error: 'Error fetching orders data' });
    } else {
      res.json(results);
    }
  });
});


app.post('/api/order/:userId/add', (req, res) => {
  const userId = req.params.userId;
  const { cart_id, address_id } = req.body;

  if (!address_id) {
    return res.status(400).json({ error: 'address_id is required' });
  }
  
  const insertOrderQuery = 'INSERT INTO orders (user_id, status, orderDate, cart_id, address_id) VALUES (?, "Processing", NOW(), ?, ?)';
  db.query(insertOrderQuery, [userId, cart_id, address_id], (err, result) => {
    if (err) {
      console.error('Error creating order:', err);
      return res.status(500).json({ error: 'Error creating order' });
    }

    const orderId = result.insertId;

    const selectCartDetailsQuery = 'SELECT * FROM cartdetails WHERE cart_id = ?';
    db.query(selectCartDetailsQuery, [cart_id], (err, cartDetails) => {
      if (err) {
        console.error('Error fetching cart details:', err);
        return res.status(500).json({ error: 'Error fetching cart details' });
      }
      console.log(cartDetails); 
      const insertOrderDetailsQuery = 'INSERT INTO orderdetails (order_id, product_id, priceEach, quantityOrdered, note) VALUES ?';
      const orderDetailsData = cartDetails.map(detail => [orderId, detail.product_id, detail.priceEach, detail.quantity, detail.note]);

      db.query(insertOrderDetailsQuery, [orderDetailsData], (err, result) => {
        if (err) {
          console.error('Error adding order details:', err);
          return res.status(500).json({ error: 'Error adding order details' });
        }

        res.status(201).json({ message: 'Order and order details added successfully' });
      });
    });
  });
});
