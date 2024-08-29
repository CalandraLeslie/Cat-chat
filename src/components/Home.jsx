import React from 'react';
import { Link } from 'react-router-dom';

const Home = ({ user }) => {
  return (
    <div className="home-container">
      {user && user.avatar && (
        <img 
          src={user.avatar} 
          alt="User Avatar" 
          className="user-avatar"
        />
      )}
      <h2>Welcome, {user ? user.username : 'Guest'}!</h2>
      <div className="button-container">
        <Link to="/profile" className="nav-button">Profile</Link>
        <Link to="/chat" className="nav-button">Chat</Link>
      </div>
    </div>
  );
};

export default Home;