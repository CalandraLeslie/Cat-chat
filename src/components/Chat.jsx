import React, { useState, useEffect, useCallback } from 'react';
import { createMessage, deleteMessage, getCurrentUser, isAuthenticated, getAllMessages, getUserById } from '../services/Api';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';
import DOMPurify from 'dompurify';

const DEFAULT_AVATAR = 'https://i.ibb.co/RvKq4CZ/catchat.jpg';
const SYNC_INTERVAL = 5000; // 5 seconds

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [usernames, setUsernames] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  const fetchUsername = useCallback(async (userId) => {
    try {
      const userData = await getUserById(userId);
      return userData[0].username;
    } catch (error) {
      return 'Unknown User';
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!isLoggedIn) {
      setMessages([]);
      setUsernames({});
      return;
    }

    try {
      const fetchedMessages = await getAllMessages();
      setMessages(fetchedMessages);

      const userIds = [...new Set(fetchedMessages.map(msg => msg.userId))];
      const usernamePromises = userIds.map(async id => {
        if (!usernames[id]) {
          const username = await fetchUsername(id);
          return { id, username };
        }
        return null;
      });
      
      const newUsernames = await Promise.all(usernamePromises);
      setUsernames(prevUsernames => ({
        ...prevUsernames,
        ...Object.fromEntries(newUsernames.filter(Boolean).map(({ id, username }) => [id, username]))
      }));
    } catch (err) {
      if (err.message === 'Authentication failed. Please log in again.') {
        setIsLoggedIn(false);
        setMessages([]);
        setUsernames({});
        toast.error('Your session has expired. Please log in again.');
      } else {
        toast.error('Failed to fetch messages or usernames. Please try again.');
      }
    }
  }, [usernames, isLoggedIn, fetchUsername]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      if (authenticated) {
        const user = getCurrentUser();
        setCurrentUser(user);
        await fetchMessages();
      } else {
        setCurrentUser(null);
        setMessages([]);
        setUsernames({});
      }
    };

    checkAuthAndFetch();

    const intervalId = setInterval(checkAuthAndFetch, SYNC_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isLoggedIn) return;

    try {
      const sanitizedMessage = DOMPurify.sanitize(newMessage);
      const messageData = {
        content: sanitizedMessage,
        conversationId: '550e8400-e29b-41d4-a716-146655440000'
      };
      await createMessage(messageData);
      await fetchMessages();
      setNewMessage('');
    } catch (err) {
      toast.error(err.message || 'Failed to send message. Please try again.');
    }
  };

  const handleDelete = async (msgId) => {
    if (!isLoggedIn) return;

    try {
      await deleteMessage(msgId);
      await fetchMessages();
      toast.success('Message deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete message. Please try again.');
    }
  };

  if (!isLoggedIn) {
    return <div>Please log in to view the chat.</div>;
  }

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((msg) => {
          const username = msg.userId === currentUser?.id ? currentUser.username : usernames[msg.userId] || 'Unknown User';
          return (
            <div 
              key={msg.id}
              className={`message ${msg.userId === currentUser?.id ? 'user-message' : 'other-message'}`}
            >
              {msg.userId === currentUser?.id ? (
                <>
                  <div className="message-content">
                    <div className="message-username">{username}</div>
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }} />
                    <button onClick={() => handleDelete(msg.id)} className="delete-button">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <img 
                    src={currentUser.avatar || DEFAULT_AVATAR} 
                    alt={username} 
                    className="message-avatar" 
                  />
                </>
              ) : (
                <>
                  <img 
                    src={DEFAULT_AVATAR} 
                    alt={username} 
                    className="message-avatar" 
                  />
                  <div className="message-content">
                    <div className="message-username">{username}</div>
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }} />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;