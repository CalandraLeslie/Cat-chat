import React from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../services/Api';

const Home = () => {
  const user = getCurrentUser();

  return (
    <div className="container">
      <h1>Welcome to Cat Chat</h1>
      {user && (
        <>
          <img src={user.avatar} alt="User Avatar" className="cat-icon" />
          <h2>Hello, {user.username}!</h2>
        </>
      )}
      <div className="auth-form">
        <Link to="/profile" className="submit-button">Profile</Link>
        <Link to="/chat" className="submit-button">Chat</Link>
      </div>
    </div>
  );
};

export default Home;