import React from "react";
import Cookies from 'js-cookie';
import {
    Navigate,
    useLocation
} from "react-router-dom";

export const fetchToken = () => {
    return Cookies.get('sessionId');
}

export function RequireToken({ children }) {
    const auth = fetchToken();
    const location = useLocation();

    if (!auth) {
        return <Navigate to="/account/login" state={{ from: location }} />;
    }
    return children;
}

export const logout = () => {
  Cookies.remove('userId', { path: '/' });
  window.location.reload();
}

export const fetchUser = async () => {
    const response = await fetch('/account/signin', {
        credentials: 'include', // Include cookies in the request
    });
    
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    return data.user;
};

export const isLoggedIn = () => {
    const sessionId = Cookies.get('sessionId');
    return !!sessionId; // Returns true if the sessionId cookie is present, false otherwise
};