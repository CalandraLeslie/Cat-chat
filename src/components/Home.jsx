import React from 'react';
import { Link } from 'react-router-dom';
import catChatIcon from '../images/catchat.jpg';

const Home = ({ user }) => {
  return (
    <div className="container">
      <h1>Cat Chat</h1>
      <img src={catChatIcon} alt="Cat Chat Icon" className="cat-icon" />
      <div className="welcome-container">
        <h2>Welcome, {user ? user.username : 'Tyson'}!</h2>
        {user && user.avatar && (
          <img 
            src={user.avatar} 
            alt="User Avatar" 
            className="user-avatar"
          />
        )}
        <div className="button-container">
          <Link to="/profile" className="nav-button">Profile</Link>
          <Link to="/chat" className="nav-button">Chat</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;