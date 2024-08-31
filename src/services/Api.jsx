import { jwtDecode } from "jwt-decode";

const API_URL = 'https://chatify-api.up.railway.app';

let csrfToken = null;

async function fetchCsrfToken() {
  try {
    const response = await fetch(`${API_URL}/csrf`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    csrfToken = data.csrf_token;
    console.log('CSRF Token:', csrfToken);
    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

async function apiRequest(url, options = {}) {
  if (!csrfToken) {
    await fetchCsrfToken();
  }

  const token = localStorage.getItem('authToken');
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
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

export async function registerUser(userData) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function login(credentials) {
  const response = await apiRequest('/auth/token', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  localStorage.setItem('authToken', response.token);
  console.log('Received JWT Token:', response.token);
  return response;
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
    const decodedToken = jwtDecode(token);
    return {
      id: decodedToken.sub,
      username: decodedToken.username,
      email: decodedToken.email,
      avatar: decodedToken.avatar
    };
  }
  return null;
}

export async function getAllMessages(conversationId = 'default') {
  return apiRequest(`/messages?conversationId=${conversationId}`);
}

export async function createMessage(messageData) {
  return apiRequest('/messages', {
    method: 'POST',
    body: JSON.stringify(messageData),
  });
}

export async function deleteMessage(messageId) {
  return apiRequest(`/messages/${messageId}`, {
    method: 'DELETE',
  });
}

export async function getUserInfo() {
  const user = getCurrentUser();
  if (!user) throw new Error('No authenticated user');
  return apiRequest(`/users/${user.id}`);
}

export async function updateUserProfile(userData) {
  return apiRequest('/user', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

export async function deleteUser() {
  const user = getCurrentUser();
  if (!user) throw new Error('No authenticated user');
  return apiRequest(`/users/${user.id}`, {
    method: 'DELETE',
  });
}

// Utility function to generate a GUID for conversation IDs
function generateConversationId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Export all functions at once
export {
  fetchCsrfToken,
  login,
  registerUser,
  logout,
  isAuthenticated,
  getUserInfo,
  updateUserProfile,
  deleteUser,
  getAllMessages,
  createMessage,
  deleteMessage,
  generateConversationId
};