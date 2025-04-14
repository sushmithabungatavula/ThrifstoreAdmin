import React, { useState } from 'react';
import './ReferralsPage.css';
import {
  FaCopy,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaDownload,
  FaArrowRight,
} from 'react-icons/fa';

function ReferralsPage() {
  // Mock data
  const [referralLink] = useState('https://yourstore.com?ref=seller123');
  const [stats] = useState({
    totalReferrals: 42,
    successfulOrders: 28,
    commissionEarned: '$210.00',
    nextPayoutDate: '2025-02-01',
    availableForWithdrawal: '$75.00',
  });
  const [referrals] = useState([
    {
      id: 'ref-001',
      name: 'Alice',
      email: 'alice@example.com',
      signUpDate: '2025-01-15',
      firstOrderStatus: 'Completed',
      commissionEarned: '$5.00',
    },
    {
      id: 'ref-002',
      name: 'Bob',
      email: 'bob@example.com',
      signUpDate: '2025-01-16',
      firstOrderStatus: 'Pending',
      commissionEarned: '$0.00',
    },
    {
      id: 'ref-003',
      name: 'Cindy',
      email: 'cindy@example.com',
      signUpDate: '2024-12-27',
      firstOrderStatus: 'Completed',
      commissionEarned: '$5.00',
    },
  ]);

  // Handler for copying link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert(`Referral link copied: ${referralLink}`);
  };

  const handleShareOnSocial = (platform) => {
    alert(`Share on ${platform}! Maybe open a new window or use a share API.`);
  };

  const handleWithdrawNow = () => {
    alert(`Withdrawing available commission: ${stats.availableForWithdrawal}`);
  };

  const handleExportReferrals = () => {
    alert('Exporting referral data to CSV...');
  };

  return (
    <div className="referrals-page">
      <h1>Referrals</h1>
      <p className="subtitle">
        Invite people to shop eco-friendly! Earn rewards or commission for every referral.
      </p>

      {/* Referral Link & Sharing */}
      <div className="referral-link-section">
        <div className="left-side">
          <p className="link-label">Your Referral Link</p>
          <div className="referral-link-box">
            <span className="ref-link">{referralLink}</span>
            <button className="copy-btn" onClick={handleCopyLink}>
              <FaCopy /> Copy
            </button>
          </div>
        </div>
        <div className="share-icons">
          <p>Share on:</p>
          <div className="icons-row">
            <button onClick={() => handleShareOnSocial('Facebook')}>
              <FaFacebook />
            </button>
            <button onClick={() => handleShareOnSocial('Twitter')}>
              <FaTwitter />
            </button>
            <button onClick={() => handleShareOnSocial('LinkedIn')}>
              <FaLinkedin />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="stats-overview">
        <div className="stat-card">
          <p className="stat-label">Total Referrals</p>
          <p className="stat-value">{stats.totalReferrals}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Successful Orders</p>
          <p className="stat-value">{stats.successfulOrders}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Commission Earned</p>
          <p className="stat-value">{stats.commissionEarned}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Next Payout Date</p>
          <p className="stat-value">{stats.nextPayoutDate}</p>
        </div>
      </div>

      {/* Optional: Payout Info */}
      <div className="payout-info">
        <p>
          <strong>Available for Withdrawal:</strong> {stats.availableForWithdrawal}
        </p>
        <button className="withdraw-btn" onClick={handleWithdrawNow}>
          Withdraw Now
        </button>
      </div>

      {/* Chart (Placeholder) */}
      <div className="referral-chart">
        <h2>Referral Growth</h2>
        <p className="chart-placeholder">
          [Insert chart library here or keep as placeholder]
        </p>
      </div>

      {/* Referrals Table */}
      <div className="referrals-table-section">
        <div className="referrals-table-header">
          <h2>Referred Users</h2>
          <div className="export-actions">
            <button className="export-btn" onClick={handleExportReferrals}>
              <FaDownload /> Export CSV
            </button>
            <button className="invite-btn" onClick={() => alert('Email invitation form/modal')}>
              <FaArrowRight /> Send Email Invitation
            </button>
          </div>
        </div>
        <table className="referrals-table">
          <thead>
            <tr>
              <th>Referred Name</th>
              <th>Email</th>
              <th>Sign-up Date</th>
              <th>Status</th>
              <th>Commission Earned</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((ref) => (
              <tr key={ref.id}>
                <td>{ref.name}</td>
                <td>{ref.email}</td>
                <td>{ref.signUpDate}</td>
                <td>{ref.firstOrderStatus}</td>
                <td>{ref.commissionEarned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReferralsPage;
