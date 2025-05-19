import React from 'react';
import LoginForm from '../components/public/Loginform';
import { Link } from 'react-router-dom';

const LoginPage = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  }}>
    <LoginForm />
  </div>
);

export default LoginPage;