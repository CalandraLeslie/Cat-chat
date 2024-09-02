import React, { useState, useEffect } from 'react';
import { getCurrentUser, getUserInfo, deleteUser } from '../services/Api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR = 'https://i.ibb.co/RvKq4CZ/catchat.jpg';

const Profile = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      fetchAdditionalUserInfo();
    } else {
      navigate('/');
    }
  }, [navigate]);

  const fetchAdditionalUserInfo = async () => {
    try {
      const userData = await getUserInfo();
      setUser(prevUser => ({ ...prevUser, ...userData }));
    } catch (error) {
      toast.error('Failed to load user information');
    }
  };

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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1>User Profile</h1>
      <img 
        src={user.avatar || DEFAULT_AVATAR} 
        alt="User Avatar" 
        className="cat-icon" 
        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR }}
      />
      <div className="auth-form">
        <div>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        <button onClick={handleDeleteAccount} className="submit-button delete-account-btn">Delete Account</button>
      </div>
    </div>
  );
};

export default Profile;