import React, { } from "react";
import { jwtDecode } from 'jwt-decode';

import {
    Navigate ,
    useLocation
  } from "react-router-dom";
export const setToken = (token) =>{
    // set token in localStorage
    localStorage.setItem('Token', token)
}
export const fetchToken = (token) =>{
    // fetch the token
    return localStorage.getItem('Token')
}
export function RequireToken({children}) {
      
    let auth = fetchToken()
    let location = useLocation();
    
    if (!auth) {
        
      return <Navigate to="/account/login" state={{ from: location }} />;
    }
    
    return children;
}

export const logout = () => {
  localStorage.removeItem('Token');
  window.location.reload();
}

export const fetchUserId = () => {
  const token = fetchToken();
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    return decoded.user_id; // replace 'user_id' with the actual key in your token's payload
  } catch (error) {
    console.error('An error occurred while decoding the token:', error);
    return null;
  }
}