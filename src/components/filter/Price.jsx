import React from "react";

const FilterPrice = ({ onPriceChange }) => {

  const handleCheckboxChange = (event) => {
    const [minPrice, maxPrice] = event.target.value.split('-').map(price => parseFloat(price));
    onPriceChange(minPrice, maxPrice);
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
      </ul>
    </div>
  );
};

export default FilterPrice;
