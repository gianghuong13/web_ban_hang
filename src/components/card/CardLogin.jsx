import React from "react";
import { Link } from "react-router-dom";
import {fetchToken} from '../Auth';

const CardLogin = (props) => {
  return (
    <div className={`card shadow-sm ${props.className}`}>
      <div className="card-body text-center"> 
        {
          fetchToken() ? 
          (<h5 className="card-title">Welcome back ᗜˬᗜ</h5>) 
          : (
            <>
              <h5 className="card-title">Sign in for your best experience</h5>
              <Link to="account/signin" className="btn btn-warning">
                Sign in securely
              </Link>
            </>
          )
        }
      </div>
    </div>
  );
};

export default CardLogin;
