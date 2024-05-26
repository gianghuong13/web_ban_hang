const { Client } = require('@elastic/elasticsearch');
const express = require('express');
const cors = require('cors');
const app = express();  
const port = 3002;

// Create an Elasticsearch client
const client = new Client({
    cloud: {
        id: 'e979c66e01444994b94412f0362c3657:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJDBjODk1MThhZjFiYTRhMzA5MGU3YzI0YWJhOGM5NDZlJDVmMjlmN2ZkMWQ5MzQxNzU4YzAyMjVhM2IwNjBhMjNl'
    },
    auth: {
        username: 'elastic',
        password: 'dZojjl4itYPwUzCfOYAEzxdw'
    }
});

app.use(cors());

async function searchProducts(query) {
  try {

    const countResponse = await client.count({
        index: 'products',
        body: {
            query: {
                bool: {
                    should: [
                        {
                            match: {
                                name: {
                                    query: query,
                                    fuzziness: 'AUTO'
                                }
                            }
                        },
                        {
                            wildcard: {
                                name: `*${query}*`
                            }
                        }
                    ]
                }
            }
        }
    });

    const totalMatches = countResponse.count;

    const body = await client.search({
      index: 'products',
      body: {
          query: {
              bool: {
                  should: [
                      {
                          match: {
                              name: {
                                  query: query,
                                  fuzziness: 'AUTO'
                              }
                          }
                      },
                      {
                          wildcard: {
                              name: `*${query}*`
                          }
                      }
                  ]
              }
          },
          size: totalMatches // Adjust size as needed
      }
  });
      if (!body) {
          throw new Error('No response body');
      }
      if (!body.hits) {
          throw new Error('No hits found');
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
