import React, { useState, useEffect } from 'react';
import { registerUser, fetchCsrfToken } from '../services/Api';
import { toast } from 'react-toastify';

const DEFAULT_AVATAR = 'https://i.ibb.co/RvKq4CZ/catchat.jpg';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    avatar: ''
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
      const registrationData = {
        ...formData,
        avatar: formData.avatar || DEFAULT_AVATAR
      };
      await registerUser(registrationData);
      toast.success('Registration successful! Please log in.');
      onSwitchToLogin();
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message === 'Username or email already exists') {
        toast.error('Username or email already exists. Please choose a different username or email.');
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="container">
      <h1>Cat Chat</h1>
      <img src={DEFAULT_AVATAR} alt="Cat Chat Icon" className="cat-icon" />
      <div className="auth-form">
        <h2>Register</h2>
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
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="url"
            name="avatar"
            placeholder="Avatar URL (optional)"
            value={formData.avatar}
            onChange={handleChange}
          />
          <button type="submit" className="submit-button">
            Register
          </button>
        </form>
        <p>
          Already have an account?{' '}
          <span className="switch-form" onClick={onSwitchToLogin}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;