import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Paging from './Paging';
import Breadcrumb from './Breadcrumb';
import FilterCategory from './filter/Category';
import FilterPrice from './filter/Price';
import FilterSize from './filter/Size';
import FilterStar from './filter/Star';
import FilterColor from './filter/Color';
import FilterTag from './filter/Tag';
import CardServices from './card/CardServices';
import CardProductGrid from './card/CardProductGrid';
import CardProductList3 from './card/CardProductList3';
import '../search.css';

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const Search = () => {
    const query = useQuery();
    const searchQuery = query.get('q');
    const [allProducts, setAllProducts] = useState([]);
    const [currentProducts, setCurrentProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [view, setView] = useState('list');
    const [minPrice, setMinPrice] = useState(null);
    const [maxPrice, setMaxPrice] = useState(null);
    const pageLimit = 9;

    const handlePriceChange = (min, max) => {
        setMinPrice(min);
        setMaxPrice(max);
    };

    const fetchProducts = async () => {
        if (searchQuery) {
            try {
                console.log('Fetching products for query:', searchQuery);
                const response = await axios.get(`http://localhost:3002/api/products/search?q=${searchQuery}`);
                const products = response.data.map(hit => {
                    let images = [];
                    try {
                        const imgString = hit._source.img;
                        const parsedImgs = JSON.parse(imgString.replace(/'/g, '"'));
                        images = parsedImgs.map(imgObj => Object.keys(imgObj)[0]);
                        console.log('Parsed Images:', images);
                    } catch (err) {
                        console.error('Error parsing img field:', err);
                        images = [];
                    }
                    return {
                        ...hit._source,
                        id: hit._id,
                        images: images
                    };
                });
                console.log('Mapped Products:', products);
                setAllProducts(products);
                // Calculate total pages based on products length
                const totalFilteredProducts = products.length;
                setTotalItems(totalFilteredProducts);
                setTotalPages(Math.ceil(products.length / pageLimit));
                // Set current products for the first page
                setCurrentProducts(products.slice(0, pageLimit));
            } catch (err) {
                console.error('Error searching products in frontend:', err);
                setAllProducts([]);
                setCurrentProducts([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [searchQuery]);

    useEffect(() => {
        if (allProducts.length > 0) {
            let filteredProducts = allProducts;
            if (minPrice !== null && maxPrice !== null) {
                filteredProducts = filteredProducts.filter(product =>
                    product.price.price >= minPrice && product.price.price <= maxPrice
                );
            }
            const totalFilteredProducts = filteredProducts.length;
            setTotalItems(totalFilteredProducts);
            setTotalPages(Math.ceil(totalFilteredProducts / pageLimit));
            const start = (currentPage - 1) * pageLimit;
            const end = start + pageLimit;
            setCurrentProducts(filteredProducts.slice(start, end));
        }
    }, [allProducts, minPrice, maxPrice, currentPage]);

    return (
        <React.Fragment>
            <div className="p-5 bg-primary bs-cover" style={{ backgroundImage: "url(../../images/banner/fashions.webp)" }}>
                <div className="container text-center">
                    <span className="display-5 px-3 bg-white rounded shadow">Search Results</span>
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
                        <FilterTag />
                        <CardServices />
                    </div>
                    <div className="col-md-9">
                        <div className="row">
                            <div className="col-7">
                                <span className="align-middle fw-bold">
                                    {totalItems} results for{" "}
                                    <span className="text-warning">"{searchQuery}"</span>
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
                                    <option value={5}>Price high to low</option>
                                </select>
                                <div className="btn-group ms-3" role="group">
                                    <button
                                        aria-label="Grid"
                                        type="button"
                                        onClick={() => setView('grid')}
                                        className={`btn ${view === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    >
                                        <i className="bi bi-grid" />
                                    </button>
                                    <button
                                        aria-label="List"
                                        type="button"
                                        onClick={() => setView('list')}
                                        className={`btn ${view === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    >
                                        <i className="bi bi-list" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <hr />
                        <div className="row g-3">
                            {view === 'grid' &&
                                currentProducts.map((product, idx) => (
                                    <div key={idx} className="col-md-4">
                                        <Link to={`/product/${product.id}`}>
                                            <CardProductGrid data={product} />
                                        </Link>
                                    </div>
                                ))}
                            {view === 'list' &&
                                currentProducts.map((product, idx) => (
                                    <div key={idx} className="col-md-12">
                                        <CardProductList3 data={product} />
                                    </div>
                                ))}
                        </div>
                        <hr />
                        <Paging
                            totalRecords={totalItems}
                            currentPage={currentPage}
                            pageLimit={pageLimit}
                            pageNeighbours={3}
                            sizing=""
                            alignment="justify-content-center"
                            onPageChanged={(data) => setCurrentPage(data.currentPage)}
                        />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Search;
