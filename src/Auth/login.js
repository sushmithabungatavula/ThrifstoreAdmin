import React, { useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { LoginContext } from '../context/loginContext';

import Spline from '@splinetool/react-spline';
import styled, { keyframes } from 'styled-components';

// ===== KEYFRAMES FOR BACKGROUND GRADIENT ANIMATION =====
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// ===== STYLED COMPONENTS =====

// 1) Outer Container with Animated Gradient
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  margin: 0;
  overflow: hidden;
  background: linear-gradient(-45deg, #f1f8e9, #d1c4e9, #ffcdd2, #e1bee7);
  background-size: 400% 400%;
  animation: ${gradientAnimation} 18s ease infinite;
  font-family: 'Arial, sans-serif';
`;



// 3) Main Content where we’ll slide between Login and Sign Up
const MainContent = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden; /* hides the panels sliding out */
`;

/**
 * Both sections (LoginSection and SignUpSection) remain in the DOM.
 * We shift them using `transform: translateX(...)` to show/hide them.
 * We'll use a fancy cubic-bezier for a smooth ease:
 * e.g., transition: transform 0.8s cubic-bezier(0.77, 0, 0.175, 1);
 */

// 4) LoginSection
const LoginSection = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;

  /* Slide left when showSignUp = true */
  transform: ${({ showSignUp }) =>
    showSignUp ? 'translateX(-100%)' : 'translateX(0)'};
  transition: transform 0.8s cubic-bezier(0.77, 0, 0.175, 1);
`;

// 5) SignUpSection
const SignUpSection = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;

  /* Start off to the right, slide in when showSignUp = true */
  transform: ${({ showSignUp }) =>
    showSignUp ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.8s cubic-bezier(0.77, 0, 0.175, 1);
`;

// 6) Left Panel (inside the login section) for Spline
const LeftPanel = styled.div`
  flex: 0.45;
  overflow: hidden;
  position: relative;
  color: #fff;
`;

// Spline container with hover scale
const SplineContainer = styled.div`
  width: 100%;
  height: 120%;
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(1.02);
  }
`;

// 7) Right side (Login Card)
const LoginRightSide = styled.div`
  flex: 0.55;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 0 20px;
`;

// 8) Base Card used for both login & sign up forms
const CardBase = styled.div`
  width: 100%;
  max-width: ${({ isSignUp }) => (isSignUp ? '1200px' : '480px')}; /* Larger for Sign-Up */
  background-color: rgba(255, 255, 255, 0.6); 
  backdrop-filter: blur(16px); 
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 30px;
  margin: 0 auto;
  overflow-y: auto;
  max-height: 85vh;

  display: flex;
  flex-direction: column;
`;

// 9) Sign-Up Wrapper
const SignUpWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 20px;
`;

// ====== Tab Navigation ======
const TabNavigation = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #ccc;
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 10px 30px;
  margin: 0 10px;
  font-size: 1.2rem;
  cursor: pointer;
  border-bottom: ${({ active }) => (active ? '4px solid #a5ff84' : 'none')};
  color: ${({ active }) => (active ? '#2d2d2d' : '#777')};
  transition: color 0.3s ease, border-bottom 0.3s ease;

  &:hover {
    color: #2d2d2d;
  }
`;

// ====== Reusable Form Elements ======
const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  color: #444;
`;

const Input = styled.input`
  width: 100%;
  margin-bottom: 10px;
  padding: 12px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 0.9rem;
  background-color: #fdfdfd;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #a5ff84;
    outline: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  margin-bottom: 10px;
  padding: 12px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 0.9rem;
  background-color: #fdfdfd;
  transition: border-color 0.3s ease;
  resize: vertical;

  &:focus {
    border-color: #a5ff84;
    outline: none;
  }
`;

const Select = styled.select`
  width: 100%;
  margin-bottom: 10px;
  padding: 12px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 0.9rem;
  background-color: #fdfdfd;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #a5ff84;
    outline: none;
  }
`;

const Error = styled.div`
  color: red;
  margin-bottom: 10px;
  font-size: 0.85rem;
`;

const Success = styled.div`
  color: green;
  margin-bottom: 10px;
  font-size: 0.85rem;
`;

const Button = styled.button`
  background-color: #a5ff84;
  border: none;
  border-radius: 6px;
  padding: 14px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  width: 100%;
  margin-top: 10px;
  font-weight: 600;

  &:hover {
    background-color: #8de572;
  }

  &:disabled {
    background-color: #a5ff84;
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ToggleLink = styled.div`
  margin-top: 15px;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  text-align: center;
  &:hover {
    color: #555;
  }
`;

// Sign-Up Form with Enhanced Grid Layout
const SignUpFormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two equal columns */
  column-gap: 25px;
  row-gap: 15px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    column-gap: 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    column-gap: 0;
  }
`;

// Full-Width Element
const FullWidth = styled.div`
  grid-column: 1 / -1; /* Span from the first to the last column */

  @media (max-width: 768px) {
    grid-column: 1 / -1; 
  }
`;

// ====== Loading Spinner ======
const Spinner = styled.div`
  border: 4px solid rgba(0,0,0,0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #a5ff84;
  animation: spin 1s linear infinite;
  margin: 0 auto;
  margin-top: 20px;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Keyframes for typing and deleting effect
const typingLoop = keyframes`
  0% {
    width: 0;
    border-right-color: #28a745; /* Green cursor */
  }
  12.5%, 56.25% {
    width: 6ch; /* Width for "Recycler" (8 characters) */
    border-right-color: #28a745; /* Green cursor */
  }
  62.5%, 100% {
    width: 6ch;
    border-right-color: transparent;
  }
`;


// 2) Brand Title Wrapper
const BrandTitleWrapper = styled.div`
  text-align: center;
  padding: 20px 0 10px;
`;

// Brand Title with Typing Animation
const BrandTitle = styled.h1`
  color: #2d2d2d;
  font-size: 5rem;
  font-weight: bold;
  margin: 0;
  cursor: default;
  text-shadow: 2px 2px 6px rgba(0,0,0,0.2);
  transition: transform 0.4s ease;
  display: flex;
  align-items: center; /* Vertically centers the text */
  justify-content: center; /* Horizontally centers the text */

  &:hover {
    transform: scale(1.06);
  }
`;

// Typewriter Span for "Recycler"
const TypewriterSpan = styled.span`
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  width: 0;
  border-right: 2px solid #28a745; /* Green cursor */
  color: #28a745; /* Green text */
  animation: 
    ${typingLoop} 8s steps(8) infinite; /* Increased duration and steps for slower, character-by-character animation */
  margin-left: 5px; /* Adds space between "GreenCycle" and "Recycler" */

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    width: auto;
    border-right: none;
    color: #28a745; /* Ensure text remains green even when animation is off */
  }
`;



// ====== COMPONENT =====
const Login = () => {
  const navigate = useNavigate();
  // If you have a context method to do full login with tokens, etc. use it
  // For now, let's just use setIsLoggedIn for demonstration:
  const { setIsLoggedIn } = useContext(LoginContext) || { setIsLoggedIn: () => {} };

  const [showSignUp, setShowSignUp] = useState(false);

  const [activeTab, setActiveTab] = useState('vendor'); 

  // =======================
  //        LOGIN STATE
  // =======================
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [otpRequested, setOtpRequested] = useState(false);
const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
const [isSendingOtp, setIsSendingOtp] = useState(false);
const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
const codeInputRefs = useRef([]);
  const [phoneNumber, setPhoneNumber] = useState('');


  const [vendorFormData, setVendorFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [vendorSignupError, setVendorSignupError] = useState('');
  const [vendorSignupSuccess, setVendorSignupSuccess] = useState(false);
  const [vendorSignupLoading, setVendorSignupLoading] = useState(false);
  
  // ----- Handler for controlling vendor form inputs -----
  const handleVendorChange = (e) => {
    const { name, value } = e.target;
    setVendorFormData({ ...vendorFormData, [name]: value });
  };

  

  // ----- Submit vendor sign-up -----
const handleVendorSignUp = async (e) => {
  e.preventDefault();
  setVendorSignupError('');
  setVendorSignupSuccess(false);
  setVendorSignupLoading(true);

  try {
    // Prepare the payload
    const payload = {
      name: vendorFormData.name,
      email: vendorFormData.email,
      phone: vendorFormData.phone,
      address: vendorFormData.address
    };

    // Make the API call to register vendor
    const response = await axios.post('https://thriftstorebackend-8xii.onrender.com/api/vendor/signup', payload);

    if (response.status === 201) {
      setVendorSignupSuccess(true);
      // Optionally, log the vendor in immediately by storing the token
      const { token } = response.data;
      // Save token to localStorage or context
      localStorage.setItem('token', token);
      // Optionally, redirect to the vendor dashboard
      navigate('/vendor-dashboard');
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      setVendorSignupError(error.response.data.message);
    } else {
      setVendorSignupError('An unexpected error occurred.');
    }
  } finally {
    setVendorSignupLoading(false);
  }
};



// In startVerify function, remove the +1 concatenation
const startVerify = async (phoneNumber) => {
  try {
    const response = await axios.post('https://thriftstorebackend-8xii.onrender.com/twilio/start-verify', {
      to: phoneNumber, // Use the number as entered by user
      channel: 'sms',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const checkVerify = async (phoneNumber, code) => {
  try {
    const response = await axios.post('https://thriftstorebackend-8xii.onrender.com/twilio/check-verify', {
      to: phoneNumber, // Remove manual +1 concatenation
      code: code.join(''),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const handleOtpChange = (text, index) => {
  if (/^\d$/.test(text) || text === '') {
    const newCode = [...otpCode];
    newCode[index] = text;
    setOtpCode(newCode);

    if (text !== '' && index < 5) {
      codeInputRefs.current[index + 1].focus();
    } else if (text === '' && index > 0) {
      codeInputRefs.current[index - 1].focus();
    }
  }
};


const handleLogin = async (e) => {
  e.preventDefault();
  setLoginError('');
  setIsSendingOtp(true);

  try {
    // Validate E.164 format
    if (!/^\+1\d{10}$/.test(phoneNumber)) {
      throw new Error('Invalid format. Use +1 followed by 10 digits');
    }

    const verifyResponse = await startVerify(phoneNumber);
    if (verifyResponse.success) {
      setOtpRequested(true);
    }
  } catch (error) {
    setLoginError(error.response?.data?.message || error.message);
  } finally {
    setIsSendingOtp(false);
  }
};



// const handleLogin = async (e) => {
//   e.preventDefault();
//   setLoginError('');
//   setLoginLoading(true);

//   try {
//     const payload = {
//       name: loginName.trim(),  
//       email: loginEmail.trim(),  
//     };

//     // Send request to login endpoint
//     const response = await axios.post('https://thriftstorebackend-8xii.onrender.com/api/vendor/login', payload);

//     // Check if login was successful
//     if (response.status === 200) {
//       const { token, id, name, email } = response.data;

//       // Store token and user info in localStorage
//       localStorage.setItem('token', token);
//       localStorage.setItem('vendorId', id);
//       localStorage.setItem('name', name);  // Save name
//       localStorage.setItem('email', email);

//       setIsLoggedIn(true);
//       navigate('/dashboard');
//     }
//   } catch (err) {
//     // Log the actual error to understand what's happening
//     console.error('Login error:', err);

//     if (err.response && err.response.data && err.response.data.message) {
//       setLoginError(err.response.data.message);
//     } else {
//       setLoginError('An unexpected error occurred.');
//     }
//   } finally {
//     setLoginLoading(false);
//   }
// };



const handleOtpVerification = async (e) => {
  e.preventDefault();
  setLoginError('');
  setIsVerifyingOtp(true);

  try {
    // Verify OTP first
    const verifyResult = await checkVerify(phoneNumber, otpCode);
    if (!verifyResult.success) {
      throw new Error('Invalid OTP');
    }
      const payload = {
        name: loginName.trim(),  
        email: loginEmail.trim(),  
      };
      console.log('payload...',payload);
      // Send request to login endpoint
      const response = await axios.post('https://thriftstorebackend-8xii.onrender.com/api/vendor/login', payload);
  
      // Check if login was successful
      if (response.status === 200) {
        const { token, id, name, email } = response.data;
        // Store token and user info in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('vendorId', id);
        localStorage.setItem('name', name);  // Save name
        localStorage.setItem('email', email);

        setIsLoggedIn(true);
        navigate('/dashboard');
      };
} catch (error) {
    setLoginError(error.response?.data?.message || error.message);
  } finally {
    setIsVerifyingOtp(false);
  }
};


  // =======================
  //     SIGNUP: USER
  // (Based on your updated needs)
  // =======================
  const [userFormData, setUserFormData] = useState({
    // Removed userID, profile, experience, salary, status, hireDate, lastLogin
    name: '',
    username: '',
    password: '',
    email: '',
    identificationNumber: '',
    age: '',
    address: '',
    phone: '',
    role: 'staff', 
    associatedSeller: '',
  });
  const [userSignupError, setUserSignupError] = useState('');
  const [userSignupSuccess, setUserSignupSuccess] = useState(false);
  const [userSignupLoading, setUserSignupLoading] = useState(false);

  // ----- Handler for controlling user form inputs -----
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  // ----- Submit user sign-up -----
  const handleUserSignUp = (e) => {
    e.preventDefault();
    setUserSignupError('');
    setUserSignupSuccess(false);
    setUserSignupLoading(true);

    // In practice, do a fetch to your API:
    console.log('User signup data:', userFormData);
    // Just simulating success:
    setTimeout(() => {
      setUserSignupSuccess(true);
      setUserSignupLoading(false);
    }, 1000);
  };

  // =======================
  //    SIGNUP: SELLER
  // (With username/password/role=admin for the created admin user)
  // =======================
  const [sellerFormData, setSellerFormData] = useState({
    // Removed sellerID, logoUrl, social links, store policies
    // Added username, password, role=admin
    name: '',
    email: '',
    phone: '',
    tagline: '',
    faviconUrl: '',  // Not explicitly removed
    aboutUs: '',
    supportEmail: '',
    physicalAddress: '',
    ecoStatement: '',
    paymentGateways: [], 
    acceptCreditCards: false,
    acceptDigitalWallets: false,
    enableCOD: false,
    currency: 'USD',
    transactionFeePolicy: 'storeAbsorbs',
    shippingZones: '',
    locationLng: '',
    locationLat: '',
    address: '',
    registrationDate: '',
    status: 'active',
    averageDeliveryTime: '',
    returnPolicy: '',
    remarks: '',
    sellerTags: '',
    salesVolume: 0,
    revenue: 0,
    returnRate: 0,
    customerRatings: 0,
    customerComplaints: 0,
    productViews: 0,
    conversionRate: 0,
    stockLevels: 0,
    orderProcessingTime: 0,
    shippingTime: 0,
    fulfillmentAccuracy: 0,
    commissionEarned: 0,
    payoutTimelines: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    averageOrderValue: 0,
    returnOnInvestment: 0,
    certifications: '',
    complianceStatus: '',

    // Admin user info for seller
    username: '',
    password: '',
    role: 'admin', 
  });
  const [sellerSignupError, setSellerSignupError] = useState('');
  const [sellerSignupSuccess, setSellerSignupSuccess] = useState(false);
  const [sellerSignupLoading, setSellerSignupLoading] = useState(false);

  // ----- Handler for controlling seller form inputs -----
  const handleSellerChange = (e) => {
    const { name, value } = e.target;
    setSellerFormData({ ...sellerFormData, [name]: value });
  };

 

  return (
    <Container>
      {/* BRAND TITLE */}
      <BrandTitleWrapper>
            <BrandTitle>
                  ThriftStore
                  <TypewriterSpan>Vendor</TypewriterSpan>
            </BrandTitle>
      </BrandTitleWrapper>

      {/* MAIN CONTENT: holds both login & sign up sections */}
      <MainContent>
        {/* LOGIN SECTION */}
        <LoginSection showSignUp={showSignUp}>

          {/* RIGHT SIDE (Login Card) */}
          <LoginRightSide>
          <CardBase isSignUp={false}>
  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
    <h2 style={{ margin: 0 }}>Login</h2>
  </div>

  {loginError && <Error>{loginError}</Error>}

  <form onSubmit={otpRequested ? handleOtpVerification : handleLogin}>
    {!otpRequested ? (
      <>
        <Label htmlFor="loginName">Name</Label>
        <Input
          id="loginName"
          type="text"
          value={loginName}
          onChange={(e) => setLoginName(e.target.value)}
          required
          placeholder="Enter your name"
        />

        <Label htmlFor="loginEmail">Email</Label>
        <Input
          id="loginEmail"
          type="email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />

<Label htmlFor="phoneNumber">Phone Number</Label>
<Input
  id="phoneNumber"
  type="tel"
  value={phoneNumber}
  onChange={(e) => {
    // Enforce E.164 format with +1 prefix
    const val = e.target.value.replace(/[^\d]/g, '');
    if (val.startsWith('1')) {
      setPhoneNumber(`+${val}`);
    } else if (val.length > 0) {
      setPhoneNumber(`+1${val}`);
    } else {
      setPhoneNumber('');
    }
  }}
  required
  placeholder="+1XXXXXXXXXX"
/>

        <Button type="submit" disabled={isSendingOtp}>
          {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      </>
    ) : (
      <>
        <div style={{ marginBottom: '20px' }}>
          <p>Enter OTP sent to {phoneNumber}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
            {otpCode.map((digit, index) => (
              <Input
                key={index}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                maxLength="1"
                style={{ width: '40px', textAlign: 'center' }}
                ref={(el) => (codeInputRefs.current[index] = el)}
              />
            ))}
          </div>
        </div>

        <Button type="submit" disabled={isVerifyingOtp}>
          {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
        </Button>
        
        <ToggleLink onClick={() => setOtpRequested(false)}>
          Resend OTP
        </ToggleLink>
      </>
    )}

    {!otpRequested && (
      <ToggleLink onClick={() => setShowSignUp(true)}>
        Don’t have an account? Sign Up
      </ToggleLink>
    )}
  </form>
</CardBase>
          </LoginRightSide>
        </LoginSection>

        {/* SIGN-UP SECTION */}
        <SignUpSection showSignUp={showSignUp}>
          <SignUpWrapper>
            <CardBase isSignUp={true}>
              {/* Tab Navigation */}
              <TabNavigation>
                <Tab
                  active={activeTab === 'vendor'}
                  onClick={() => setActiveTab('vendor')}
                >
                  vendor
                </Tab>
              </TabNavigation>

              {/* User Sign-Up */}
                {activeTab === 'vendor' && (
                  <>
                    {userSignupError && <Error>{userSignupError}</Error>}
                    {userSignupSuccess && (
                      <Success>Vendor registered successfully!</Success>
                    )}
                    <form onSubmit={handleVendorSignUp}>
                      <SignUpFormGrid>
                        <div>
                          <Label>Name</Label>
                          <Input
                            name="name"
                            value={vendorFormData.name}
                            onChange={handleVendorChange}
                            placeholder="Store Name"
                            required
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            name="email"
                            value={vendorFormData.email}
                            onChange={handleVendorChange}
                            placeholder="Email address"
                            required
                          />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input
                            name="phone"
                            value={vendorFormData.phone}
                            onChange={handleVendorChange}
                            placeholder="Contact number"
                            required
                          />
                        </div>
                        <div>
                          <Label>Address</Label>
                          <Input
                            name="address"
                            value={vendorFormData.address}
                            onChange={handleVendorChange}
                            placeholder="Store address"
                            required
                          />
                        </div>
                        <FullWidth>
                          <Button type="submit" disabled={vendorSignupLoading}>
                            {vendorSignupLoading ? 'Registering...' : 'Register Vendor'}
                          </Button>
                        </FullWidth>
                      </SignUpFormGrid>
                    </form>
                    {vendorSignupLoading && <Spinner />}
                  </>
                )}


              {/* Toggle back to Login */}
              <ToggleLink onClick={() => setShowSignUp(false)}>
                Already have an account? Log In
              </ToggleLink>
            </CardBase>
          </SignUpWrapper>
        </SignUpSection>
      </MainContent>
    </Container>
  );
};

export default Login;
