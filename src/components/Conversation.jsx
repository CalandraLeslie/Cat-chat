import React, { useState, useEffect } from 'react';
import { getMessages, sendMessage, deleteMessage, getCurrentUser } from '../services/Api';
import { toast } from 'react-toastify';

const Conversation = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUser = getCurrentUser();
  const [fakeChat, setFakeChat] = useState([
    {
      "id": "fake1",
      "content": "I have had the world record in the 100m since 1988!",
      "avatar": "https://i.ibb.co/nRRt2Sm/rsz-1cat-box-1581653.png",
      "username": "flojo",
      "conversationId": null
    },
    {
      "id": "fake2",
      "content": "I was pretty good too!",
      "avatar": "https://i.ibb.co/yVhhwhw/icons8-cat-100.png",
      "username": "tyson",
      "conversationId": null
    },
    {
      "id": "fake3",
      "content": "Yeah... until you got busted on your drug test! ",
      "avatar": "https://i.ibb.co/nRRt2Sm/rsz-1cat-box-1581653.png",
      "username": "flojo",
      "conversationId": null
    }
  ]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to fetch messages. Please try again.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await sendMessage(newMessage);
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await deleteMessage(msgId);
      fetchMessages();
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message. Please try again.');
    }
  };

  const allMessages = [...fakeChat, ...messages];

  return (
    <div className="conversation-container">
      <h1>Conversation</h1>
      <div className="messages">
        {allMessages.map((message) => (
          <div key={message.id} className={`message ${message.username === currentUser.username ? 'own-message' : ''}`}>
            <img src={message.avatar || currentUser.avatar} alt={`${message.username}'s avatar`} className="message-avatar" />
            <strong>{message.username}: </strong>
            <span>{message.content}</span>
            {message.username === currentUser.username && (
              <button onClick={() => handleDeleteMessage(message.id)}>Delete</button>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Conversation;