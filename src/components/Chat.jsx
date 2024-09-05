import React, { useState, useEffect, useCallback } from 'react';
import { getAllMessages, createMessage, deleteMessage, getCurrentUser, isAuthenticated } from '../services/Api';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';

const DEFAULT_AVATAR = 'https://i.ibb.co/RvKq4CZ/catchat.jpg';
const LOCAL_STORAGE_KEY = 'localChatMessages';
const SYNC_INTERVAL = 5000; // 5 seconds

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(0);

  const loadLocalMessages = () => {
    const storedMessages = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedMessages ? JSON.parse(storedMessages) : [];
  };

  const saveLocalMessages = (msgs) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(msgs));
  };

  const fetchServerMessages = useCallback(async () => {
    try {
      const serverMessages = await getAllMessages();
      return serverMessages;
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      toast.error('Failed to fetch new messages. Some messages may be missing.');
      return [];
    }
  }, []);

  const mergeMessages = (localMsgs, serverMsgs) => {
    const mergedMessages = [...localMsgs];
    serverMsgs.forEach(serverMsg => {
      if (!mergedMessages.some(msg => msg.id === serverMsg.id)) {
        mergedMessages.push(serverMsg);
      }
    });
    return mergedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const syncMessages = useCallback(async () => {
    const localMessages = loadLocalMessages();
    const serverMessages = await fetchServerMessages();
    const mergedMessages = mergeMessages(localMessages, serverMessages);
    setMessages(mergedMessages);
    saveLocalMessages(mergedMessages);
    setLastSyncTime(Date.now());
  }, [fetchServerMessages]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (!isAuthenticated()) {
      toast.error('You are not authenticated. Please log in.');
      // Redirect to login page or show login modal
      return;
    }

    syncMessages();

    const intervalId = setInterval(syncMessages, SYNC_INTERVAL);

    return () => clearInterval(intervalId);
  }, [syncMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    if (!isAuthenticated()) {
      toast.error('You must be logged in to send messages.');
      return;
    }

    const newMsg = {
      id: `local_${Date.now()}`,
      content: newMessage,
      user: {
        id: currentUser?.id || 'anonymous',
        username: currentUser?.username || 'Anonymous',
        avatar: currentUser?.avatar || DEFAULT_AVATAR
      },
      timestamp: new Date().toISOString()
    };

    setMessages(prevMessages => [...prevMessages, newMsg]);
    saveLocalMessages([...messages, newMsg]);
    setNewMessage('');

    try {
      const serverResponse = await createMessage({
        content: newMessage,
        userId: currentUser?.id
      });
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === newMsg.id ? {...serverResponse, user: newMsg.user} : msg
        )
      );
      saveLocalMessages(messages.map(msg => 
        msg.id === newMsg.id ? {...serverResponse, user: newMsg.user} : msg
      ));
    } catch (err) {
      console.error('Failed to send message to server:', err);
      toast.error('Failed to send message to server. Message saved locally.');
    }
  };

  const handleDelete = async (msgId) => {
    if (!isAuthenticated()) {
      toast.error('You must be logged in to delete messages.');
      return;
    }

    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== msgId));
    saveLocalMessages(messages.filter(msg => msg.id !== msgId));

    if (!msgId.startsWith('local_')) {
      try {
        await deleteMessage(msgId);
        toast.success('Message deleted successfully.');
      } catch (err) {
        console.error('Failed to delete message from server:', err);
        toast.error('Failed to delete message from server. Deleted locally.');
      }
    }
  };

  const isCurrentUserMessage = (msg) => {
    return msg.user.id === currentUser?.id;
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`message ${isCurrentUserMessage(msg) ? 'user-message' : 'other-message'}`}
          >
            {isCurrentUserMessage(msg) ? (
              <>
                <div className="message-content">
                  <div className="message-username">{msg.user.username}</div>
                  <div>{msg.content}</div>
                  <button onClick={() => handleDelete(msg.id)} className="delete-button">
                    <Trash2 size={16} />
                  </button>
                </div>
                <img 
                  src={msg.user.avatar || DEFAULT_AVATAR} 
                  alt={msg.user.username} 
                  className="message-avatar" 
                  onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR }}
                />
              </>
            ) : (
              <>
                <img 
                  src={msg.user.avatar || DEFAULT_AVATAR} 
                  alt={msg.user.username} 
                  className="message-avatar" 
                  onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR }}
                />
                <div className="message-content">
                  <div className="message-username">{msg.user.username}</div>
                  <div>{msg.content}</div>
                </div>
              </>
            )}
          </div>
        ))}
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