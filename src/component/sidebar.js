import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronRight, FaChevronDown, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

import './sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const activeLink = location.pathname;

  // Expand/collapse states for individual sections
  const [isProductsOpen, setProductsOpen] = useState(false);
  const [isOrdersOpen, setOrdersOpen] = useState(false);
  const [isCustomersOpen, setCustomersOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  // State to track whether the sidebar is collapsed or expanded
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  /**
   * ------------------------------------------
   *  Expand individual sections based on route
   * ------------------------------------------
   */
  useEffect(() => {
    if (activeLink.startsWith('/ecommerce/products')) {
      setProductsOpen(true);
    }
    if (activeLink.startsWith('/ecommerce/orders')) {
      setOrdersOpen(true);
    }
    if (activeLink.startsWith('/Customer/AllCustomersPage') ||
        activeLink.startsWith('/Customer/CustomerOverviewPage') ||
        activeLink.startsWith('/Customer/AddressBillingPage') ||
        activeLink.startsWith('/Customer/NotificationsPage')) {
      setCustomersOpen(true);
    }
    if (activeLink.startsWith('/ecommerce/settings') ||
        activeLink.startsWith('/Settings/')) {
      setSettingsOpen(true);
    }
  }, [activeLink]);

  /**
   * ------------------
   *  TOGGLE FUNCTIONS
   * ------------------
   */
  const toggleProducts = () => setProductsOpen(!isProductsOpen);
  const toggleOrders = () => setOrdersOpen(!isOrdersOpen);
  const toggleCustomers = () => setCustomersOpen(!isCustomersOpen);
  const toggleSettings = () => setSettingsOpen(!isSettingsOpen);

  // Toggle for collapsing/expanding entire sidebar
  const handleSidebarToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  /**
   * ----------------------
   *  PATH-BASED CONDITIONS
   * ----------------------
   */
  // We consider the user "in the advanced customer pages" if the path includes
  // any of CustomerOverviewPage, AddressBillingPage, or NotificationsPage.
  const isInCustomerPages =
    activeLink.includes('/Customer/CustomerOverviewPage') ||
    activeLink.includes('/Customer/AddressBillingPage') ||
    activeLink.includes('/Customer/NotificationsPage');

  /**
   * -----------------
   *   STYLES & UI
   * -----------------
   */
  const doubleArrowIconStyle = {
    transition: 'transform 0.3s ease',
    transform: isSidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
    fontSize: '16px',
    color: '#555',
  };

  // Main item style
  const mainItemStyle = (link) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
    cursor: 'pointer',
    borderRadius: '6px',
    marginBottom: '8px',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '14px',
    padding: '10px 12px',
    color: activeLink.startsWith(link) ? '#03623f' : '#555555',
    backgroundColor: activeLink.startsWith(link) ? '#D8F3E7' : 'transparent',
    borderLeft: activeLink.startsWith(link)
      ? '4px solid #2AB674'
      : '4px solid transparent',
    transition: 'background-color 0.2s, color 0.2s, justify-content 0.3s',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  });

  // Sub-level container for folders (with child links)
  const subItemContainerStyle = (link, level) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
    marginBottom: '6px',
    padding: '8px 12px',
    paddingLeft: isSidebarCollapsed ? '12px' : `${12 + Math.min(level, 3) * 15}px`,
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '400',
    color: activeLink.startsWith(link) ? '#1c604f' : '#666666',
    backgroundColor: activeLink.startsWith(link) ? '#E4FAF0' : 'transparent',
    borderLeft: activeLink.startsWith(link)
      ? '3px solid #2AB674'
      : '3px solid transparent',
    transition: 'background-color 0.2s, color 0.2s',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  });

  // Sub-level link style (no children)
  const subItemLinkStyle = (link, level) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '6px',
    padding: '8px 12px',
    paddingLeft: isSidebarCollapsed ? '12px' : `${12 + level * 15}px`,
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '400',
    color: activeLink === link ? '#1c604f' : '#666666',
    backgroundColor: activeLink === link ? '#E4FAF0' : 'transparent',
    borderLeft: activeLink === link
      ? '3px solid #2AB674'
      : '3px solid transparent',
    transition: 'background-color 0.2s, color 0.2s',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  });

  // Show bullet only if active
  const bulletStyle = (isActive) => ({
    width: isActive ? '7px' : '0px',
    height: isActive ? '7px' : '0px',
    borderRadius: '50%',
    backgroundColor: '#2AB674',
    marginRight: isSidebarCollapsed ? '0px' : '8px',
    transition: 'width 0.2s, height 0.2s, margin-right 0.2s',
  });

  // Helper function to conditionally render label text (for collapsed vs expanded)
  const renderLabel = (text) => {
    return isSidebarCollapsed ? '' : text; 
  };

  return (
    <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Toggle Icon */}
      <div className="toggle-button" onClick={handleSidebarToggle}>
        {isSidebarCollapsed ? (
          <FaAngleDoubleRight style={doubleArrowIconStyle} />
        ) : (
          <FaAngleDoubleLeft style={doubleArrowIconStyle} />
        )}
      </div>

      {/* Dashboard */}
      <Link
        to="/dashboard"
        style={subItemLinkStyle('/dashboard', 0)}
      >
        <div style={bulletStyle(activeLink === '/dashboard')} />
        {renderLabel('Dashboard')}
      </Link>

      {/* Inventory */}
      <Link
        to="/InventoryPage"
        style={subItemLinkStyle('/InventoryPage', 0)}
      >
        <div style={bulletStyle(activeLink === '/InventoryPage')} />
        {renderLabel('Inventory')}
      </Link>

      {/* Products (folder) */}
      <div
        style={subItemContainerStyle('/ecommerce/products', 0)}
        onClick={toggleProducts}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={bulletStyle(activeLink.startsWith('/ecommerce/products'))} />
          {renderLabel('Products')}
        </div>
        {isSidebarCollapsed ? null : (isProductsOpen ? <FaChevronDown /> : <FaChevronRight />)}
      </div>
      {isProductsOpen && (
        <div>
          <Link
            to="/ecommerce/ProductList"
            style={subItemLinkStyle('/ecommerce/ProductList', 1)}
          >
            <div style={bulletStyle(activeLink === '/ecommerce/ProductList')} />
            {renderLabel('Product List')}
          </Link>
          <Link
            to="/ecommerce/categoryList"
            style={subItemLinkStyle('/ecommerce/categoryList', 1)}
          >
            <div style={bulletStyle(activeLink === '/ecommerce/categoryList')} />
            {renderLabel('Category List')}
          </Link>
        </div>
      )}

      {/* Orders */}
      <div
        style={subItemContainerStyle('/ecommerce/orders', 0)}
        onClick={toggleOrders}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={bulletStyle(activeLink.startsWith('/ecommerce/orders'))} />
          {renderLabel('Orders')}
        </div>
        {isSidebarCollapsed ? null : (isOrdersOpen ? <FaChevronDown /> : <FaChevronRight />)}
      </div>
      {isOrdersOpen && (
        <div>
          <Link
            to="/OrderList"
            style={subItemLinkStyle('/OrderList', 1)}
          >
            <div style={bulletStyle(activeLink === '/OrderList')} />
            {renderLabel('Order List')}
          </Link>

          {/*
            Conditionally hide "Order Details" if the user is in /Customer/... pages.
            We'll only show it if NOT in the advanced customer pages.
          */}
          {/* {!isInCustomerPages && (
            <Link
              to="/ecommerce/OrderDetails/:orderId"
              style={subItemLinkStyle('/ecommerce/OrderDetails/:orderId', 1)}
            >
              <div style={bulletStyle(activeLink === '/ecommerce/OrderDetails/:orderId')} />
              {renderLabel('Order Details')}
            </Link>
          )} */}
        </div>
      )}

      {/* Customers (folder) */}
      <div
        style={subItemContainerStyle('/Customer', 0)} 
        onClick={toggleCustomers}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={bulletStyle(
            activeLink.startsWith('/Customer/AllCustomersPage') ||
            activeLink.includes('/Customer/CustomerOverviewPage') ||
            activeLink.includes('/Customer/AddressBillingPage') ||
            activeLink.includes('/Customer/NotificationsPage')
          )} />
          {renderLabel('Customers')}
        </div>
        {isSidebarCollapsed ? null : (isCustomersOpen ? <FaChevronDown /> : <FaChevronRight />)}
      </div>
      {isCustomersOpen && (
        <div>
          {/* Always show All Customers */}
          <Link
            to="/Customer/AllCustomersPage"
            style={subItemLinkStyle('/Customer/AllCustomersPage', 1)}
          >
            <div style={bulletStyle(activeLink === '/Customer/AllCustomersPage')} />
            {renderLabel('All Customers')}
          </Link>

          {/*
            Only show the advanced customer links if user is *already* in one of them:
            /Customer/CustomerOverviewPage, /Customer/AddressBillingPage, or /Customer/NotificationsPage
          */}
          {isInCustomerPages && (
            <>
              <Link
                to="/Customer/CustomerOverviewPage"
                style={subItemLinkStyle('/Customer/CustomerOverviewPage', 1)}
              >
                <div style={bulletStyle(activeLink === '/Customer/CustomerOverviewPage')} />
                {renderLabel('Overview')}
              </Link>
              <Link
                to="/Customer/AddressBillingPage"
                style={subItemLinkStyle('/Customer/AddressBillingPage', 1)}
              >
                <div style={bulletStyle(activeLink === '/Customer/AddressBillingPage')} />
                {renderLabel('Address & Billing')}
              </Link>
              <Link
                to="/Customer/NotificationsPage"
                style={subItemLinkStyle('/Customer/NotificationsPage', 1)}
              >
                <div style={bulletStyle(activeLink === '/Customer/NotificationsPage')} />
                {renderLabel('Notifications')}
              </Link>
            </>
          )}
        </div>
      )}

      {/* Manage Reviews */}
      <Link
        to="/Customer/ManageReviewsPage"
        style={subItemLinkStyle('/Customer/ManageReviewsPage', 0)}
      >
        <div style={bulletStyle(activeLink === '/Customer/ManageReviewsPage')} />
        {renderLabel('Manage Reviews')}
      </Link>

      {/* Referrals */}
      <Link
        to="/Customer/ReferralsPage"
        style={subItemLinkStyle('/Customer/ReferralsPage', 0)}
      >
        <div style={bulletStyle(activeLink === '/Customer/ReferralsPage')} />
        {renderLabel('Referrals')}
      </Link>

      {/* Settings (folder) */}
      <div
        style={subItemContainerStyle('/Settings', 0)}
        onClick={toggleSettings}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={bulletStyle(
            activeLink.startsWith('/ecommerce/settings') ||
            activeLink.startsWith('/Settings/')
          )} />
          {renderLabel('Settings')}
        </div>
        {isSidebarCollapsed ? null : (isSettingsOpen ? <FaChevronDown /> : <FaChevronRight />)}
      </div>
      {isSettingsOpen && (
        <div>
          <Link
            to="/Settings/StoreDetailsPage"
            style={subItemLinkStyle('/Settings/StoreDetailsPage', 1)}
          >
            <div style={bulletStyle(activeLink === '/Settings/StoreDetailsPage')} />
            {renderLabel('Store Details')}
          </Link>
          <Link
            to="/Settings/PaymentsPage"
            style={subItemLinkStyle('/Settings/PaymentsPage', 1)}
          >
            <div style={bulletStyle(activeLink === '/Settings/PaymentsPage')} />
            {renderLabel('Payments')}
          </Link>
          <Link
            to="/Settings/CheckoutPage"
            style={subItemLinkStyle('/Settings/CheckoutPage', 1)}
          >
            <div style={bulletStyle(activeLink === '/Settings/CheckoutPage')} />
            {renderLabel('Checkout')}
          </Link>
          <Link
            to="/Settings/ShippingDeliveryPage"
            style={subItemLinkStyle('/Settings/ShippingDeliveryPage', 1)}
          >
            <div style={bulletStyle(activeLink === '/Settings/ShippingDeliveryPage')} />
            {renderLabel('Shipping & Delivery')}
          </Link>
          <Link
            to="/Settings/LocationsPage"
            style={subItemLinkStyle('/Settings/LocationsPage', 1)}
          >
            <div style={bulletStyle(activeLink === '/Settings/LocationsPage')} />
            {renderLabel('Locations')}
          </Link>
          <Link
            to="/Settings/StoreNotificationsPage"
            style={subItemLinkStyle('/Settings/StoreNotificationsPage', 1)}
          >
            <div style={bulletStyle(activeLink === '/Settings/StoreNotificationsPage')} />
            {renderLabel('Notifications')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
