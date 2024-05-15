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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState(1);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product:', id);
        const response = await axios.get(`http://localhost:3001/api/product/${id}`);
        setProduct(response.data);
        setProductId(response.data.id);
        setReviewCount(response.data.review.review.length);
        setAverageRating(response.data.averageRating);
        console.log('Product:', response.data);
        setSizes(response.data.sizes);
        setColors(response.data.colors);
        setImgLink(response.data.img);
        setStock(response.data.stock);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchProduct();

}, [id]);

const addToCart = () => {
  setIsLoading(true);
  axios.get('http://localhost:5000/account/user', { withCredentials: true })
    .then(response => {
      if (response.data.valid) {
        setIsLoggedIn(true);
        setUserId(response.data.user_id);
        console.log('User ID:', response.data.user_id);
        if (quantity > stock) {
          setIsLoading(false);
          alert('Quantity exceeds stock');
          return;
        }
        const note = `Size: ${selectedSize}, Color: ${selectedColor}`;
        console.log('Adding product to cart:', productId, quantity, note);
        axios.post(`http://localhost:5000/api/cart/${response.data.user_id}/add-item`, { productId: productId, quantity: quantity, note }) // And here
          .then(response => {
            setIsLoading(false);
            if (response.status === 200) {
              console.log('Cart updated successfully');
            } else if (response.status === 201) {
              console.log('Product added to cart successfully');
            }
          })
          .catch(error => {
            setIsLoading(false);
            console.error('Error adding product to cart:', error);
            // Display an error message to the user
          });

      } else {
        setIsLoading(false);
        window.location.href = '/account/signin';
      }
    })
    .catch(err => {
      setIsLoading(false);
      console.error('Error checking login status:', err);
      window.location.href = '/account/signin';
    });
};

const handleNextImage = () => {
  setCurrentImageIndex((currentImageIndex + 1) % (product ? product.img.length : 1));
};

const handleQuantityChange = (newQuantity) => {
  if (newQuantity >= 0) { // prevent negative quantity
    setQuantity(newQuantity);
  }
};

  return (
    <div className="container-fluid mt-3">
      <div className="row">
        <div className="col-md-8">
          <div className="row mb-3">
            <div className="col-md-5 text-center">
              {product ? (
                <>
                  <img
                    src={product.img[currentImageIndex]}
                    className="img-fluid mb-3"
                    alt={`${product.name} ${currentImageIndex}`}
                    style={{maxWidth: '350px', maxHeight: '350px'}}
                  />
                  <div className="mt-3">
                    {product.img.map((imgUrl, index) => (
                      <img
                        key={index}
                        src={imgUrl}
                        className="img-thumbnail mr-2"
                        alt={`${product.name} ${index}`}
                        style={{width: '60px', cursor: 'pointer'}}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <img src={imgLink} className="img-fluid mb-3" alt="Loading..." />
              )}
            </div>
            <div className="col-md-7">
            <h1 className="h5 d-inline me-2">{product ? product.name : 'Loading...'}</h1>
              <div className="mb-3">
              <span className="text-muted small">
                <div>Rating: {averageRating}</div>
                </span>
                <span className="text-muted small">
                <div>Number of reviews: {reviewCount}</div>
                </span>
                <span className="text-muted small">
                <div>Stock: {stock}</div>
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
                      onChange={(e) => setSelectedSize(e.target.value)}
                      disabled={stock === 0} // Add this line
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
                      onChange={(e) => setSelectedColor(e.target.value)}
                      disabled={stock === 0} // Add this line
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
                      disabled={stock === 0}
                      onClick={() => handleQuantityChange(quantity - 1)}
                    >
                      <i className="bi bi-dash-lg"></i>
                    </button>
                    <span style={{width: '50px', textAlign: 'center'}}>{quantity}</span>
                    <button
                      className="btn btn-primary text-white"
                      type="button"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={stock === 0}
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
                    {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
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
                  {product && product.review && (
                    <RatingsReviews product={product} />
                  )}
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