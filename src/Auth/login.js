
import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../context/loginContext';

const Login = () => {
  const { setIsLoggedIn, setCartId } = useContext(LoginContext);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupError, setSignupError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await axios.post('https://your-backend.com/vendor/login', {
        name: loginName,
        email: loginEmail,
      });
      const { token, id, name, email } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('vendorId', id);
      localStorage.setItem('name', name);
      localStorage.setItem('email', email);
      setIsLoggedIn(true);
      navigate('/dashboard');
    } catch (err) {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');

    if (!signupEmail.includes('@')) {
      setSignupError('Enter a valid email.');
      return;
    }
    if (!/^[0-9]{10}$/.test(signupPhone)) {
      setSignupError('Enter a valid 10-digit phone number.');
      return;
    }

    try {
      const response = await axios.post('https://your-backend.com/vendor/signup', {
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
      });
      const { token, vendor_id, name, email } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('vendorId', vendor_id);
      localStorage.setItem('name', name);
      localStorage.setItem('email', email);
      alert('Signup successful. Please log in.');
      setIsLogin(true);
    } catch (err) {
      setSignupError('Signup failed. Try again.');
    }
  };

  return (
    <PageWrapper>
      <CenteredHeading>Thrift Store Admin</CenteredHeading>
      <Card>
        <Left>
          <LottieFrame
            src="https://lottie.host/embed/8809fafe-cc21-47b5-836a-1669f51d6a28/dTp473Dzg6.lottie"
            frameBorder="0"
            allowFullScreen
          />
        </Left>
        <Right>
          <FormTitle>{isLogin ? 'Login' : 'Sign Up'}</FormTitle>
          {isLogin ? (
            <form onSubmit={handleLogin}>
              <Input type="text" placeholder="Name" value={loginName} onChange={(e) => setLoginName(e.target.value)} required />
              <Input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              {loginError && <Error>{loginError}</Error>}
              <Button type="submit">Login</Button>
              <Toggle onClick={() => setIsLogin(false)}>Don’t have an account? Sign Up</Toggle>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <Input type="text" placeholder="Name" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
              <Input type="email" placeholder="Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
              <Input type="tel" placeholder="Phone Number" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} required />
              {signupError && <Error>{signupError}</Error>}
              <Button type="submit">Register</Button>
              <Toggle onClick={() => setIsLogin(true)}>Already have an account? Login</Toggle>
            </form>
          )}
        </Right>
      </Card>
    </PageWrapper>
  );
};

export default Login;

// STYLED COMPONENTS

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f5f5f5;
  min-height: 100vh;
  font-family: Arial, sans-serif;
  padding-top: 30px;
`;

const CenteredHeading = styled.h1`
  font-size: 3.2rem;
  font-weight: 900;
  margin-bottom: 30px;
  color: #222;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Card = styled.div`
  display: flex;
  width: 90%;
  max-width: 1100px;
  min-height: 600px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 0 24px rgba(0,0,0,0.1);
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Left = styled.div`
  flex: 1;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LottieFrame = styled.iframe`
  width: 100%;
  height: 100%;
  min-height: 400px;
  max-width: 500px;
  border: none;
`;

const Right = styled.div`
  flex: 1;
  max-width: 450px;
  padding: 40px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const FormTitle = styled.h2`
  text-align: center;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 30px;
  color: #222;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  font-size: 1rem;
  font-weight: bold;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
`;

const Error = styled.div`
  color: red;
  font-size: 0.9rem;
  margin-top: 10px;
`;

const Toggle = styled.div`
  text-align: center;
  margin-top: 18px;
  font-size: 0.95rem;
  color: #007bff;
  cursor: pointer;
`;