import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../search.css';


import axios from 'axios';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3002/api/products/search?q=${searchQuery}`);

            setProducts(response.data);
        } catch (error) {
            console.error('Error searching products in frontend:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {products.map((product, index) => (
                        <li key={index}>{product._source.name}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Search;
