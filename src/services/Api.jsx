import { jwtDecode } from "jwt-decode";

const API_URL = 'https://chatify-api.up.railway.app';

async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'An error occurred');
  }

  return response.json();
}

export async function login(credentials) {
  const response = await apiRequest('/auth/token', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  localStorage.setItem('authToken', response.token);
  return response;
}

export async function registerUser(userData) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export function logout() {
  localStorage.removeItem('authToken');
}

export function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

export function getCurrentUser() {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      return {
        id: decodedToken.id,
        username: decodedToken.user,
        email: decodedToken.email,
        avatar: decodedToken.avatar
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  return null;
}

export async function getUserInfo(userId) {
  return apiRequest(`/users/${userId}`);
}

export async function updateUserProfile(userData) {
  return apiRequest('/user', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

export async function deleteUser() {
  return apiRequest('/user', {
    method: 'DELETE',
  });
}

export async function searchUsers(username) {
  return apiRequest(`/users?username=${encodeURIComponent(username)}`);
}

export async function inviteUser(userId) {
  return apiRequest(`/invite/${userId}`, {
    method: 'POST',
  });
}

export async function getConversations() {
  return apiRequest('/conversations');
}

export async function getMessages(conversationId) {
  return apiRequest(`/messages?conversationId=${conversationId}`);
}

export async function sendMessage(content, conversationId) {
  return apiRequest('/messages', {
    method: 'POST',
    body: JSON.stringify({ content, conversationId }),
  });
}

export async function deleteMessage(msgId) {
  return apiRequest(`/messages/${msgId}`, {
    method: 'DELETE',
  });
}

export { apiRequest };