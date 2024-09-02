import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteUser } from '../services/Api';
import { toast } from 'react-toastify';

const SideNav = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteUser();
        toast.success('Account deleted successfully.');
        onLogout();
        navigate('/');
      } catch (error) {
        toast.error('Failed to delete account');
      }
    }
  };

  return (
    <nav className="side-nav">
      <ul>
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li><Link to="/chat">Chat</Link></li>
        <li><button onClick={onLogout}>Logout</button></li>
        <li><button onClick={handleDeleteAccount} className="delete-account-btn">Delete Account</button></li>
      </ul>
    </nav>
  );
};

export default SideNav;