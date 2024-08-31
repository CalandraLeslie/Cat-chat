import React, { useState, useEffect } from 'react';
import { getCurrentUser, getUserInfo, updateUserProfile, deleteUser } from '../services/Api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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
        bio: '',
      });
      fetchAdditionalUserInfo();
    } else {
      navigate('/login');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      setUser(prevUser => ({ ...prevUser, ...formData }));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
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
      {user.avatar && (
        <img 
          src={user.avatar} 
          alt="User Avatar" 
          className="profile-avatar" 
          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
        />
      )}
      <div className="profile-info">
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <p><strong>Username:</strong> {user.username}</p>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="avatar">Avatar URL:</label>
              <input
                type="url"
                id="avatar"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="bio">Bio:</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
              />
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
        ) : (
          <div>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Bio:</strong> {user.bio || 'No bio added yet.'}</p>
            <button onClick={() => setIsEditing(true)} className="btn btn-primary">Edit Profile</button>
          </div>
        )}
        <button onClick={handleDeleteAccount} className="btn btn-danger mt-3">Delete Account</button>
      </div>
    </div>
  );
};

export default Profile;