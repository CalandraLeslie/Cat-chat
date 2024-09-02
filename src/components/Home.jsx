import React from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../services/Api';

const DEFAULT_AVATAR = 'https://i.ibb.co/RvKq4CZ/catchat.jpg';

const Home = () => {
  const user = getCurrentUser();

  return (
    <div className="container">
      <h1>Cat Chat</h1>
      {user && (
        <>
          <img src={user.avatar || DEFAULT_AVATAR} alt="User Avatar" className="cat-icon" onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR }} />
          <h2>{user.username}</h2>
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