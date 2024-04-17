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

const db  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'root',
  password        : '',
  database        : 'ecom',

});
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
  methods: ["GET", "POST"],
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
    res.status(200).json({ valid: true, username: req.session.username});
  } else {
    // No user is logged in, return an error message
    res.status(401).json({ valid: false, message: 'Not authenticated' });
  }
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

app.listen(5000, () => {
  console.log(`Listening @ port ${port}` );
});
app.post('/account/signup', async (req, res) => {
  console.log(req.body);
  const {firstName, lastName, username, email, password } = req.body;

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
          const insertQuery = 'INSERT INTO users (first_name, last_name, username, email, password) VALUES (?, ?, ?, ?, ?)';
          db.query(insertQuery, [firstName, lastName, username, email, hashedPassword], (err, result) => {
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
      res.status(500).send(err);
      return res.json({Login: false});
    } else {
      if (results.length > 0) {
        bcrypt.compare(password.toString(), results[0].password, (err, isMatch) => {
          if (err) {
            res.status(500).json({ message: err.toString() });
            return res.json({Login: false});
          } else {
            if (isMatch) {
              req.session.username = results[0].username;
              console.log(req.session.username);
              return res.json({Login: true, username: req.session.username, message: 'User signed in successfully'});
            } else {
              return res.json({Login: false, message: 'Incorrect username or password'});
            }
          }
        });
      } else {
        res.status(400).json({ message: 'User not found' });
        return res.json({Login: false});
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
