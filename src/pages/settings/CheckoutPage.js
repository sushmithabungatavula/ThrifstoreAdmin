import React, { useState } from 'react';
import './CheckoutPage.css';

function CheckoutPage() {
  // Toggles
  const [enableGuestCheckout, setEnableGuestCheckout] = useState(true);
  const [useMultiStep, setUseMultiStep] = useState(true);
  const [allowCoupons, setAllowCoupons] = useState(true);

  // Checkout Fields
  const [phoneRequired, setPhoneRequired] = useState(true);
  const [companyRequired, setCompanyRequired] = useState(false);
  const [enableGiftMessage, setEnableGiftMessage] = useState(false);

  // Review Page Settings
  const [showRecommended, setShowRecommended] = useState(true);
  const [displayCO2Offset, setDisplayCO2Offset] = useState(false);

  const handleSave = () => {
    alert('Checkout settings saved successfully!');
  };

  const handleCancel = () => {
    alert('Changes canceled.');
  };

  return (
    <div className="checkout-page">
      <h1>Checkout Settings</h1>

      {/* Checkout Flow Toggles */}
      <div className="card">
        <h2>Checkout Flow Toggles</h2>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={enableGuestCheckout}
              onChange={() => setEnableGuestCheckout(!enableGuestCheckout)}
            />
            Enable Guest Checkout?
          </label>
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={useMultiStep}
              onChange={() => setUseMultiStep(!useMultiStep)}
            />
            Use multi-step checkout?
          </label>
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={allowCoupons}
              onChange={() => setAllowCoupons(!allowCoupons)}
            />
            Allow Coupon Codes?
          </label>
        </div>
      </div>

      {/* Checkout Fields */}
      <div className="card">
        <h2>Checkout Fields</h2>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={phoneRequired}
              onChange={() => setPhoneRequired(!phoneRequired)}
            />
            Phone number required?
          </label>
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={companyRequired}
              onChange={() => setCompanyRequired(!companyRequired)}
            />
            Company name required?
          </label>
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={enableGiftMessage}
              onChange={() => setEnableGiftMessage(!enableGiftMessage)}
            />
            Enable "Gift Message" field?
          </label>
        </div>
      </div>

      {/* Review Page / Confirmation */}
      <div className="card">
        <h2>Review Page / Confirmation</h2>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={showRecommended}
              onChange={() => setShowRecommended(!showRecommended)}
            />
            Show recommended products?
          </label>
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={displayCO2Offset}
              onChange={() => setDisplayCO2Offset(!displayCO2Offset)}
            />
            Display CO2 offset option?
          </label>
        </div>
      </div>

      {/* Save / Cancel Buttons */}
      <div className="button-row">
        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
        <button className="cancel-btn" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default CheckoutPage;
