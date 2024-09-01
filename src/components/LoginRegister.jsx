import React, { useState, useEffect } from 'react';
import { login, registerUser, fetchCsrfToken } from '../services/Api';
import { toast } from 'react-toastify';
import catChatIcon from '../images/catchat.jpg';

const LoginRegister = ({ onLogin }) => {
  const [isLoginForm, setIsLoginForm] = useState(true);
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
      let response;
      if (isLoginForm) {
        response = await login({ username: formData.username, password: formData.password });
        console.log('Login response:', response);
        toast.success('Login successful!');
        onLogin(response);
      } else {
        const registrationData = {
          ...formData,
          avatar: formData.avatar || catChatIcon // Use catChatIcon if no avatar is provided
        };
        response = await registerUser(registrationData);
        console.log('Registration response:', response);
        toast.success('Registration successful! You are now logged in.');
        // Log in the user immediately after successful registration
        const loginResponse = await login({ username: formData.username, password: formData.password });
        onLogin(loginResponse);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      if (isLoginForm) {
        toast.error('We have no user under this name');
      } else {
        if (error.message.includes('already exists')) {
          toast.error('User already exists');
        } else {
          toast.error(error.message);
        }
      }
    }
  };

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
    setFormData({ username: '', password: '', email: '', avatar: '' });
  };

  return (
    <div className="container">
      <h1>Cat Chat</h1>
      <img src={catChatIcon} alt="Cat Chat Icon" className="cat-icon" />
      <div className="auth-form">
        <h2>{isLoginForm ? 'Login' : 'Register'}</h2>
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
                placeholder="Avatar URL (optional)"
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