import React, { useState, useEffect } from 'react';
import { login, fetchCsrfToken } from '../services/Api';
import { toast } from 'react-toastify';

const DEFAULT_AVATAR = 'https://i.ibb.co/RvKq4CZ/catchat.jpg';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  useEffect(() => {
    fetchCsrfToken().catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login(formData);
      // Remove console.log of the entire response
      toast.success('Login successful!');
      onLogin(response.user); // Only pass user data, not the entire response
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="container">
      <h1>Cat Chat</h1>
      <img src={DEFAULT_AVATAR} alt="Cat Chat Icon" className="cat-icon" />
      <div className="auth-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="submit-button">
            Login
          </button>
        </form>
        <p>
          Don't have an account?{' '}
          <span className="switch-form" onClick={onSwitchToRegister}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;