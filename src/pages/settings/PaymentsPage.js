import React, { useState } from 'react';
import './PaymentsPage.css';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

function PaymentsPage() {
  // Mock Payment Gateways
  const [gateways, setGateways] = useState([
    { name: 'Stripe', enabled: true, configOpen: false },
    { name: 'PayPal', enabled: false, configOpen: false },
    { name: 'Bank Transfer', enabled: false, configOpen: false },
  ]);

  // Accepted Methods
  const [acceptCreditCards, setAcceptCreditCards] = useState(true);
  const [acceptDigitalWallets, setAcceptDigitalWallets] = useState(false);
  const [enableCOD, setEnableCOD] = useState(false);

  // Currency & Fees
  const [currency, setCurrency] = useState('USD');
  const [transactionFeePolicy, setTransactionFeePolicy] = useState('storeAbsorbs');

  const toggleGateway = (index) => {
    const updated = [...gateways];
    updated[index].enabled = !updated[index].enabled;
    setGateways(updated);
  };

  const toggleConfigOpen = (index) => {
    const updated = [...gateways];
    updated[index].configOpen = !updated[index].configOpen;
    setGateways(updated);
  };

  const handleSave = () => {
    alert('Payment settings saved successfully!');
  };

  const handleCancel = () => {
    alert('Changes canceled.');
  };

  return (
    <div className="payments-page">
      <h1>Payments</h1>
      {/* Payment Gateways List */}
      <div className="card">
        <h2>Payment Gateways</h2>
        {gateways.map((gw, index) => (
          <div key={gw.name} className="gateway-item">
            <div className="gateway-header">
              <div className="gateway-toggle">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={gw.enabled}
                    onChange={() => toggleGateway(index)}
                  />
                  <span className="slider round"></span>
                </label>
                <span className="gateway-name">{gw.name}</span>
              </div>
              <button
                className="config-btn"
                onClick={() => toggleConfigOpen(index)}
              >
                Configure {gw.configOpen ? <FaChevronDown /> : <FaChevronRight />}
              </button>
            </div>
            {gw.configOpen && (
              <div className="gateway-config">
                {/* Mock config fields */}
                <p>Enter your {gw.name} API credentials here:</p>
                <input type="text" placeholder={`${gw.name} API Key`} />
                <input type="text" placeholder={`${gw.name} Secret`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Accepted Methods / Additional Settings */}
      <div className="card">
        <h2>Accepted Methods & Additional Settings</h2>
        <div className="methods-row">
          <label>
            <input
              type="checkbox"
              checked={acceptCreditCards}
              onChange={() => setAcceptCreditCards(!acceptCreditCards)}
            />
            Accept Credit Cards
          </label>
          <label>
            <input
              type="checkbox"
              checked={acceptDigitalWallets}
              onChange={() => setAcceptDigitalWallets(!acceptDigitalWallets)}
            />
            Accept Digital Wallets (Apple Pay, Google Pay)
          </label>
          <label>
            <input
              type="checkbox"
              checked={enableCOD}
              onChange={() => setEnableCOD(!enableCOD)}
            />
            Enable Cash on Delivery (COD)
          </label>
        </div>
      </div>

      {/* Currency & Transaction Fees */}
      <div className="card">
        <h2>Currency & Fees</h2>
        <div className="form-group">
          <label htmlFor="currency">Default Currency</label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
        </div>
        <div className="form-group">
          <label>Transaction Fees</label>
          <div className="fee-options">
            <label>
              <input
                type="radio"
                name="feePolicy"
                value="storeAbsorbs"
                checked={transactionFeePolicy === 'storeAbsorbs'}
                onChange={(e) => setTransactionFeePolicy(e.target.value)}
              />
              Store absorbs transaction fees
            </label>
            <label>
              <input
                type="radio"
                name="feePolicy"
                value="passOn"
                checked={transactionFeePolicy === 'passOn'}
                onChange={(e) => setTransactionFeePolicy(e.target.value)}
              />
              Pass fees on to customers
            </label>
          </div>
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

export default PaymentsPage;
