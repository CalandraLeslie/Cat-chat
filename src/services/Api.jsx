const API_URL = 'https://chatify-api.up.railway.app';

// Token management
function getToken() {
  return localStorage.getItem('authToken');
}

function setToken(token) {
  localStorage.setItem('authToken', token);
}

function removeToken() {
  localStorage.removeItem('authToken');
}

// CSRF token management
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
    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

// API request function
async function apiRequest(url, options = {}) {
  try {
    if (!csrfToken) {
      await fetchCsrfToken();
    }

    const token = getToken();
    const fullUrl = `${API_URL}${url}`;
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Authentication functions
async function login(credentials) {
  try {
    const response = await apiRequest('/auth/token', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      setToken(response.token);
      const userInfo = await getUserInfo(response.userId);
      return { token: response.token, user: userInfo };
    } else {
      throw new Error('Login failed: No token received');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async function registerUser(userData) {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.message === 'User registered successfully') {
      return await login({ username: userData.username, password: userData.password });
    } else {
      throw new Error('Registration failed: Unexpected response');
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

function logout() {
  removeToken();
  csrfToken = null;
}

function isAuthenticated() {
  return !!getToken();
}

// User profile functions
async function getUserInfo(userId) {
  try {
    return await apiRequest(`/users/${userId}`, { method: 'GET' });
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
}

async function updateUserProfile(userData) {
  try {
    return await apiRequest('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

async function deleteUser(userId) {
  try {
    return await apiRequest(`/users/${userId}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Chat functions
async function getAllMessages(conversationId = null) {
  try {
    const url = conversationId 
      ? `/messages?conversationId=${conversationId}`
      : '/messages';
    return await apiRequest(url, { method: 'GET' });
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

async function createMessage(messageData) {
  try {
    return await apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
}

async function deleteMessage(messageId) {
  try {
    return await apiRequest(`/messages/${messageId}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
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