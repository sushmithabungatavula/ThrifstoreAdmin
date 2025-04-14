import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginContext } from '../context/loginContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(LoginContext);
  return isLoggedIn ? children : <Navigate to="/" replace />;
};


export default ProtectedRoute;
