import React, { useState } from 'react';
import { login, registerUser } from '../services/Api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR = 'https://i.ibb.co/RvKq4CZ/catchat.jpg';

const LoginRegister = ({ onLogin }) => {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    avatar: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        console.log('Login response:', response);
        
        // Call the onLogin function passed from App component
        onLogin(response);

        toast.success('Login successful!');
        navigate('/chat');
      } else {
        const registrationData = {
          ...formData,
          avatar: formData.avatar || DEFAULT_AVATAR
        };
        await registerUser(registrationData);
        toast.success('Registration successful! Please log in.');
        setIsLoginForm(true);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      if (isLoginForm) {
        if (error.message === 'Invalid credentials') {
          setError('Invalid credentials. Please check your username and password.');
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        if (error.message.includes('already exists')) {
          setError('Username or email already exists');
        } else {
          setError(error.message);
        }
      }
      toast.error(error.message);
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
      <img src={DEFAULT_AVATAR} alt="Cat Chat Icon" className="cat-icon" />
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