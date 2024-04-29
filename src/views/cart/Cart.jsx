import { lazy } from "react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
const CouponApplyForm = lazy(() =>
  import("../../components/others/CouponApplyForm")
);

const CartView = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartData, setCartData] = useState([]); // Add this line

  useEffect(() => {
    axios.get('http://localhost:5000/account/user', { withCredentials: true })
      .then(response => {
        setIsLoading(false);
        if (response.data.valid) {
          setIsLoggedIn(true);
          // Fetch the cart data here
          const userId = response.data.user_id;
          console.log(`le response data is: ${JSON.stringify(response.data)}`);
          console.log(`le user id is ${userId}`); // Replace this with the actual user ID
          axios.get(`http://localhost:5000/api/cart/${userId}`)
            .then(response => {
              setCartData(response.data);
            })
            .catch(err => {
              console.error('Error fetching cart data:', err);
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
  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {cartData.length === 0 ? (
            <p>No product in your cart yet</p>
          ) : (
            cartData.map((item, index) => (
              <div key={index}>
                <h2>{item.productName}</h2>
                <p>{item.productDescription}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Price: {item.price}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CartView;
