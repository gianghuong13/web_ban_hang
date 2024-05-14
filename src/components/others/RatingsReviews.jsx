import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const RatingsReviews = (props) => {
  const [product, setProduct] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [rating, setRating] = useState(1);
  const [review, setReview] = useState('');
  const { id } = useParams();
  const [errorMessage, setErrorMessage] = useState(null);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/product/${id}`);
        setProduct(response.data);

        // Fetch the user's name for each review
        const userIds = response.data.review.user_id;
        const newUserNames = {};
        const promises = userIds.map(async (userId) => {
          const userResponse = await axios.get(`http://localhost:5000/api/checkout/${userId}`);
          if (userResponse.data[0]) {
            newUserNames[userId] = `${userResponse.data[0].first_name} ${userResponse.data[0].last_name}`;
          } else {
            console.log(`No data returned for user ID ${userId}`);
          }
        });

        await Promise.all(promises);
        setUserNames(newUserNames);

        // Check if the user is logged in and if they've already reviewed the product
        const userResponse = await axios.get('http://localhost:5000/account/user', { withCredentials: true });
        if (userResponse.data.valid) {
          setIsLoggedIn(true);
          setLoggedInUserId(userResponse.data.user_id);
          setUserHasReviewed(userIds.includes(userResponse.data.user_id));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      await axios.put(`http://localhost:3001/api/product/${id}/review`, {
        user_id: loggedInUserId,
        rating,
        review,
      }, { withCredentials: true });
  
      // Refresh the product data
      window.location.reload();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMessage('You have already reviewed this product');
      } else {
        console.error(error);
      }
    }
  };

  return (
    <div className="container mt-5">
      {product && product.review && product.review.review.map((reviewText, idx) => (
        <div key={idx} className="card mb-3">
          <div className="card-header">
            Reviewed by: {userNames[product.review.user_id[idx]]}
          </div>
          <div className="card-body">
            <h5 className="card-title">Rating: {product.review.rating[idx]}</h5>
            <p className="card-text">{reviewText}</p>
          </div>
        </div>
      ))}
       {errorMessage && (
      <div className="alert alert-danger" role="alert">
        {errorMessage}
      </div>
    )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="rating">Rating:</label>
            <select id="rating" value={rating} onChange={(e) => setRating(e.target.value)} className="form-control">
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="review">Review:</label>
            <textarea id="review" value={review} onChange={(e) => setReview(e.target.value)} className="form-control" />
          </div>
          <button type="submit" className="btn btn-primary">Submit Review</button>
        </form>
    </div>
  );
};

export default RatingsReviews;