import React, { useState, useEffect } from 'react';
import { getCurrentUser, getUserInfo } from '../services/Api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import catChatIcon from '../images/catchat.jpg';

const Profile = () => {
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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1>User Profile</h1>
      <img src={user.avatar || catChatIcon} alt="User Avatar" className="cat-icon" />
      <div className="auth-form">
        <div>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;