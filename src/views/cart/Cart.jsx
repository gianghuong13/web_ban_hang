import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
const { lazy } = React;
const CouponApplyForm = lazy(() =>
  import("../../components/others/CouponApplyForm")
);

const CartView = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartData, setCartData] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [detailsId, setDetailsId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/account/user', { withCredentials: true })
      .then(response => {
        setIsLoading(false);
        if (response.data.valid) {
          setIsLoggedIn(true);
          setUserId(response.data.user_id);
          const userId = response.data.user_id;
  
          axios.get(`http://localhost:5000/api/user_cart/${userId}`)
            .then(response => {
              console.log(`response.data in cart is: ${JSON.stringify(response.data)}`);
  
              // Fetch details for each product in the cart
              const cartItems = response.data.map(item => {
                console.log(`item.product_id in cart is: ${item.product_id}`);
                return axios.get(`http://localhost:3001/api/product/${item.product_id}`)
                  .then(productResponse => {
                    // Add product details to the item
                    item.productDetails = productResponse.data;
                    return item;
                  })
                  .catch(error => {
                    console.error('Error fetching product details:', error);
                  });
              });
  
              // Wait for all product details to be fetched
              Promise.all(cartItems)
                .then(completedItems => {
                  // Update cartData state with the completed items
                  setCartData(completedItems);
                });
            })
            .catch(err => {
              console.error('Error fetching cart data:', err);
            });
  
          // Fetch total amount
          axios.get(`http://localhost:5000/cart/total/${userId}`)
            .then(response => {
              console.log(`response.data.totalAmount in cart is: ${response.data.totalAmount}`);
              setTotalAmount(response.data.totalAmount);
            })
            .catch(error => {
              console.error('Error fetching cart total:', error);
            });
        } else {
          window.location.href = '/account/signin';
        }
      })
      .catch(err => {
        console.error('Error checking login status:', err);
        window.location.href = '/account/signin';
      });
  }, []);
  const onSubmitApplyCouponCode = async (values) => {
    alert(JSON.stringify(values));
  };

  const deleteItem = (detailsId) => {
    axios.delete(`http://localhost:5000/api/cart/remove-item/${detailsId}`)
    .then((response) => {
      console.log(response.data.message);
      window.location.reload();
    })
    .catch((error) => {
      console.error('Error deleting item:', error);
    });
  };

  const updateQuantity = (userId, detailsId, quantity) => {
    axios.put(`http://localhost:5000/api/cart/${userId}/update-item/${detailsId}`, { quantity })
      .then((response) => {
        console.log(response.data.message);
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error updating item quantity:', error);
      });
  };
  
  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div className="bg-secondary border-top p-4 text-white mb-3">
            <h1 className="display-6">Shopping Cart</h1>
          </div>
          <div className="container mb-3">
            <div className="row">
              <div className="col-md-9">
                <div className="card">
                  <div className="table-responsive">
                    <table className="table table-borderless">
                      <thead className="text-muted">
                        <tr className="small text-uppercase">
                          <th scope="col">Product</th>
                          <th scope="col" width={120}>
                            Quantity
                          </th>
                          <th scope="col" width={150}>
                            Price
                          </th>
                          <th scope="col" className="text-end" width={130}></th>
                        </tr>
                      </thead>
                      <tbody>
                      {cartData.map((item, index) => {
                        console.log(item);
                        return (
                          <tr key={index}>
                            <td>
                              <div className="row">
                                <div className="col-3 d-none d-md-block">
                                  <img src={item.productDetails ? item.productDetails.image : ''} width="80" alt="..." />
                                </div>
                                <div className="col">
                                  <Link to={`/product/detail/${item.product_id}`} className="text-decoration-none">
                                    {item.productDetails ? item.productDetails.name : ''}
                                  </Link>
                                  <p className="small text-muted">
                                    {item.note} {/* Display the note here */}
                                  </p>
                                </div>
                              </div>
                            </td>
                              <td>
                                <div className="input-group input-group-sm mw-140">
                                <button 
                                    className="btn btn-primary text-white" 
                                    type="button" 
                                    onClick={() => updateQuantity(userId, item.cartdetails_id, item.quantity - 1)}
                                  >
                                    <i className="bi bi-dash-lg"></i>
                                  </button>
                                  <input 
                                    type="text" 
                                    className="form-control" 
                                    defaultValue={item.quantity} 
                                    onChange={(e) => updateQuantity(userId, item.cartdetails_id, e.target.value)}
                                  />
                                  <button 
                                    className="btn btn-primary text-white" 
                                    type="button" 
                                    onClick={() => updateQuantity(userId, item.cartdetails_id, item.quantity + 1)}
                                  >
                                    <i className="bi bi-plus-lg"></i>
                                  </button>
                                </div>
                              </td>
                              <td>
                                <var className="price">{item.price}</var>
                                <small className="d-block text-muted">${item.priceEach}</small>
                              </td>
                              <td className="text-end">
                                <button className="btn btn-sm btn-outline-secondary me-2">
                                  <i className="bi bi-heart-fill"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(item.cartdetails_id)}>
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="card-footer">
                    <Link to="/checkout" className="btn btn-primary float-end">
                      Make Purchase <i className="bi bi-chevron-right"></i>
                    </Link>
                    <Link to="/" className="btn btn-secondary">
                      <i className="bi bi-chevron-left"></i> Continue shopping
                    </Link>
                  </div>
                </div>
                <div className="alert alert-success mt-3">
                  <p className="m-0">
                    <i className="bi bi-truck"></i> Free Delivery within 1-2 weeks
                  </p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card mb-3">
                  <div className="card-body">
                    <CouponApplyForm onSubmit={onSubmitApplyCouponCode} />
                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <dl className="row border-bottom">
                      <dt className="col-6">Total price:</dt>
                      <dd className="col-6 text-end"><strong>${totalAmount}</strong></dd>
                      <dt className="col-6 text-success">Discount:</dt>
                      <dd className="col-6 text-success text-end">-$0</dd>
                      <dt className="col-6 text-success">
                        Coupon: <span className="small text-muted">EXAMPLECODE</span>{" "}
                      </dt>
                      <dd className="col-6 text-success text-end">-$0</dd>
                    </dl>
                    <dl className="row">
                      <dt className="col-6">Total:</dt>
                      <dd className="col-6 text-end  h5">
                        <strong>${totalAmount}</strong>
                      </dd>
                    </dl>
                    <hr />
                    <p className="text-center">
                      <img src="../../images/payment/payments.webp" alt="..." height={26} />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-light border-top p-4">
            <div className="container">
              <h6>Payment and refund policy</h6>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CartView;
