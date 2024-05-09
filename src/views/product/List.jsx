import React, { useState, useEffect } from "react";
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Paging from "../../components/Paging";
import Breadcrumb from "../../components/Breadcrumb";
import FilterCategory from "../../components/filter/Category";
import FilterPrice from "../../components/filter/Price";
import FilterSize from "../../components/filter/Size";
import FilterStar from "../../components/filter/Star";
import FilterColor from "../../components/filter/Color";
import FilterClear from "../../components/filter/Clear";
import FilterTag from "../../components/filter/Tag";
import CardServices from "../../components/card/CardServices";
import CardProductGrid from "../../components/card/CardProductGrid";
import CardProductList from "../../components/card/CardProductList";

const ProductListView = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [view, setView] = useState("list");
  const { categoryId } = useParams();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const products = allProducts;


  const filterProductsByPrice = (minPrice, maxPrice) => {
    setFilteredProducts(
      products.filter(product =>
        product.price.price >= minPrice && product.price.price <= maxPrice
      )
    );
  };


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/products`);
        const products = response.data;
        setAllProducts(products);
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchProducts();
  }, []);


  useEffect(() => {
    let filteredProducts = allProducts;
    if (categoryId) {
      filteredProducts = allProducts.filter(product => product.category_id === categoryId);
    }
    setCurrentProducts(filteredProducts);
  }, [allProducts, categoryId]);

  useEffect(() => {
    setCurrentProducts(filteredProducts);
  }, [filteredProducts]);

    return (
      <React.Fragment>
        <div className="p-5 bg-primary bs-cover" style={{backgroundImage: "url(../../images/banner/fashions.webp)"}}>
          <div className="container text-center">
            {/* <span className="display-5 px-3 bg-white rounded shadow">Fashion</span> */}
          </div>
        </div>
        <Breadcrumb />
        <div className="container-fluid mb-3">
          <div className="row">
            <div className="col-md-3">
              <FilterCategory />
              <FilterPrice onPriceChange={filterProductsByPrice} />
              <FilterSize />
              <FilterStar />
              <FilterColor />
              <FilterClear />
              <FilterTag />
              <CardServices />
            </div>
            <div className="col-md-9">
              <div className="row">
                <div className="col-7">
                  <span className="align-middle fw-bold">
                    {totalItems} results for{" "}
                    <span className="text-warning">"t-shirts"</span>
                  </span>
                </div>
                <div className="col-5 d-flex justify-content-end">
                  <select
                    className="form-select mw-180 float-start"
                    aria-label="Default select"
                  >
                    <option value={1}>Most Popular</option>
                    <option value={2}>Latest items</option>
                    <option value={3}>Trending</option>
                    <option value={4}>Price low to high</option>
                    <option value={4}>Price high to low</option>
                  </select>
                  <div className="btn-group ms-3" role="group">
                  <button
                      aria-label="Grid"
                      type="button"
                      onClick={() => setView("grid")}
                      className={`btn ${view === "grid" ? "btn-primary" : "btn-outline-primary"}`}
                    >
                      <i className="bi bi-grid" />
                    </button>
                    <button
                      aria-label="List"
                      type="button"
                      onClick={() => setView("list")}
                      className={`btn ${view === "list" ? "btn-primary" : "btn-outline-primary"}`}
                    >
                      <i className="bi bi-list" />
                    </button>
                  </div>
                </div>
              </div>
              <hr />
              <div className="row g-3">
                {view === "grid" &&
                  currentProducts.map((product, idx) => {
                    return (
                      <div key={idx} className="col-md-4">
                        <Link to={`/product/${product._id}`}>
                          <CardProductGrid data={product} />
                        </Link>
                      </div>
                    );
                  })}
                  {view === "list" &&
                    currentProducts.map((product, idx) => {
                      return (
                        <div key={idx} className="col-md-12">
                            <CardProductList data={product} />
                        </div>
                      );
                    })}
              </div>
              <hr />
              <Paging
                totalRecords={totalItems}
                pageLimit={9}
                pageNeighbours={3}
                sizing=""
                alignment="justify-content-center"
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
};

export default ProductListView;