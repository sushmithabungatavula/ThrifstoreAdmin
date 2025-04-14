import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });


  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [vendorId, setVendorId] = useState(() => {
    return localStorage.getItem('vendorId') || null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // Save login state, username, and token to localStorage
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
    if (token) localStorage.setItem('token', token);
  }, [isLoggedIn, token]);


  return (
    <LoginContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        token,
        setToken,
        vendorId,
        setVendorId,
        loading,
        error,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
