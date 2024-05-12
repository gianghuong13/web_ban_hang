import React, { useState, useEffect, useRef } from "react";
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
import ReactPaginate from 'react-paginate';

const ProductListView = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [view, setView] = useState("list");
  const { categoryId } = useParams();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [data, setData] = useState([]);
  const [limit,setLimit]=useState(5);
  const [pageCount,setPageCount]=useState(1);
  const currentPage=useRef();

  const handlePriceChange = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  
  useEffect(() => {
    currentPage.current=1;
    // getAllUser();
    getPaginatedProducts();
  }, []);

  function getPaginatedProducts(){
    fetch(`http://localhost:3001/api/pagedproducts?page=${currentPage.current}&limit=${limit}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "Products");
        setPageCount(data.pageCount);
        setCurrentProducts(data.result); // set the fetched products to currentProducts
      });
  }

  

  function handlePageClick(e) {
    console.log(e);
   currentPage.current=e.selected+1;
   getPaginatedProducts();
  }
  
  function changeLimit(){
    currentPage.current=1;
    getPaginatedProducts();
  }

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
              <FilterPrice onPriceChange={handlePriceChange} />
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
                    <span className="text-warning">"products"</span>
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
              <ReactPaginate
          breakLabel="..."
          nextLabel="next >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={pageCount}
          previousLabel="< previous"
          renderOnZeroPageCount={null}
          marginPagesDisplayed={2}
          containerClassName="pagination justify-content-center"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          activeClassName="active"
          forcePage={currentPage.current-1}
        />
        <input placeholder="Limit" onChange={e=>setLimit(e.target.value)}/>
        <button onClick={changeLimit}>Set Limit</button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
};

export default ProductListView;