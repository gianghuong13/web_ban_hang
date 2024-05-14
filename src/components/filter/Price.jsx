import React, { useState, useEffect } from "react";

const FilterPrice = ({ onPriceChange }) => {

  const [selectedRanges, setSelectedRanges] = useState([]);

  const handleCheckboxChange = (event) => {
    const [minPrice, maxPrice] = event.target.value.split('-').map(price => parseFloat(price));
    if (event.target.checked) {
      setSelectedRanges(prevRanges => [...prevRanges, { minPrice, maxPrice }]);
    } else {
      setSelectedRanges(prevRanges => prevRanges.filter(range => range.minPrice !== minPrice && range.maxPrice !== maxPrice));
    }
  };

  useEffect(() => {
    if (selectedRanges.length > 0) {
      const minPrice = Math.min(...selectedRanges.map(range => range.minPrice));
      const maxPrice = Math.max(...selectedRanges.map(range => range.maxPrice));
      onPriceChange(minPrice, maxPrice);
    } else {
      onPriceChange(null, null);
    }
  }, [selectedRanges, onPriceChange]);



  return (
    <div className="card mb-3">
      <div
        className="card-header fw-bold text-uppercase accordion-icon-button"
        data-bs-toggle="collapse"
        data-bs-target="#filterPrice"
        aria-expanded="true"
        aria-controls="filterPrice"
      >
        Price
      </div>
      <ul className="list-group list-group-flush show" id="filterPrice">
        <li className="list-group-item">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="flexCheckDefault1"
              value="1-25"
              onChange={handleCheckboxChange}
            />
            <label className="form-check-label" htmlFor="flexCheckDefault1">
              $1.00 - $25.00 <span className="text-muted">(4)</span>
            </label>
          </div>
        </li>
        <li className="list-group-item">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="flexCheckDefault2"
              value="26-50"
              onChange={handleCheckboxChange}
            />
            <label className="form-check-label" htmlFor="flexCheckDefault2">
              $26.00 - $50.00 <span className="text-muted">(2)</span>
            </label>
          </div>
        </li>
        <li className="list-group-item">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="flexCheckDefault3"
              value="51-99"
              onChange={handleCheckboxChange}
            />
            <label className="form-check-label" htmlFor="flexCheckDefault3">
              $51.00 - $99.00 <span className="text-muted">(5)</span>
            </label>
          </div>
        </li>
        <li className="list-group-item">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="flexCheckDefault3"
              value="100-1000"
              onChange={handleCheckboxChange}
            />
            <label className="form-check-label" htmlFor="flexCheckDefault3">
              $100.00 - $1000.00 <span className="text-muted">(5)</span>
            </label>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default FilterPrice;
