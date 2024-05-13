const { Client } = require('@elastic/elasticsearch');

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

// ...

// Perform a search query
async function searchProducts() {
    try {
        const body = await client.search({
            index: 'test_products_index',
            body: {
                query: {
                    match: {
                        name: 'jeans'
                    }
                }
            }
        });

        if (body) {
            console.log("cos body");
        }
        // Kiểm tra xem phản hồi có tồn tại và có chứa trường 'hits' không
        console.log(body.hits.hits);
    } catch (error) {
        console.error(error);
    }
}



searchProducts();

