import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const RatingsReviews = (props) => {
  const [product, setProduct] = useState(null);
  const [userNames, setUserNames] = useState({});
  const { id } = useParams();

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
      } catch (error) {
        console.error(error);
      }
    };

    fetchProduct();
  }, [id]);

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
    </div>
  );
};

export default RatingsReviews;