import React, { useState } from 'react';
import './StoreDetailsPage.css';
import { FaUpload } from 'react-icons/fa';

function StoreDetailsPage() {
  // Mock state for store details
  const [storeName, setStoreName] = useState('GreenEarth Store');
  const [tagline, setTagline] = useState('Eco-friendly products for a better tomorrow.');
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [aboutUs, setAboutUs] = useState(
    'We are committed to providing sustainable and eco-conscious products to our customers...'
  );
  const [supportEmail, setSupportEmail] = useState('support@greenearth.com');
  const [phoneNumber, setPhoneNumber] = useState('+1 (555) 123-4567');
  const [physicalAddress, setPhysicalAddress] = useState('123 Green Lane, Springfield, USA');
  const [socialLinks, setSocialLinks] = useState({
    facebook: 'facebook.com/greenearth',
    twitter: 'twitter.com/greenearth',
    instagram: 'instagram.com/greenearth',
  });
  const [ecoStatement, setEcoStatement] = useState(
    'Our commitment to sustainability is at the heart of our mission. We source our products from fair-trade and environmentally responsible suppliers...'
  );
  const [storePolicies, setStorePolicies] = useState({
    terms: 'http://greenearth.com/terms',
    privacy: 'http://greenearth.com/privacy',
    returns: 'http://greenearth.com/returns',
  });

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaviconFile(file);
    }
  };

  const handleSave = () => {
    // Save all changes to your back end or state
    alert('Store details saved successfully!');
  };

  const handleCancel = () => {
    // Revert changes or simply do nothing
    alert('Changes canceled.');
  };

  return (
    <div className="store-details-page">
      <h1>Store Details</h1>

      {/* Store Profile Card */}
      <div className="card">
        <h2>Store Profile</h2>
        <div className="form-group">
          <label htmlFor="storeName">Store Name</label>
          <input
            id="storeName"
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="tagline">Tagline (Optional)</label>
          <input
            id="tagline"
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </div>

        {/* Logo & Favicon */}
        <div className="upload-group">
          <div className="upload-item">
            <label>Store Logo</label>
            <div className="upload-box">
              <input type="file" id="logoUpload" onChange={handleLogoUpload} />
              <FaUpload className="upload-icon" />
              {logoFile ? <span>{logoFile.name}</span> : <span>Upload Logo</span>}
            </div>
          </div>
          <div className="upload-item">
            <label>Favicon (Optional)</label>
            <div className="upload-box">
              <input type="file" id="faviconUpload" onChange={handleFaviconUpload} />
              <FaUpload className="upload-icon" />
              {faviconFile ? <span>{faviconFile.name}</span> : <span>Upload Favicon</span>}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="aboutUs">About Us</label>
          <textarea
            id="aboutUs"
            rows="4"
            value={aboutUs}
            onChange={(e) => setAboutUs(e.target.value)}
          />
        </div>
      </div>

      {/* Contact Info Card */}
      <div className="card">
        <h2>Contact Information</h2>
        <div className="form-group">
          <label htmlFor="supportEmail">Support Email</label>
          <input
            id="supportEmail"
            type="text"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            id="phoneNumber"
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="physicalAddress">Physical Address</label>
          <input
            id="physicalAddress"
            type="text"
            value={physicalAddress}
            onChange={(e) => setPhysicalAddress(e.target.value)}
          />
        </div>
        <div className="form-group social-group">
          <label>Social Media Links</label>
          <div className="social-fields">
            <input
              placeholder="Facebook URL"
              value={socialLinks.facebook}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, facebook: e.target.value })
              }
            />
            <input
              placeholder="Twitter URL"
              value={socialLinks.twitter}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, twitter: e.target.value })
              }
            />
            <input
              placeholder="Instagram URL"
              value={socialLinks.instagram}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, instagram: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Eco Statement & Policies */}
      <div className="card">
        <h2>Eco-friendly Statement</h2>
        <div className="form-group">
          <label htmlFor="ecoStatement">Our Commitment to Sustainability</label>
          <textarea
            id="ecoStatement"
            rows="4"
            value={ecoStatement}
            onChange={(e) => setEcoStatement(e.target.value)}
          />
        </div>

        <h3>Store Policies</h3>
        <div className="form-group policy-group">
          <label>Terms & Conditions</label>
          <input
            type="text"
            placeholder="Link or text"
            value={storePolicies.terms}
            onChange={(e) =>
              setStorePolicies({ ...storePolicies, terms: e.target.value })
            }
          />
        </div>
        <div className="form-group policy-group">
          <label>Privacy Policy</label>
          <input
            type="text"
            placeholder="Link or text"
            value={storePolicies.privacy}
            onChange={(e) =>
              setStorePolicies({ ...storePolicies, privacy: e.target.value })
            }
          />
        </div>
        <div className="form-group policy-group">
          <label>Return Policy</label>
          <input
            type="text"
            placeholder="Link or text"
            value={storePolicies.returns}
            onChange={(e) =>
              setStorePolicies({ ...storePolicies, returns: e.target.value })
            }
          />
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

export default StoreDetailsPage;
