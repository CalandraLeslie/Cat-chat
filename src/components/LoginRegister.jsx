import React, { useState, useEffect } from 'react';
import { login, registerUser, fetchCsrfToken } from '../services/Api';
import '../App.css';

const LoginRegister = ({ onLogin }) => {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    avatar: ''
  });
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    fetchCsrfToken().catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLoginForm) {
        const response = await login({ username: formData.username, password: formData.password });
        console.log('Login successful:', response);
        onLogin();
      } else {
        const response = await registerUser(formData);
        console.log('Registration successful:', response);
        setIsLoginForm(true);
        setFormData({ username: '', password: '', email: '', avatar: '' });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    }
  };

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
    setFormData({ username: '', password: '', email: '', avatar: '' });
    setError('');
  };

  return (
    <div className="container">
      <h1>Cat Chat</h1>
      <img 
        src="./images/catchat.jpg" 
        alt="Cat Chat Icon" 
        className="cat-icon" 
        onLoad={() => {
          setImageLoaded(true);
          console.log('Image loaded successfully');
        }}
        onError={(e) => {
          console.error('Image failed to load', e);
          e.target.style.display = 'none';
        }}
        style={{ display: imageLoaded ? 'block' : 'none' }}
      />
      <div className="auth-form">
        <h2>{isLoginForm ? 'Login' : 'Register'}</h2>
        {error && <p className="error-message">{error}</p>}
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
          {!isLoginForm && (
            <>
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
                placeholder="Avatar URL"
                value={formData.avatar}
                onChange={handleChange}
              />
            </>
          )}
          <button type="submit" className="submit-button">
            {isLoginForm ? 'Login' : 'Register'}
          </button>
        </form>
        <p>
          {isLoginForm ? "Don't have an account? " : "Already have an account? "}
          <span className="switch-form" onClick={toggleForm}>
            {isLoginForm ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginRegister;