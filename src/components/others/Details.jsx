import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';

const Details = (props) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/product/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProduct();
  }, [id]);
  return (
    <React.Fragment>
      <p>
        {product ? product.description : 'Loading...'}
      </p>
    </React.Fragment>
  );
};

export default Details;
