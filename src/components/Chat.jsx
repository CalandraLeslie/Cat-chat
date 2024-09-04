import React, { useState, useEffect } from 'react';
import { getAllMessages, createMessage, deleteMessage, searchUsers, createConversation } from '../services/Api';
import DOMPurify from 'dompurify';
import { toast } from 'react-toastify';

const Chat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  useEffect(() => {
    if (currentConversationId) {
      fetchMessages();
    }
  }, [currentConversationId]);

  const fetchMessages = async () => {
    if (!currentConversationId) return;
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
    if (!currentConversationId) {
      setError('No active conversation. Please start a conversation first.');
      return;
    }
    try {
      const sanitizedMessage = DOMPurify.sanitize(newMessage);
      await createMessage({ content: sanitizedMessage, userId: user.id, conversationId: currentConversationId });
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
      // Sort results to show usernames first
      const sortedResults = results.sort((a, b) => 
        a.username.toLowerCase().localeCompare(b.username.toLowerCase())
      );
      setSearchResults(sortedResults);
    } catch (err) {
      console.error('Failed to search users:', err);
      toast.error('Failed to search users. Please try again.');
    }
  };

  const startConversation = async (otherUser) => {
    try {
      const conversationName = `Chat between ${user.username} and ${otherUser.username}`;
      const newConversation = await createConversation(conversationName);
      setCurrentConversationId(newConversation.id);
      toast.success(`Started a conversation with ${otherUser.username}`);
      setSearchResults([]);
      setSearchTerm('');
    } catch (err) {
      console.error('Failed to start conversation:', err);
      toast.error('Failed to start conversation. Please try again.');
    }
  };

  return (
    <div className="chat-container">
      <h1>Chat</h1>
      <div className="search-section">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users to start a chat..."
        />
        <button onClick={handleSearch} className="submit-button">Search</button>
      </div>
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((result) => (
            <div key={result.id} className="search-result">
              <span>{result.username}</span>
              <button onClick={() => startConversation(result)} className="submit-button">
                Start Chat
              </button>
            </div>
          ))}
        </div>
      )}
      {currentConversationId ? (
        <>
          <div className="chat-messages">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message ${msg.user.id === user.id ? 'own-message' : 'other-message'}`}
              >
                <strong>{msg.user.username}: </strong>
                <span>{msg.content}</span>
                {msg.user.id === user.id && (
                  <button onClick={() => handleDelete(msg.id)} className="delete-button">Delete</button>
                )}
              </div>
            ))}
          </div>
          {error && <p className="error-message">{error}</p>}
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
        </>
      ) : (
        <p>No active conversation. Search for a user to start chatting.</p>
      )}
    </div>
  );
};

export default Chat;