// Import necessary libraries
const mongoose = require("mongoose");
const mysql = require('mysql');

// MongoDB connection URL
const mongoUrl = 'mongodb+srv://commercial:05timE2NuctQg0Yy@cluster0.wfto06b.mongodb.net/things?retryWrites=true&w=majority&appName=Cluster0';
// MySQL connection settings
const mysqlConfig = {
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'ecommerce',
};

// Connect to MongoDB
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');

        const productsCollection = mongoose.connection.collection('products');

        // Set up change stream
        const changeStream = productsCollection.watch();
        console.log('Change stream set up');

        changeStream.on('error', (error) => {
            console.error('Error with change stream:', error);
        });

        // Handle change events
        changeStream.on('change', async (change) => {
            console.log('Change detected:', change);
            if (change.operationType === 'delete') {
                console.log('Deleted product:', change.documentKey._id)
                const deletedProductId = change.documentKey._id;

                // Connect to MySQL
                const mysqlConnection = mysql.createConnection(mysqlConfig);
                mysqlConnection.connect((err) => {
                    if (err) {
                        console.error('Error connecting to MySQL:', err);
                        return;
                    }
                    console.log('Connected to MySQL');

                    // Delete corresponding entry from cartdetails table
                    const deleteQuery = `DELETE FROM cartdetails WHERE product_id = '${deletedProductId}'`;
                    mysqlConnection.query(deleteQuery, (err, result) => {
                        if (err) {
                            console.error('Error executing MySQL query:', err);
                        } else {
                            console.log(`Deleted entries from cartdetails for product with ID ${deletedProductId}`);
                        }
                        mysqlConnection.end();
                    });
                });
            }   else if (change.operationType === 'insert') {
                console.log('Inserted product:', change.documentKey._id);
            }
        });
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });