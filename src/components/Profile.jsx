import React, { useState } from 'react';
import { updateUserProfile } from '../services/Api';

const Profile = ({ user, updateUser }) => {
  const [bio, setBio] = useState(user?.bio || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBioChange = (event) => {
    setBio(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const updatedUser = await updateUserProfile({ bio });
      updateUser({ ...user, bio });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update bio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="container profile">
      <h2>User Profile</h2>
      <div className="avatar-container">
        <img 
          src={user.avatar || 'https://i.pravatar.cc/200'} 
          alt="User Avatar" 
          className="avatar"
        />
      </div>
      <p>Username: {user.username}</p>
      <p>Email: {user.email}</p>
      <p>User ID: {user.id}</p>
      
      <div className="bio-section">
        <h3>Bio</h3>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <textarea 
              value={bio} 
              onChange={handleBioChange} 
              className="bio-input"
              rows="4"
            />
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Save Bio'}
            </button>
            <button type="button" className="submit-button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <>
            <p>{bio || 'No bio added yet.'}</p>
            <button onClick={() => setIsEditing(true)} className="submit-button">
              Edit Bio
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;