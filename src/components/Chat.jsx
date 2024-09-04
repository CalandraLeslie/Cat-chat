import React, { useState, useEffect } from 'react';
import { getAllMessages, createMessage, deleteMessage, getCurrentUser } from '../services/Api';
import { toast } from 'react-toastify';
import { jwtDecode } from "jwt-decode";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState('default');
  const [currentUser, setCurrentUser] = useState(null);
  const [fakeChat] = useState([
    {
      "id": "fake1",
      "text": "Tja tja, hur mår du?",
      "avatar": "https://i.pravatar.cc/100?img=14",
      "username": "flojo",
      "conversationId": null
    },
    {
      "id": "fake2",
      "text": "Hallå!! Svara då!!",
      "avatar": "https://i.pravatar.cc/100?img=14",
      "username": "Johnny",
      "conversationId": null
    },
    {
      "id": "fake3",
      "text": "Sover du eller?! 😴",
      "avatar": "https://i.pravatar.cc/100?img=14",
      "username": "tyson",
      "conversationId": null
    }
  ]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = jwtDecode(token);
      setCurrentUser(decodedToken);
      console.log("Current user:", decodedToken); // Debug log
    } else {
      toast.error('User not authenticated');
      // Redirect to login page or handle unauthenticated state
    }
    fetchMessages();
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const data = await getAllMessages(conversationId);
      console.log("Fetched messages:", data); // Debug log
      setMessages([...fakeChat, ...data]);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      toast.error('Failed to fetch messages. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const response = await createMessage({ content: newMessage, userId: currentUser.id, conversationId });
      console.log("Created message:", response); // Debug log
      setMessages(prevMessages => [...prevMessages, response]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleDelete = async (msgId) => {
    try {
      await deleteMessage(msgId);
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== msgId));
      toast.success('Message deleted successfully.');
    } catch (err) {
      console.error('Failed to delete message:', err);
      toast.error('Failed to delete message. Please try again.');
    }
  };

  const isCurrentUserMessage = (msg) => {
    const isCurrentUser = msg.username === currentUser?.user || msg.user?.id === currentUser?.id;
    console.log(`Message: ${msg.text || msg.content}, IsCurrentUser: ${isCurrentUser}`); // Debug log
    return isCurrentUser;
  };

  const getMessageColor = (username) => {
    const colors = ['#E0F7FA', '#E8EAF6', '#F3E5F5', '#FFF3E0', '#E8F5E9'];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`message ${isCurrentUserMessage(msg) ? 'user-message' : 'other-message'}`}
          >
            <img src={msg.avatar || msg.user?.avatar || 'https://i.pravatar.cc/100'} alt={msg.username || msg.user?.username} className="message-avatar" />
            <div 
              className="message-content"
              style={{ backgroundColor: isCurrentUserMessage(msg) ? '#DCF8C6' : getMessageColor(msg.username || msg.user?.username) }}
            >
              <strong>{msg.username || msg.user?.username}: </strong>
              <span>{msg.text || msg.content}</span>
              {isCurrentUserMessage(msg) && !msg.id.startsWith('fake') && (
                <button onClick={() => handleDelete(msg.id)} className="delete-button">×</button>
              )}
            </div>
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
        <button type="submit" className="submit-button">Send</button>
      </form>
    </div>
  );
};

export default Chat;