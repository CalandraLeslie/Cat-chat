import React, { useState } from 'react';
import { updateUserProfile } from '../services/Api';

const Profile = ({ user, updateUser }) => {
  const [bio, setBio] = useState(user?.bio || '');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const handleBioChange = (e) => {
    setBio(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateUserProfile({ ...user, bio });
      updateUser(updatedUser);
      setIsEditing(false);
      setError('');
    } catch (error) {
      console.error('Error updating user profile:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  if (!user) {
    return <div className="container">Loading profile...</div>;
  }

  return (
    <div className="container">
      <h1>User Profile</h1>
      <img 
        src={user.avatar || 'https://via.placeholder.com/150'}
        alt="User Avatar" 
        className="user-avatar"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://via.placeholder.com/150';
        }}
      />
      <h2>{user.username}</h2>
      <p>Email: {user.email}</p>
      <p>User ID: {user.id}</p>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <textarea
            value={bio}
            onChange={handleBioChange}
            placeholder="Enter your bio"
            className="bio-input"
          />
          <button type="submit" className="submit-button">Save Bio</button>
          <button onClick={() => setIsEditing(false)} className="submit-button">Cancel</button>
        </form>
      ) : (
        <>
          <p>Bio: {bio || 'No bio yet'}</p>
          <button onClick={() => setIsEditing(true)} className="submit-button">Edit Bio</button>
        </>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Profile;