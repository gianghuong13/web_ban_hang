import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Search = () => {
  const [products, setProducts] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchValue) {
      setFilteredProducts(
        products.filter(product =>
          product.name.toLowerCase().startsWith(searchValue.toLowerCase())
        )
      );
    } else {
      setFilteredProducts([]);
    }
  }, [searchValue, products]);

  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
  };

  return (
    <form action="#" className="search" onSubmit={(e) => e.preventDefault()}>
      <div className="input-group">
        <input
          id="search"
          name="search"
          type="text"
          className="form-control"
          placeholder="Search"
          required
          onChange={handleInputChange}
        />
        <label className="visually-hidden" htmlFor="search"></label>
        <button
          className="btn btn-primary text-white"
          type="submit"
          aria-label="Search"
        >
          <i className="bi bi-search"></i>
        </button>
      </div>
      {filteredProducts.map(product => (
        <Link key={product._id} to={`/product/detail/${product.id}`}>
          <div>{product.name}</div>
        </Link>
      ))}
    </form>
  );
};

export default Search;