import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/account/user', { withCredentials: true })
      .then(response => {
        setIsLoading(false);
        if (response.data.valid) {
          setIsLoggedIn(true);
          setUserId(response.data.user_id);
          const userId = response.data.user_id;

          axios.get(`http://localhost:5000/api/order/${userId}`)
            .then(response => {
              setOrders(response.data);
            });
        }
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    window.location.href = '/account/signin';
  }

  return (
    <div className="container mb-3">
      <h4 className="my-3">Orders</h4>
      <div className="row g-3">
        {orders.map(order => (
          <div className="col-md-6" key={order.order_id}>
            <div className="card">
              <div className="row g-0">
              <div className="col-md-3 text-center">
                <div
                  style={{
                    backgroundColor: "#f8f8f8",
                    width: '100%',
                    height: '100%',
                  }}
                />
              </div>
                <div className="col-md-9">
                  <div className="card-header">
                    <div className="small">
                      <span className="border bg-secondary rounded-left px-2 text-white">
                        Order ID
                      </span>
                      <span className="border bg-white rounded-right px-2 me-2">
                        #{order.order_id}
                      </span>
                      <span className="border bg-secondary rounded-left px-2 text-white">
                        Date
                      </span>
                      <span className="border bg-white rounded-right px-2">
                        {new Date(order.order_date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="card-body">
                    <h6>
                      <Link to="/" className="text-decoration-none">
                        {order.product_name}
                      </Link>
                    </h6>
                    <div className="small">
                      <span className="text-muted me-2">Price:</span>
                      <span className="me-3">${order.total}</span>
                      <span className="me-3">
                        <span className="bg-primary px-1 rounded">
                          &nbsp;&nbsp;&nbsp;
                        </span>
                      </span>
                    </div>
                    <div className="mt-2"></div>
                  </div>
                  <div className="card-footer">
                    <span className="me-2">Status:</span>
                    <span className="text-primary">
                      <i className="bi bi-clock-history me-1"></i>
                      {order.order_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersView;