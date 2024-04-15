const express = require("express");
const cors = require("cors");
const bcrypt = require('bcrypt');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const port = process.env.PORT || 5000;
var jwt = require('jsonwebtoken');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.listen(5000, () => {
  console.log(`Listening @ port ${port}` );
});

app.use(cors());

const db  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'root',
  password        : '',
  database        : 'ecom',

});

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
    } else {
      if (results.length > 0) {
        bcrypt.compare(password.toString(), results[0].password, (err, isMatch) => {
          if (err) {
            res.status(500).json({ message: err.toString() });
          } else {
            if (isMatch) {
              const token = jwt.sign({ id: results[0].id }, "jwt-secret-key", {expiresIn: '1d'});
              res.status(200).json({ message: 'User signed in successfully', Token: token });
            } else {
              res.status(400).json({ message: 'Invalid credentials' });
            }
          }
        });
      } else {
        res.status(400).json({ message: 'User not found' });
      }
    }
  });
});
