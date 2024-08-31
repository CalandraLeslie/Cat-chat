import React from 'react';
import { Link } from 'react-router-dom';

const Home = ({ user }) => {
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Welcome, {user.username}!</h1>
      <div className="user-info">
        <img src={user.avatar || 'https://i.pravatar.cc/200'} alt="User Avatar" className="user-avatar" />
        <p>Email: {user.email}</p>
        <p>User ID: {user.id}</p>
        <p>Bio: {user.bio || 'No bio yet.'}</p>
      </div>
      <div className="button-container">
        <Link to="/profile" className="nav-button">Edit Profile</Link>
        <Link to="/chat" className="nav-button">Chat</Link>
      </div>
    </div>
  );
};

export default Home;