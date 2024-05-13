import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CardFeaturedProduct = (props) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const products = props.data;

  useEffect(() => {
    axios.get('http://localhost:3001/api/products')
      .then(response => {
        const products = response.data;
        const randomProducts = getRandomProducts(products, 5);
        setFeaturedProducts(randomProducts);
      })
      .catch(error => console.error('Error fetching products', error));
  }, []);

  function getRandomProducts(products, count) {
    // Shuffle the array
    const shuffled = products.sort(() => 0.5 - Math.random());
    // Get sub-array of first n elements after shuffled
    return shuffled.slice(0, count);
  }

  return (
    <div className="card mb-3">
      <div className="card-header fw-bold text-uppercase">
        Featured Products
      </div>
      <div className="card-body">
        {featuredProducts.map((product, idx) => (
          <div
            className={`row ${idx + 1 === products.length ? "" : "mb-3"}`}
            key={idx}
          >
            <div className="col-md-4">
              <a href={`/product/detail/${product.id}`} onClick={(e) => { e.preventDefault(); window.location.href=`/product/detail/${product.id}`}}>
                <img src={product.img[0]} className="img-fluid" alt={product.name} style={{width: '100px'}} />
              </a>
            </div>
            <div className="col-md-8">
              <h6 className="text-capitalize mb-1">
                <a href={`/product/detail/${product.id}`} onClick={(e) => { e.preventDefault(); window.location.href=`/product/detail/${product.id}`}} className="text-decoration-none">
                  {product.name}
                </a>
              </h6>
              <div className="mb-2">
                {Array.from({ length: product.star }, (_, key) => (
                  <i className="bi bi-star-fill text-warning me-1" key={key} />
                ))}
              </div>
              <span className="fw-bold h5">${product.price.price}</span>
              {product.originPrice > 0 && (
                <del className="small text-muted ms-2">
                  ${product.originPrice}
                </del>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardFeaturedProduct;
