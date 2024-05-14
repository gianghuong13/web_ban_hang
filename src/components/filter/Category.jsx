import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const FilterCategory = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    //endpoint to fetch categories
    fetch('http://localhost:3001/api/categories')
      .then(response => response.json())
      .then(data => {
        setCategories(data);
      })
      .catch(error => {
        console.error('Error fetching categories', error);
      });
  }, []);

  return (
    <div className="card mb-3 accordion">
      <div
        className="card-header fw-bold text-uppercase accordion-icon-button"
        data-bs-toggle="collapse"
        data-bs-target="#filterCategory"
        aria-expanded="true"
        aria-controls="filterCategory"
      >
        Categories
      </div>
      <ul
        className="list-group list-group-flush show"
        id="filterCategory"
      >
        {categories.map((category, index) => (
          <li key={index} className="list-group-item">
            <Link 
              to={`/category/${category.id}`} 
              className="text-decoration-none stretched-link"
              onClick={() => window.location.href=`/category/${category.id}`}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FilterCategory;