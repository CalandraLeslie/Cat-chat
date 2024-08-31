import React from 'react';
import { Link } from 'react-router-dom';

const SideNav = ({ onLogout }) => {
  return (
    <nav className="side-nav">
      <ul>
        <li><Link to="/profile">Profile</Link></li>
        <li><Link to="/chat">Chat</Link></li>
        <li><button onClick={onLogout}>Logout</button></li>
      </ul>
    </nav>
  );
};

export default SideNav;