import React from 'react';

const Profile = ({ user }) => {
  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile">
      <h2>User Profile</h2>
      <div className="avatar-container">
        <img 
          src={user.avatar || 'https://ibb.co/fFwbBJH'} 
          alt="User Avatar" 
          className="avatar"
          style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }}
        />
      </div>
      <p>Username: {user.username}</p>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default Profile;