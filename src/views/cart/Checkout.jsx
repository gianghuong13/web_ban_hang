import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

const CheckoutView = () => {
  const [cartData, setCartData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [profileData, setProfileData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    country: '',
    city: '',
    province: '',
    address: ''
  });

  useEffect(() => {
    axios.get('http://localhost:5000/account/user', { withCredentials: true })
      .then(response => {
        if (response.data.valid) {
          setUserId(response.data.user_id);
          const userId = response.data.user_id;

          axios.get(`http://localhost:5000/api/user_cart/${userId}`)
            .then(response => {
              const cartItems = response.data.map(item => {
                return axios.get(`http://localhost:3001/api/product/${item.product_id}`)
                  .then(productResponse => {
                    item.productDetails = productResponse.data;
                    return item;
                  });
              });

              Promise.all(cartItems)
                .then(completedItems => {
                  setCartData(completedItems);
                });
            });

          axios.get(`http://localhost:5000/cart/total/${userId}`)
            .then(response => {
              setTotalAmount(response.data.totalAmount);
            });
            axios.get(`http://localhost:5000/api/checkout/${userId}`)
            .then(response => {
              console.log('Profile:', response.data);
              setProfileData(response.data);
              setIsLoading(false); // Set loading to false after fetching the data
              // Initialize formData with profileData after profileData is fetched
              setFormData({
                email: response.data[0]?.email || '',
                phone: response.data[0]?.phone || '',
                firstName: response.data[0]?.first_name || '',
                lastName: response.data[0]?.last_name || '',
                country: response.data[0]?.country || '',
                city: response.data[0]?.city || '',
                province: response.data[0]?.province || '',
                address: response.data[0]?.address || ''
              });
            });
          } else {
            window.location.href = '/account/signin';
          }
        })
        .catch(err => {
          window.location.href = '/account/signin';
        });
    }, []);
  const onSubmitApplyCouponCode = async (values) => {
    alert(JSON.stringify(values));
  };
  const handleSubmit = (e) => {
    if (isNewAddress) {
      axios.post(`http://localhost:5000/account/${userId}/address`, {
        country: formData.country,
        province: formData.province,
        city: formData.city,
        address: formData.address,
        primary: false // or false, depending on your requirements
      }, {
        withCredentials: true
      })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      });
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  if (isLoading) {
    return <div>Loading...</div>; // Render a loading message while fetching the data
  }
  return (
    <form onSubmit={handleSubmit}>
    <div>
      <div className="bg-secondary border-top p-4 text-white mb-3">
        <h1 className="display-6">Checkout</h1>
      </div>
      <div className="container mb-3">
        <div className="row">
          <div className="col-md-8">
            <div className="card mb-3">
              <div className="card-header">
                <i className="bi bi-envelope"></i> Contact Info
              </div>
              <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email Address"
                    aria-label="Email Address"
                    defaultValue={profileData[0]?.email || 'not found'} // Use the email from profileData
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Mobile no"
                    aria-label="Mobile no"
                    defaultValue={profileData[0]?.phone || 'not found'} // Use the mobile from profileData
                  />
                </div>
              </div>
            </div>
            </div>

            <div className="card mb-3">
              <div className="card-header">
                <i className="bi bi-truck"></i> Shipping Infomation
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-12">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="First Name"
                      defaultValue={profileData[0]?.first_name || 'not found'}
                      required
                    />
                  </div>
                  <div className="col-md-12">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Last Name"
                      defaultValue={profileData[0]?.last_name || 'not found'}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="country"
                      className="form-control"
                      placeholder="Country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                  <input
                      type="text"
                      name="city"
                      className="form-control"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                  <input
                      type="text"
                      name="province"
                      className="form-control"
                      placeholder="Province"
                      value={formData.province}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                  <input
                      type="text"
                      name="address"
                      className="form-control"
                      placeholder="Address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={isNewAddress}
                    onChange={e => setIsNewAddress(e.target.checked)}
                  />
                  <label className="form-check-label">
                    Save as new address
                  </label>
                </div>
                </div>
              </div>
            </div>

            <div className="card mb-3 border-info">
              <div className="card-header bg-info">
                <i className="bi bi-credit-card-2-front"></i> Payment Method
              </div>
              <div className="card-body">
                <div className="row g-3 mb-3 border-bottom">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        id="cod"
                        name="paymentMethod"
                        type="radio"
                        className="form-check-input"
                        defaultChecked
                        required
                      />
                      <label className="form-check-label" htmlFor="credit">
                        COD
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer border-info d-grid">
              <button type="submit" className="btn btn-info">
                  Pay Now <strong>${totalAmount}</strong>
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
            <div className="card-header">
                <i className="bi bi-cart3"></i> Cart{" "}
                <span className="badge bg-secondary float-end">{cartData.length}</span>
              </div>
              <ul className="list-group list-group-flush">
                {cartData.map((item, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between lh-sm">
                    <div>
                      <h6 className="my-0">{item.productDetails.name}</h6>
                      <small className="text-muted">{item.note}, {`Quantity: ${item.quantity}`} </small>
                    </div>
                    <span className="text-muted">${item.productDetails.price.price}</span>
                  </li>
                ))}
                <li className="list-group-item d-flex justify-content-between">
                  <span>Total (USD)</span>
                  <strong>${totalAmount}</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
  );
};

export default CheckoutView;
