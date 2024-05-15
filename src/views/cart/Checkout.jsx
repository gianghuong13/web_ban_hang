import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

const CheckoutView = () => {
  const [cartData, setCartData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [profileData, setProfileData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [cartId, setCartId] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [addresses, setAddresses] = useState([]); // State to hold addresses
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    country: '',
    city: '',
    province: '',
    address: '',
    address_id: ''
  });
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/account/user', { withCredentials: true })
      .then(response => {
        if (response.data.valid) {
          const userId = response.data.user_id;
          setUserId(userId);
          axios.get(`http://localhost:5000/api/user_cart/${userId}`)
            .then(response => {
              console.log(`cartid in respnse.data is ${response.data[0].cart_id}`);
              setCartId(response.data[0].cart_id);
              const cartId = response.data[0].cart_id;
              console.log(`cartId is: ${cartId}`);
              axios.get(`http://localhost:5000/cart/total/${cartId}`)
                .then(response => {
                  console.log('Total amount:', response.data.totalAmount);
                  setTotalAmount(response.data.totalAmount);
                });
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
                  if (completedItems.length > 0) {
                    setCartId(completedItems[0].cart_id);
                  }
                });
            });

          axios.get(`http://localhost:5000/account/${userId}/address/default`, { withCredentials: true })
            .then(response => {
              setDefaultAddress(response.data);
            })
            .catch(error => {
              console.error(error);
            });

          axios.get(`http://localhost:5000/account/${userId}/addresses`, { withCredentials: true }) // Fetch addresses
            .then(response => {
              setAddresses(response.data);
            })
            .catch(error => {
              console.error(error);
            });
            setTimeout(() => {
              setIsLoading(false);
            }, 1000);
          axios.get(`http://localhost:5000/api/checkout/${userId}`)
            .then(response => {
              console.log('Profile:', response.data);
              setProfileData(response.data);
              setIsLoading(false);
              setFormData({
                email: response.data[0]?.email || '',
                phone: response.data[0]?.phone || '',
                firstName: response.data[0]?.first_name || '',
                lastName: response.data[0]?.last_name || '',
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

  const handleAddressChange = (addressId) => {
    const selectedAddress = addresses.find(address => address.address_id === addressId);
    setFormData({
      ...formData,
      country: selectedAddress.country,
      city: selectedAddress.city,
      province: selectedAddress.province,
      address: selectedAddress.address,
      address_id: selectedAddress.address_id
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let addressToUse = formData; // Initialize with the form data
    
    // Check if the address entered by the user is different from the default address
    if (
      formData.address_id === "new" &&
      defaultAddress &&
      (formData.address !== defaultAddress.address ||
      formData.city !== defaultAddress.city ||
      formData.province !== defaultAddress.province ||
      formData.country !== defaultAddress.country)
    ) {
      try {
        const response = await axios.post(`http://localhost:5000/account/${userId}/address`, {
          country: formData.country,
          province: formData.province,
          city: formData.city,
          address: formData.address,
          primary: true // or false, depending on your requirements
        }, {
          withCredentials: true
        });
        console.log('Address added successfully:', response.data);
        addressToUse = response.data;
      } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 400) {
          alert('This address already exists');
        }
        return; // Stop further execution if an error occurs
      }
    }
  
    console.log('Request data:', {
      cart_id: cartId,
      address_id: addressToUse?.address_id || ''
    });
  
    try {
      const response = await axios.post(`http://localhost:5000/api/order/${userId}/add`, {
        cart_id: cartId,
        address_id: addressToUse?.address_id || ''
      }, {
        withCredentials: true
      });
      console.log('Order created successfully:', response.data);
      setOrderSuccess(true);
  
      try {
        console.log(`Updating cart status for cart ID ${cartId}`)
        const updateCartResponse = await axios.put(`http://localhost:5000/api/user_cart/${cartId}/primary/`);
        console.log('Cart status updated successfully:', updateCartResponse.data);
      } catch (updateCartError) {
        console.error('Error updating cart status:', updateCartError);
      }
  
      window.location.href = 'account/orders';
    } catch (error) {
      console.error(error);
    }
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
              </div>
            </div>
            </div>
                <div className="card mb-3">
            <div className="card-header">
              <i className="bi bi-truck"></i> Shipping Information
            </div>
            <div className="card-body">
              <div className="row g-3">
                {/* Render radio buttons for addresses */}
                {addresses.map(address => (
                  <div key={address.address_id} className="col-md-12">
                    <div className="form-check">
                      <input
                        type="radio"
                        id={`address-${address.address_id}`}
                        name="address_id"
                        className="form-check-input"
                        value={address.address_id}
                        checked={formData.address_id === address.address_id}
                        onChange={() => handleAddressChange(address.address_id)}
                      />
                      <label className="form-check-label" htmlFor={`address-${address.address_id}`}>
                        {`${address.address}, ${address.province}, ${address.city}, ${address.country}`}
                      </label>
                    </div>
                  </div>
                ))}
                {/* Radio button for creating a new address */}
                <div className="col-md-12">
                  <div className="form-check">
                    <input
                      type="radio"
                      id="new-address"
                      name="address_id"
                      className="form-check-input"
                      value="new"
                      checked={formData.address_id === "new"}
                      onChange={() => setFormData({ ...formData, address_id: "new" })}
                    />
                    <label className="form-check-label" htmlFor="new-address">
                      Add New Address
                    </label>
                    {formData.address_id === "new" && (
                      <div className="row g-3">
                        <div className="col-md-12">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-12">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="City"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-12">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Province"
                            name="province"
                            value={formData.province}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-12">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
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
