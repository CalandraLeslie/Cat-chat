import React, { useState, useEffect } from 'react';
import { updateUserProfile } from '../services/Api';
import { toast } from 'react-toastify';

const Profile = ({ user, updateUser }) => {
  const [bio, setBio] = useState(user?.bio || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setBio(user?.bio || '');
  }, [user]);

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
      toast.success('Bio updated successfully!');
    } catch (error) {
      console.error('Failed to update bio:', error);
      toast.error('Failed to update bio: ' + error.toString());
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
          src={user.avatar || 'https://i.ibb.co/Dg5PvLx/rsz-icons8-cat-100.png'} 
          alt="User Avatar" 
          className="avatar"
          style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }}
        />
      </div>
      <p>Username: {user.username}</p>
      <p>Email: {user.email}</p>
      
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