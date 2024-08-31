import React, { useState, useEffect } from 'react';
import { getUserInfo, updateUserProfile, deleteUser, getCurrentUser } from '../services/Api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: '',
    bio: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const userData = await getUserInfo();
      setUser(userData);
      setFormData({
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar,
        bio: userData.bio || '',
      });
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      toast.error('Failed to load user information');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      setUser(prevUser => ({ ...prevUser, ...formData }));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile: ' + error.toString());
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteUser();
        toast.success('Account deleted successfully.');
        navigate('/');
      } catch (error) {
        console.error('Failed to delete account:', error);
        toast.error('Failed to delete account: ' + error.toString());
      }
    }
  };

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="container">
      <h1>User Profile</h1>
      <img src={user.avatar} alt="User Avatar" className="cat-icon" />
      <div className="auth-form">
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
            <input
              type="url"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="Avatar URL"
            />
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Your bio"
              rows="4"
            />
            <button type="submit" className="submit-button">Save Changes</button>
            <button type="button" onClick={() => setIsEditing(false)} className="submit-button">Cancel</button>
          </form>
        ) : (
          <div>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Bio:</strong> {user.bio || 'No bio added yet.'}</p>
            <button onClick={() => setIsEditing(true)} className="submit-button">Edit Profile</button>
          </div>
        )}
        <button onClick={handleDeleteAccount} className="submit-button delete-account-btn">Delete Account</button>
      </div>
    </div>
  );
};

export default Profile;