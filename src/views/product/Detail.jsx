import { lazy } from "react";
import { data } from "../../data";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { set } from "mongoose";

const CardFeaturedProduct = lazy(() =>
  import("../../components/card/CardFeaturedProduct")
);
const CardServices = lazy(() => import("../../components/card/CardServices"));
const Details = lazy(() => import("../../components/others/Details"));
const RatingsReviews = lazy(() =>
  import("../../components/others/RatingsReviews")
);
const QuestionAnswer = lazy(() =>
  import("../../components/others/QuestionAnswer")
);
const ShippingReturns = lazy(() =>
  import("../../components/others/ShippingReturns")
);
const SizeChart = lazy(() => import("../../components/others/SizeChart"));

const ProductDetailView = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [productId, setProductId] = useState(null); 
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [imgLink, setImgLink] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/product/${id}`);
        console.log('Product:', response.data);
        setProduct(response.data);
        setProductId(response.data._id);
        console.log('Product ID:', response.data._id);
        setSizes(response.data.sizes);
        setColors(response.data.colors);
        setImgLink(response.data.img);
        console.log('Img:', response.data.img);
        console.log('Sizes:', response.data.sizes);
        console.log('Colors:', response.data.colors);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchProduct();


}, [id]);

useEffect(() => {
  console.log(`le user id is ${userId}`);
}, [userId]);

const addToCart = () => {
  axios.get('http://localhost:5000/account/user', { withCredentials: true })
  .then(response => {
    if (response.data.valid) {
      setIsLoggedIn(true);
      console.log(`le response data is: ${JSON.stringify(response.data)}`);
      setUserId(response.data.user_id);

      console.log('Adding product to cart:', product);
      const quantity = 1;

      axios.post(`http://localhost:5000/api/cart/${response.data.user_id}/add-item`, { productId, quantity, note: `Size: ${selectedSize}, Color: ${selectedColor}` })
      .then(response => {
        if (response.status === 200) {
          console.log('Cart updated successfully');
        } else if (response.status === 201) {
          console.log('Product added to cart successfully');
        }
      })
      .catch(error => {
        console.error('Error adding product to cart:', error);
      });

    } else {
      window.location.href = '/account/signin';
    }
  })
  .catch(err => {
    console.error('Error checking login status:', err);
    window.location.href = '/account/signin';
  });
};

  return (
    <div className="container-fluid mt-3">
      <div className="row">
        <div className="col-md-8">
          <div className="row mb-3">
            <div className="col-md-5 text-center">
              <img
                src= {product ? product.img : imgLink}
                className="img-fluid mb-3"
                alt={product?.name}
              />
            </div>
            <div className="col-md-7">
            <h1 className="h5 d-inline me-2">{product ? product.name : 'Loading...'}</h1>
              <span className="badge bg-success me-2">New</span>
              <span className="badge bg-danger me-2">Hot</span>
              <div className="mb-3">
                <i className="bi bi-star-fill text-warning me-1" />
                <i className="bi bi-star-fill text-warning me-1" />
                <i className="bi bi-star-fill text-warning me-1" />
                <i className="bi bi-star-fill text-warning me-1" />
                <i className="bi bi-star-fill text-secondary me-1" />|{" "}
                <span className="text-muted small">
                  42 ratings and 4 reviews
                </span>
              </div>
              <dl className="row small mb-3">
                <dt className="col-sm-3">Availability</dt>
                <dd className="col-sm-9">In stock</dd>
                <dt className="col-sm-3">Size</dt>
                <dd className="col-sm-9">
                  {sizes.map((size, index) => (
                    <div className="form-check form-check-inline" key={index}>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="size"
                        id={`size-${index}`}
                        value={size}
                        onChange={(e) => setSelectedSize(e.target.value)} // Add this line
                      />
                      <label className="form-check-label" htmlFor={`size-${index}`}>
                        {size}
                      </label>
                    </div>
                  ))}
                </dd>
                <dd className="col-sm-9">
                  {colors.map((color, index) => (
                    <div key={index} className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="colorOptions"
                        id={`color${index}`}
                        value={color}
                        onChange={(e) => setSelectedColor(e.target.value)} // Add this line
                      />
                      <label className="form-check-label" htmlFor={`color${index}`}>
                        {color}
                      </label>
                    </div>
                  ))}
                </dd>
              </dl>

              <div className="mb-3">
              <span className="fw-bold h5 me-2">{product ? `$${product.price.price}` : 'Loading...'}</span>
                <del className="small text-muted me-2">{product ? `$${product.price.original}` : 'Loading...'}</del>
                <span className="rounded p-1 bg-warning  me-2 small">
                {product ? `-$${product.price.discount}` : 'Loading...'}
                </span>
              </div>
              <div className="mb-3">
                <div className="d-inline float-start me-2">
                  <div className="input-group input-group-sm mw-140">
                    <button
                      className="btn btn-primary text-white"
                      type="button"
                    >
                      <i className="bi bi-dash-lg"></i>
                    </button>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="1"
                    />
                    <button
                      className="btn btn-primary text-white"
                      type="button"
                    >
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </div>
                </div>
                <button 
                    className="btn btn-primary" 
                    disabled={!selectedSize || !selectedColor}
                    onClick={addToCart}
                  >
                    Add to Cart
                  </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  title="Add to wishlist"
                >
                  <i className="bi bi-heart-fill"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <nav>
                <div className="nav nav-tabs" id="nav-tab" role="tablist">
                  <a
                    className="nav-link active"
                    id="nav-details-tab"
                    data-bs-toggle="tab"
                    href="#nav-details"
                    role="tab"
                    aria-controls="nav-details"
                    aria-selected="true"
                  >
                    Details
                  </a>
                  <a
                    className="nav-link"
                    id="nav-randr-tab"
                    data-bs-toggle="tab"
                    href="#nav-randr"
                    role="tab"
                    aria-controls="nav-randr"
                    aria-selected="false"
                  >
                    Ratings & Reviews
                  </a>
                  <a
                    className="nav-link"
                    id="nav-faq-tab"
                    data-bs-toggle="tab"
                    href="#nav-faq"
                    role="tab"
                    aria-controls="nav-faq"
                    aria-selected="false"
                  >
                    Questions and Answers
                  </a>
                  <a
                    className="nav-link"
                    id="nav-ship-returns-tab"
                    data-bs-toggle="tab"
                    href="#nav-ship-returns"
                    role="tab"
                    aria-controls="nav-ship-returns"
                    aria-selected="false"
                  >
                  </a>
                </div>
              </nav>
              <div className="tab-content p-3 small" id="nav-tabContent">
                <div
                  className="tab-pane fade show active"
                  id="nav-details"
                  role="tabpanel"
                  aria-labelledby="nav-details-tab"
                >
                  <Details />
                </div>
                <div
                  className="tab-pane fade"
                  id="nav-randr"
                  role="tabpanel"
                  aria-labelledby="nav-randr-tab"
                >
                  {Array.from({ length: 5 }, (_, key) => (
                    <RatingsReviews key={key} />
                  ))}
                </div>
                <div
                  className="tab-pane fade"
                  id="nav-faq"
                  role="tabpanel"
                  aria-labelledby="nav-faq-tab"
                >
                  <dl>
                    {Array.from({ length: 5 }, (_, key) => (
                      <QuestionAnswer key={key} />
                    ))}
                  </dl>
                </div>
                <div
                  className="tab-pane fade"
                  id="nav-ship-returns"
                  role="tabpanel"
                  aria-labelledby="nav-ship-returns-tab"
                >
                  <ShippingReturns />
                </div>
                <div
                  className="tab-pane fade"
                  id="nav-size-chart"
                  role="tabpanel"
                  aria-labelledby="nav-size-chart-tab"
                >
                  <SizeChart />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <CardFeaturedProduct data={data.products} />
          <CardServices />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;
