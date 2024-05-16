const { Client } = require('@elastic/elasticsearch');

const express = require('express');
const cors = require('cors');
const app = express();  
const port = 3002;


// Create an Elasticsearch client
const client = new Client({
    cloud: {
        id: '602f518ebd4f476181a808011cada467:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJGM0ZWQ2NmVjYTkzODQ4ZGRiNjcxYzAyNjljY2IzNWVkJDgxOTllOGJkZGRmZTQxMWJhMDY5ZjZhNTZjYTM0MGUy'
    },
    auth: {
        username: 'elastic',
        password: 'NY4y6DOymQtvL63CGRa0qylG'
    }
});

app.use(cors());

async function searchProducts(query) {
  try {
    const countResponse = await client.count({
        index: 'productsfinal',
        body: {
            query: {
                match: {
                    name: query
                }
            }
        }
    });

    const totalMatches = countResponse.count;

    const body = await client.search({
      index: 'productsfinal',
      body: {
          query: {
              match: {
                  name: query
              }
          },
          size: totalMatches
      }
  });
      if (!body) {
          throw new Error('Khong co body');
      }
      if (!body.hits) {
        throw new Error('Khoi doc hits luon chu dau co hits');
    }
      return body.hits.hits;
  } catch (error) {
      console.error(error);
      throw error; // Re-throw error to handle it in the Express endpoint
  }
}

app.get('/api/products/search', async (req, res) => {
  const { q } = req.query;
  console.log(q);
  if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
      const products = await searchProducts(q);
      res.json(products);
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});