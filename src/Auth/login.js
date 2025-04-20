import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../context/loginContext';

const Login = () => {
  const { setIsLoggedIn } = useContext(LoginContext);
  const navigate = useNavigate();

  /* ---------- state ---------- */
  const [isLogin, setIsLogin]           = useState(true);

  // login
  const [loginEmail, setLoginEmail]     = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError]     = useState('');

  // signup
  const [signupName, setSignupName]     = useState('');
  const [signupEmail, setSignupEmail]   = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm]   = useState('');
  const [signupError, setSignupError]   = useState('');

  /* ---------- handlers ---------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const { data } = await axios.post(
        'http://localhost:3000/api/vendor/login',
        { email: loginEmail, password: loginPassword }
      );

      const { token, vendor_id, name, email } = data;
      localStorage.setItem('token',     token);
      localStorage.setItem('vendorId',  vendor_id);
      localStorage.setItem('name',      name);
      localStorage.setItem('email',     email);

      setIsLoggedIn(true);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err?.response?.data?.message || 'Invalid credentials');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');

    // very basic client‑side checks
    if (!signupEmail.includes('@')) {
      setSignupError('Enter a valid email.');
      return;
    }
    if (signupPassword.length < 8) {
      setSignupError('Password must be at least 8 characters.');
      return;
    }
    if (signupPassword !== signupConfirm) {
      setSignupError('Passwords do not match.');
      return;
    }

    try {
      const { data } = await axios.post(
        'http://localhost:3000/api/vendor/signup',
        { name: signupName, email: signupEmail, password: signupPassword }
      );

      // optional: log the user in immediately
      const { token, vendor_id, name, email } = data;
      localStorage.setItem('token',     token);
      localStorage.setItem('vendorId',  vendor_id);
      localStorage.setItem('name',      name);
      localStorage.setItem('email',     email);

      alert('Signup successful. You can now log in.');
      setIsLoggedIn(true);
      navigate('/dashboard');
    } catch (err) {
      setSignupError(err?.response?.data?.message || 'Signup failed.');
    }
  };

  /* ---------- render ---------- */
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
          <FormTitle>{isLogin ? 'Login' : 'Sign Up'}</FormTitle>

          {isLogin ? (
            /* ---------- LOGIN FORM ---------- */
            <form onSubmit={handleLogin}>
              <Input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />

              {loginError && <Error>{loginError}</Error>}

              <Button type="submit">Login</Button>
              <Toggle onClick={() => setIsLogin(false)}>
                Don’t have an account? Sign Up
              </Toggle>
            </form>
          ) : (
            /* ---------- SIGN‑UP FORM ---------- */
            <form onSubmit={handleSignup}>
              <Input
                type="text"
                placeholder="Name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={signupConfirm}
                onChange={(e) => setSignupConfirm(e.target.value)}
                required
              />

              {signupError && <Error>{signupError}</Error>}

              <Button type="submit">Register</Button>
              <Toggle onClick={() => setIsLogin(true)}>
                Already have an account? Login
              </Toggle>
            </form>
          )}
        </Right>
      </Card>
    </PageWrapper>
  );
};

export default Login;

/* ------------------------------ styled‑components ------------------------------ */

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
