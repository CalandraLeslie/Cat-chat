import React, { useState, useEffect } from 'react';
import { getAllMessages, createMessage, deleteMessage, searchUsers, inviteToChat, createConversation } from '../services/Api';
import { toast } from 'react-toastify';

const Chat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState('default');

  useEffect(() => {
    fetchMessages();
  }, [currentConversationId]);

  const fetchMessages = async () => {
    try {
      const data = await getAllMessages(currentConversationId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to fetch messages. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await createMessage({ content: newMessage, userId: user.id, conversationId: currentConversationId });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleDelete = async (msgId) => {
    try {
      await deleteMessage(msgId);
      fetchMessages();
    } catch (err) {
      console.error('Failed to delete message:', err);
      setError('Failed to delete message. Please try again.');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const results = await searchUsers(searchTerm);
      setSearchResults(results);
    } catch (err) {
      console.error('Failed to search users:', err);
      toast.error('Failed to search users. Please try again.');
    }
  };

  const handleInvite = async (userId) => {
    try {
      if (currentConversationId === 'default') {
        const newConversation = await createConversation(`Chat with ${user.username}`);
        setCurrentConversationId(newConversation.id);
      }
      await inviteToChat(userId, currentConversationId);
      toast.success('Invitation sent successfully!');
      setSearchResults([]);
      setSearchTerm('');
    } catch (err) {
      console.error('Failed to invite user:', err);
      toast.error('Failed to invite user. Please try again.');
    }
  };

  return (
    <div className="container">
      <h1>Chat</h1>
      <div className="invite-section">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users to invite..."
        />
        <button onClick={handleSearch} className="submit-button">Search</button>
      </div>
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((result) => (
            <div key={result.id} className="search-result">
              <span>{result.username}</span>
              <button onClick={() => handleInvite(result.id)} className="submit-button">Invite</button>
            </div>
          ))}
        </div>
      )}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <strong>{msg.user.username}: </strong>
            <span>{msg.content}</span>
            {msg.user.id === user.id && (
              <button onClick={() => handleDelete(msg.id)} className="submit-button">Delete</button>
            )}
          </div>
        ))}
      </div>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
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