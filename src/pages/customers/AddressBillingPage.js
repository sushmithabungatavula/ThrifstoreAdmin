import React, { useState } from 'react';
import './AddressBillingPage.css';
import { FaEdit, FaTrash, FaCreditCard, FaCheckCircle, FaPlus } from 'react-icons/fa';

function AddressBillingPage() {
  // Mock shipping addresses
  const [shippingAddresses, setShippingAddresses] = useState([
    {
      id: 'addr1',
      name: 'Jane Goodall',
      street: '123 Green St.',
      city: 'London',
      state: 'Greater London',
      country: 'UK',
      postalCode: 'SW1A 1AA',
      isDefault: true,
    },
    {
      id: 'addr2',
      name: 'Jane Goodall',
      street: '456 Eco Lane',
      city: 'Bristol',
      state: 'Bristol County',
      country: 'UK',
      postalCode: 'BS1 5TR',
      isDefault: false,
    },
  ]);

  // Mock billing methods
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'card1',
      type: 'Credit Card',
      maskedNumber: '**** **** **** 1234',
      cardBrand: 'Visa',
      isDefault: true,
    },
    {
      id: 'paypal1',
      type: 'PayPal',
      accountEmail: 'jane.paypal@example.com',
      isDefault: false,
    },
  ]);

  // Mock billing history
  const [billingHistory] = useState([
    {
      invoiceId: 'INV-001',
      date: '2024-06-10',
      amount: '$120.00',
      link: '#', // can link to actual invoice page
    },
    {
      invoiceId: 'INV-002',
      date: '2024-07-15',
      amount: '$60.00',
      link: '#',
    },
    {
      invoiceId: 'INV-003',
      date: '2024-08-01',
      amount: '$75.00',
      link: '#',
    },
  ]);

  /**
   * Handlers
   */
  const handleEditAddress = (addressId) => {
    alert(`Editing address: ${addressId}`);
  };

  const handleToggleDefaultAddress = (addressId) => {
    setShippingAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      }))
    );
  };

  const handleRemoveAddress = (addressId) => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this address?'
    );
    if (confirmed) {
      setShippingAddresses((prev) => prev.filter((a) => a.id !== addressId));
    }
  };

  const handleAddNewAddress = () => {
    alert('Open modal or form to add new address');
  };

  const handleSetDefaultPayment = (methodId) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === methodId,
      }))
    );
  };

  const handleRemovePaymentMethod = (methodId) => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this payment method?'
    );
    if (confirmed) {
      setPaymentMethods((prev) => prev.filter((m) => m.id !== methodId));
    }
  };

  const handleAddPaymentMethod = () => {
    alert('Open modal or form to add a new payment method');
  };

  return (
    <div className="address-billing-page">
      <h1>Address & Billing</h1>
      <p className="subtitle">
        Manage shipping addresses, payment methods, and view your billing history.
      </p>

      {/* SHIPPING ADDRESSES */}
      <section className="shipping-addresses">
        <div className="section-header">
          <h2>Shipping Addresses</h2>
          <button className="add-btn" onClick={handleAddNewAddress}>
            <FaPlus /> Add New Address
          </button>
        </div>
        <div className="addresses-grid">
          {shippingAddresses.map((addr) => (
            <div
              key={addr.id}
              className={`address-card ${addr.isDefault ? 'default' : ''}`}
            >
              <div className="address-header">
                <h3>{addr.name}</h3>
                <div className="address-actions">
                  <button onClick={() => handleEditAddress(addr.id)}>
                    <FaEdit /> Edit
                  </button>
                  {!addr.isDefault && (
                    <button onClick={() => handleRemoveAddress(addr.id)}>
                      <FaTrash /> Remove
                    </button>
                  )}
                </div>
              </div>
              <p>{addr.street}</p>
              <p>
                {addr.city}, {addr.state}, {addr.country}
              </p>
              <p>{addr.postalCode}</p>
              <div className="default-toggle">
                {addr.isDefault ? (
                  <span className="default-label">
                    <FaCheckCircle /> Default
                  </span>
                ) : (
                  <button
                    className="set-default-btn"
                    onClick={() => handleToggleDefaultAddress(addr.id)}
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BILLING DETAILS */}
      <section className="billing-details">
        <div className="section-header">
          <h2>Payment Methods</h2>
          <button className="add-btn" onClick={handleAddPaymentMethod}>
            <FaPlus /> Add New Method
          </button>
        </div>
        <div className="methods-grid">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`method-card ${
                method.isDefault ? 'default-method' : ''
              }`}
            >
              <div className="method-info">
                {method.type === 'Credit Card' ? (
                  <>
                    <FaCreditCard className="method-icon" />
                    <div>
                      <p className="method-type">{method.cardBrand} Credit Card</p>
                      <p className="method-detail">{method.maskedNumber}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg"
                      alt="PayPal Logo"
                      className="paypal-logo"
                    />
                    <div>
                      <p className="method-type">{method.type}</p>
                      <p className="method-detail">{method.accountEmail}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="method-actions">
                {method.isDefault ? (
                  <span className="default-label">
                    <FaCheckCircle /> Default
                  </span>
                ) : (
                  <button
                    className="set-default-btn"
                    onClick={() => handleSetDefaultPayment(method.id)}
                  >
                    Set as Default
                  </button>
                )}
                <button
                  className="remove-method-btn"
                  onClick={() => handleRemovePaymentMethod(method.id)}
                >
                  <FaTrash /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BILLING HISTORY */}
      <section className="billing-history">
        <h2>Billing History</h2>
        <table className="billing-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {billingHistory.map((item) => (
              <tr key={item.invoiceId}>
                <td>{item.invoiceId}</td>
                <td>{item.date}</td>
                <td>{item.amount}</td>
                <td>
                  <a href={item.link} className="view-invoice-link">
                    View Invoice
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default AddressBillingPage;
