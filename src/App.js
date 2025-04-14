// src/App.js

import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import { LoginProvider, LoginContext } from './context/loginContext';
import Login from './Auth/login';

import Layout from './component/layout';
import ProtectedRoute from './component/ProtectedRoute';

import Dashboard from './pages/dashboard';
import ProductList from './pages/productList';
import CategoryList from './pages/categoryList';
import OrderList from './pages/orderList';
import OrderDetails from './pages/orderDetails';
import AllCustomersPage from './pages/customers/AllCustomersPage';

import CustomerOverviewPage from './pages/customers/CustomerOverviewPage';
import NotificationsPage from './pages/customers/NotificationsPage';

import ReferralsPage from './pages/customers/ReferralsPage';
import AddressBillingPage from './pages/customers/AddressBillingPage';
import ManageReviewsPage from './pages/customers/ManageReviewsPage';

import StoreDetailsPage from './pages/settings/StoreDetailsPage';
import ShippingDeliveryPage from './pages/settings/ShippingDeliveryPage';
import PaymentsPage from './pages/settings/PaymentsPage';
import StoreNotificationsPage from './pages/settings/StoreNotificationsPage';
import LocationsPage from './pages/settings/LocationsPage';
import CheckoutPage from './pages/settings/CheckoutPage';

import  InventoryPage  from './pages/inventoryPage/inventory';


function App() {
  // Wrap everything in LoginProvider so the context is available
  return (
    <LoginProvider>
      <Router>
        <AppRoutes />
      </Router>
    </LoginProvider>
  );
}

function AppRoutes() {
  // Now we can consume the context properly
  const { isLoggedIn } = useContext(LoginContext);

  console.log({ isLoggedIn });


  return (
    <Routes>
      {/* Redirect to /dashboard if logged in, otherwise show Login */}
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ecommerce/CategoryList"
        element={
          <ProtectedRoute>
            <Layout>
              <CategoryList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ecommerce/OrderDetails/:orderId"
        element={
          <ProtectedRoute>
            <Layout>
              <OrderDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/OrderList"
        element={
          <ProtectedRoute>
            <Layout>
              <OrderList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ecommerce/ProductList"
        element={
          <ProtectedRoute>
            <Layout>
              <ProductList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Customer/AllCustomersPage"
        element={
          <ProtectedRoute>
            <Layout>
              <AllCustomersPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Customer/CustomerOverviewPage"
        element={
          <ProtectedRoute>
            <Layout>
              <CustomerOverviewPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Customer/AddressBillingPage"
        element={
          <ProtectedRoute>
            <Layout>
              <AddressBillingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Customer/NotificationsPage"
        element={
          <ProtectedRoute>
            <Layout>
              <NotificationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/Customer/ManageReviewsPage"
        element={
          <ProtectedRoute>
            <Layout>
              <ManageReviewsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/InventoryPage"
        element={
          <ProtectedRoute>
            <Layout>
              <InventoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/Customer/ReferralsPage"
        element={
          <ProtectedRoute>
            <Layout>
              <ReferralsPage />
            </Layout>
          </ProtectedRoute>
        }
      />


<Route
        path="/Settings/StoreDetailsPage"
        element={
          <ProtectedRoute>
            <Layout>
              <StoreDetailsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

<Route
        path="/Settings/ShippingDeliveryPage"
        element={
          <ProtectedRoute>
            <Layout>
              <ShippingDeliveryPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Settings/PaymentsPage"
        element={
          <ProtectedRoute>
            <Layout>
              <PaymentsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Settings/StoreNotificationsPage"
        element={
          <ProtectedRoute>
            <Layout>
              <StoreNotificationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Settings/LocationsPage"
        element={
          <ProtectedRoute>
            <Layout>
              <LocationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Settings/CheckoutPage"
        element={
          <ProtectedRoute>
            <Layout>
              <CheckoutPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
