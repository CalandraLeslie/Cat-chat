import React from 'react';
import { Link } from 'react-router-dom';

const Chat = () => {
  return (
    <div className="chat-container">
      <h1>Chat</h1>
      <div className="conversation-item">
        <Link to="/conversation/self">
          Chat with Yourself
        </Link>
      </div>
    </div>
  );
};

export default Chat;