import React, { useState, useEffect } from "react";

const FilterPrice = ({ onPriceChange }) => {
  const [selectedRanges, setSelectedRanges] = useState(() => {
    // Retrieve selected ranges from local storage
    const savedRanges = localStorage.getItem("selectedRanges");
    return savedRanges ? JSON.parse(savedRanges) : [];
  });

  const handleCheckboxChange = (event) => {
    const [minPrice, maxPrice] = event.target.value.split('-').map(price => parseFloat(price));
    let updatedRanges;
    if (event.target.checked) {
      updatedRanges = [...selectedRanges, { minPrice, maxPrice }];
    } else {
      updatedRanges = selectedRanges.filter(range => range.minPrice !== minPrice || range.maxPrice !== maxPrice);
    }
    setSelectedRanges(updatedRanges);
    localStorage.setItem("selectedRanges", JSON.stringify(updatedRanges));

    // Refresh the page
    setTimeout(() => {
      window.location.reload();
    }, 0);
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

  const isChecked = (minPrice, maxPrice) => {
    return selectedRanges.some(range => range.minPrice === minPrice && range.maxPrice === maxPrice);
  };

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
              checked={isChecked(1, 25)}
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
              checked={isChecked(26, 50)}
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
              checked={isChecked(51, 99)}
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
              id="flexCheckDefault4"
              value="100-1000"
              onChange={handleCheckboxChange}
              checked={isChecked(100, 1000)}
            />
            <label className="form-check-label" htmlFor="flexCheckDefault4">
              $100.00 - $1000.00 <span className="text-muted">(5)</span>
            </label>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default FilterPrice;
