import React, { useState, useEffect } from 'react';
import { getCurrentUser, getUserInfo, updateUserProfile, deleteUser } from '../services/Api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import catChatIcon from '../images/catchat.jpg';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    avatar: '',
    bio: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        email: currentUser.email || '',
        avatar: currentUser.avatar || '',
        bio: currentUser.bio || '',
      });
      fetchAdditionalUserInfo();
    } else {
      navigate('/');
    }
  }, [navigate]);

  const fetchAdditionalUserInfo = async () => {
    try {
      const userData = await getUserInfo();
      setUser(prevUser => ({ ...prevUser, ...userData }));
      setFormData(prevData => ({
        ...prevData,
        bio: userData.bio || '',
      }));
    } catch (error) {
      toast.error('Failed to load additional user information');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        email: formData.email,
        bio: formData.bio,
      };

      // Only include avatar in the update if it's not empty
      if (formData.avatar.trim() !== '') {
        updatedData.avatar = formData.avatar;
      }

      await updateUserProfile(updatedData);
      setUser(prevUser => ({ ...prevUser, ...updatedData }));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to current user data
    setFormData({
      email: user.email || '',
      avatar: user.avatar || '',
      bio: user.bio || '',
    });
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteUser();
        toast.success('Account deleted successfully.');
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
      <img src={user.avatar || catChatIcon} alt="User Avatar" className="cat-icon" />
      <div className="auth-form">
        {isEditing ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <p><strong>Username:</strong> {user.username}</p>
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
              placeholder="Avatar URL (optional)"
            />
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Your bio"
              rows="4"
            />
            <button type="submit" className="submit-button">Save Changes</button>
            <button type="button" className="submit-button" onClick={handleCancel}>Cancel</button>
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