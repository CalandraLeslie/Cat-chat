import React, { useState, useEffect } from 'react';
import { getCurrentUser, getUserInfo, updateUserProfile, deleteUser } from '../services/Api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR = 'https://i.ibb.co/RvKq4CZ/catchat.jpg';

const Profile = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      fetchAdditionalUserInfo(currentUser.id);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const fetchAdditionalUserInfo = async (userId) => {
    try {
      const userData = await getUserInfo(userId);
      setUser(prevUser => ({ ...prevUser, ...userData }));
    } catch (error) {
      console.error('Failed to load user information:', error);
      toast.error('Failed to load user information');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(editedUser);
      setUser(editedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
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
        console.error('Failed to delete account:', error);
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
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              value={editedUser.username}
              onChange={handleChange}
              placeholder="Username"
            />
            <input
              type="email"
              name="email"
              value={editedUser.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <input
              type="url"
              name="avatar"
              value={editedUser.avatar}
              onChange={handleChange}
              placeholder="Avatar URL"
            />
            <button type="submit" className="submit-button">Save Changes</button>
            <button type="button" className="submit-button" onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
        ) : (
          <div>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <button onClick={handleEdit} className="submit-button">Edit Profile</button>
          </div>
        )}
        <button onClick={handleDeleteAccount} className="submit-button delete-account-btn">Delete Account</button>
      </div>
    </div>
  );
};

export default Profile;