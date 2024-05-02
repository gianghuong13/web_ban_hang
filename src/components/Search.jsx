import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../search.css';

const Search = () => {
  const [products, setProducts] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef();
  const searchResultsRef = useRef();

  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
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

  // filter search results
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


  const handleSearch = (event) => {
    event.preventDefault();
    if (searchValue) {
      // Find the product with the matching name
      const product = products.find(product => product.name === searchValue);
      if (product) {
        // If there's a match, navigate to the product's page
        navigate(`/product/detail/${product.id}`);
      } else {
        // If there's no match, navigate to the search results page
        navigate(`/search?query=${encodeURIComponent(searchValue)}`);
      }
      searchRef.current.blur(); // Unfocus the search input
    }
  };

  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleBlur = () => {
    // delay the blur event to check if the search input is focused
    setTimeout(() => {
      if (document.activeElement !== searchRef.current) {
        setIsFocused(false);
      }
    }, 100);
  };

  const handleSuggestionMouseDown = (event) => {
    event.preventDefault();
  };

  const handleSuggestionClick = (productName) => {
    setSearchValue(productName);
    setIsFocused(false);
    searchRef.current.blur(); // Unfocus the search input
  };

  

  return (
    <form className="search" onSubmit={handleSearch}>
      <div className="input-group">
        <input
          id="search"
          name="search"
          type="text"
          className="form-control"
          placeholder="Search"
          required
          value={searchValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          ref={searchRef}
        />
        <button
          className="btn btn-primary text-white"
          type="submit"
          aria-label="Search"
        >
          <i className="bi bi-search"></i>
        </button>
      </div>
      {isFocused && (
        <div className="search-results" ref={searchResultsRef}>
          {filteredProducts.slice(0, 6).map((product, index) => (
            <div key={product._id} onMouseDown={handleSuggestionMouseDown}>
              <Link
                to={`/product/detail/${product.id}`}
                onClick={() => handleSuggestionClick(product.name)}
                className={index === selectedIndex ? 'selected' : ''} // Use selectedIndex
              >
                {product.name}
              </Link>
            </div>
          ))}
        </div>
      )}
    </form>
  );
};

export default Search;