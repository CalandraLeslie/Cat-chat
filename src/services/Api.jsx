import { jwtDecode } from "jwt-decode";

const API_URL = 'https://chatify-api.up.railway.app';

let csrfToken = null;

async function fetchCsrfToken() {
  if (csrfToken) return csrfToken;

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
    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

async function apiRequest(url, options = {}) {
  try {
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
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      } else {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
      }
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
    } else {
      const text = await response.text();
      console.warn("Response is not JSON:", text);
      return { message: text };
    }
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

export async function login(credentials) {
  try {
    const response = await apiRequest('/auth/token', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    localStorage.setItem('authToken', response.token);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Failed to login. Please try again.');
  }
}

export async function registerUser(userData) {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message.includes('already exists')) {
      throw new Error('Username or email already exists');
    }
    throw new Error(error.message || 'Failed to register. Please try again.');
  }
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
  try {
    return await apiRequest(`/users/${userId}`);
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw new Error(error.message || 'Failed to fetch user information.');
  }
}

export async function updateUserProfile(userData) {
  try {
    return await apiRequest('/user', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error(error.message || 'Failed to update user profile.');
  }
}

export async function deleteUser(userId) {
  try {
    return await apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error(error.message || 'Failed to delete user.');
  }
}

export async function getAllMessages(conversationId) {
  try {
    return await apiRequest(`/messages?conversationId=${conversationId}`);
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error(error.message || 'Failed to fetch messages.');
  }
}

export async function createMessage(messageData) {
  try {
    return await apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  } catch (error) {
    console.error('Error creating message:', error);
    throw new Error(error.message || 'Failed to send message.');
  }
}

export async function deleteMessage(messageId) {
  try {
    return await apiRequest(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw new Error(error.message || 'Failed to delete message.');
  }
}

export async function searchUsers(username) {
  try {
    return await apiRequest(`/users?username=${encodeURIComponent(username)}`);
  } catch (error) {
    console.error('Error searching users:', error);
    throw new Error(error.message || 'Failed to search users.');
  }
}

export async function getUsers() {
  try {
    return await apiRequest('/users');
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error(error.message || 'Failed to fetch users.');
  }
}

export async function inviteToChat(userId, conversationId) {
  try {
    return await apiRequest('/invitations', {
      method: 'POST',
      body: JSON.stringify({ userId, conversationId }),
    });
  } catch (error) {
    console.error('Error inviting to chat:', error);
    throw new Error(error.message || 'Failed to invite user to chat.');
  }
}

export async function createConversation(name) {
  try {
    // Trying both '/conversation' and '/conversations' endpoints
    try {
      return await apiRequest('/conversation', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
    } catch (error) {
      if (error.message.includes('404')) {
        return await apiRequest('/conversations', {
          method: 'POST',
          body: JSON.stringify({ name }),
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error(error.message || 'Failed to create conversation.');
  }
}

export async function getConversations() {
  try {
    return await apiRequest('/conversations');
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw new Error(error.message || 'Failed to fetch conversations.');
  }
}

export async function getConversation(conversationId) {
  try {
    return await apiRequest(`/conversations/${conversationId}`);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw new Error(error.message || 'Failed to fetch conversation.');
  }
}

export { fetchCsrfToken };