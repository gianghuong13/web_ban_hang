import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { logout } from "../Auth";

const CardLogin = (props) => {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/account/user', { withCredentials: true })
      .then(res => {
        if (res.data.valid) {
          setUsername(res.data.username);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const handleLogout = () => {
    logout();
    setUsername(null);
  };

  return (
    <div className={`card shadow-sm ${props.className}`}>
      <div className="card-body text-center">
        <h5 className="card-title">{username ? `Welcome back, ${username} ᗜˬᗜ!` : 'Sign in for your best experience'}</h5>
        {username ? (
          <button onClick={handleLogout} className="btn btn-warning">Logout</button>
        ) : (
          <Link to="account/signin" className="btn btn-warning">Sign in securely</Link>
        )}
      </div>
    </div>
  );
};

export default CardLogin;