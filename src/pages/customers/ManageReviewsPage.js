import React, { useState } from 'react';
import './ManageReviewsPage.css';
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';

function ManageReviewsPage() {
  // --------------------
  // Mock Data
  // --------------------
  const [reviews] = useState([
    {
      id: 'rev1',
      reviewer: 'Jane G.',
      rating: 4.5,
      productName: 'Recycled Cotton Tote',
      datePosted: '2025-01-10',
      snippet:
        'Love this tote! It’s sturdy and made from recycled materials. Highly recommend!',
      status: 'Pending', // or "Published"/"Flagged"
      verifiedPurchase: true,
      fullText:
        'This tote exceeded my expectations. The fabric is surprisingly thick, yet soft. I’ve been using it daily and it still looks new.',
    },
    {
      id: 'rev2',
      reviewer: 'Anonymous',
      rating: 2,
      productName: 'Biodegradable Toothbrush',
      datePosted: '2025-01-08',
      snippet: 'It broke after a week. Might have been a bad batch.',
      status: 'Published',
      verifiedPurchase: false,
      fullText:
        'I appreciate the eco-friendly aspect, but the handle snapped pretty quickly. It might be a design flaw or just a bad unit.',
    },
    {
      id: 'rev3',
      reviewer: 'Leo D.',
      rating: 5,
      productName: 'Bamboo Cutlery Set',
      datePosted: '2025-01-02',
      snippet:
        'Great quality, easy to clean. Perfect for travel, helps reduce single-use plastics.',
      status: 'Pending',
      verifiedPurchase: true,
      fullText:
        'Absolutely love this cutlery set. I travel a lot and it’s super convenient. I’ve saved so many single-use plastic forks already!',
    },
  ]);

  // --------------------
  // UI State
  // --------------------
  const [activeTab, setActiveTab] = useState('Pending'); // "Pending", "Published", "Flagged"
  const [showFilters, setShowFilters] = useState(false);
  const [starRatingFilter, setStarRatingFilter] = useState(null); // 1..5 or null
  const [verifiedFilter, setVerifiedFilter] = useState('All'); // "All", "Verified", "Unverified"
  const [showModal, setShowModal] = useState(false);
  const [modalReview, setModalReview] = useState(null);

  // --------------------
  // Handlers
  // --------------------
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const handleStarFilter = (value) => {
    setStarRatingFilter(value);
  };

  const handleVerifiedFilter = (value) => {
    setVerifiedFilter(value);
  };

  const filterReviews = (review) => {
    // Filter by tab
    if (activeTab !== 'Flagged') {
      // If "Pending" or "Published," exclude "Flagged"
      if (review.status !== activeTab) return false;
    } else {
      // If flagged tab exists, filter those
      if (review.status !== 'Flagged') return false;
    }

    // Filter by star rating
    if (starRatingFilter && Math.floor(review.rating) !== starRatingFilter) {
      return false;
    }

    // Filter by verified/unverified
    if (verifiedFilter === 'Verified' && !review.verifiedPurchase) {
      return false;
    }
    if (verifiedFilter === 'Unverified' && review.verifiedPurchase) {
      return false;
    }

    return true;
  };

  const handleOpenModal = (review) => {
    setModalReview(review);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalReview(null);
  };

  // Approve / Reject logic
  const handleApprove = (reviewId) => {
    alert(`Review ${reviewId} approved!`);
  };
  const handleReject = (reviewId) => {
    alert(`Review ${reviewId} rejected!`);
  };
  const handleReply = (reviewId) => {
    alert(`Reply to review ${reviewId}... (open text box or handle inline)`);
  };

  // --------------------
  // Helpers
  // --------------------
  const renderStarRating = (rating) => {
    // Creates a series of star icons based on rating
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="star-icon" />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half-star" className="star-icon" />);
    }
    // Fill up to 5 with empty stars for a visual reference
    const totalRendered = fullStars + (hasHalfStar ? 1 : 0);
    for (let i = totalRendered; i < 5; i++) {
      stars.push(<FaRegStar key={`empty-star-${i}`} className="star-icon empty" />);
    }

    return <span className="rating-stars">{stars}</span>;
  };

  // Derived list of reviews based on filters
  const displayedReviews = reviews.filter(filterReviews);

  return (
    <div className="manage-reviews-page">
      {/* Page Header */}
      <div className="header">
        <h1>Manage Reviews</h1>
        <p className="subtitle">Approve, reject, and respond to product feedback.</p>
      </div>

      {/* Tabs + Filters */}
      <div className="tabs-filters-row">
        <div className="tabs">
          <button
            className={activeTab === 'Pending' ? 'tab active' : 'tab'}
            onClick={() => handleTabChange('Pending')}
          >
            Pending
          </button>
          <button
            className={activeTab === 'Published' ? 'tab active' : 'tab'}
            onClick={() => handleTabChange('Published')}
          >
            Published
          </button>
          {/* Optional Flagged Tab */}
          <button
            className={activeTab === 'Flagged' ? 'tab active' : 'tab'}
            onClick={() => handleTabChange('Flagged')}
          >
            Flagged
          </button>
        </div>
        <div className="filters">
          <button className="filter-btn" onClick={toggleFilters}>
            <FaFilter /> Filters {showFilters ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {showFilters && (
            <div className="filter-panel">
              {/* Star Rating Filter */}
              <div className="filter-group">
                <label>Star Rating</label>
                <div className="filter-stars">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <button
                      key={starValue}
                      className={
                        starRatingFilter === starValue ? 'star-filter active' : 'star-filter'
                      }
                      onClick={() =>
                        handleStarFilter(starRatingFilter === starValue ? null : starValue)
                      }
                    >
                      {starValue}★
                    </button>
                  ))}
                </div>
              </div>
              {/* Verified / Unverified */}
              <div className="filter-group">
                <label>Verified Purchase</label>
                <select
                  value={verifiedFilter}
                  onChange={(e) => handleVerifiedFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Verified">Verified Only</option>
                  <option value="Unverified">Unverified Only</option>
                </select>
              </div>
              {/* Date Range (example placeholder) */}
              <div className="filter-group">
                <label>Date Range</label>
                <div className="date-inputs">
                  <input type="date" />
                  <input type="date" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review List */}
      <div className="reviews-list">
        {displayedReviews.length === 0 ? (
          <p className="no-reviews">No reviews found for these filters.</p>
        ) : (
          displayedReviews.map((rev) => (
            <div key={rev.id} className="review-card">
              <div className="review-top-row">
                <span className="reviewer-name">{rev.reviewer}</span>
                {renderStarRating(rev.rating)}
              </div>
              <div className="review-meta">
                <span className="product-name" onClick={() => alert(`Open product: ${rev.productName}`)}>
                  {rev.productName}
                </span>
                <span className="review-date">{rev.datePosted}</span>
              </div>
              <p className="review-snippet">{rev.snippet}</p>
              <div className="review-actions">
                {rev.status === 'Pending' && (
                  <>
                    <button className="approve-btn" onClick={() => handleApprove(rev.id)}>
                      Approve
                    </button>
                    <button className="reject-btn" onClick={() => handleReject(rev.id)}>
                      Reject
                    </button>
                  </>
                )}
                <button className="reply-btn" onClick={() => handleReply(rev.id)}>
                  Reply
                </button>
                <button className="view-btn" onClick={() => handleOpenModal(rev)}>
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Analytics Widget (Optional) */}
      <div className="analytics-widget">
        <h2>Review Analytics</h2>
        <div className="analytics-grid">
          <div className="stat-card">
            <span className="stat-label">Average Rating</span>
            <span className="stat-value">4.2 ★</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Reviews</span>
            <span className="stat-value">312</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Reviews This Month</span>
            <span className="stat-value">34</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Most Reviewed Product</span>
            <span className="stat-value">“Bamboo Cutlery Set”</span>
          </div>
        </div>
      </div>

      {/* Modal for Review Detail */}
      {showModal && modalReview && (
        <div className="review-modal-overlay">
          <div className="review-modal">
            <h2>Review by {modalReview.reviewer}</h2>
            {renderStarRating(modalReview.rating)}
            <p>
              <strong>Product:</strong> {modalReview.productName}
            </p>
            <p>
              <strong>Date:</strong> {modalReview.datePosted}
            </p>
            <p>
              <strong>Verified Purchase:</strong>{' '}
              {modalReview.verifiedPurchase ? 'Yes' : 'No'}
            </p>
            <div className="modal-review-text">{modalReview.fullText}</div>
            {/* Approve/Reject if pending */}
            {modalReview.status === 'Pending' && (
              <div className="modal-actions">
                <button onClick={() => handleApprove(modalReview.id)}>Approve</button>
                <button onClick={() => handleReject(modalReview.id)}>Reject</button>
              </div>
            )}
            <button className="close-modal-btn" onClick={handleCloseModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageReviewsPage;
