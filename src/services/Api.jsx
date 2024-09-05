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

    const contentType = response.headers.get("content-type");
    let responseData;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        throw new Error('Authentication failed. Please log in again.');
      }
      console.error('API Error Response:', responseData);
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
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
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem('authToken');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error decoding token:', error);
    localStorage.removeItem('authToken');
    return false;
  }
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

export async function getUserInfo() {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('No authenticated user');
  return apiRequest(`/users/${currentUser.id}`);
}

export async function updateUserProfile(userData) {
  return apiRequest('/user', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

export async function deleteUser() {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('No authenticated user');
  return apiRequest(`/users/${currentUser.id}`, {
    method: 'DELETE',
  });
}

export async function getAllMessages(conversationId = 'default') {
  return apiRequest(`/messages?conversationId=${conversationId}`);
}

export async function createMessage(messageData) {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('No authenticated user');
  
  const payload = {
    text: messageData.content,
    conversationId: messageData.conversationId || '550e8400-e29b-41d4-a716-446655440000' // Default conversation ID if not provided
  };

  try {
    console.log('Sending message payload:', payload);
    const response = await apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    console.log('Server response:', response);
    return response;
  } catch (error) {
    console.error('Error creating message:', error);
    if (error.message.includes('Authentication failed')) {
      logout();
      throw new Error('Your session has expired. Please log in again.');
    }
    if (error.response) {
      console.error('Server responded with error:', error.response.data);
      throw new Error(error.response.data.error || 'An error occurred while sending the message.');
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      console.error('Error setting up request:', error.message);
      throw new Error('An unexpected error occurred. Please try again later.');
    }
  }
}

export async function deleteMessage(messageId) {
  return apiRequest(`/messages/${messageId}`, {
    method: 'DELETE',
  });
}

export function isTokenExpired() {
  const token = localStorage.getItem('authToken');
  if (!token) return true;

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}

export async function refreshToken() {
  try {
    const response = await apiRequest('/auth/refresh', {
      method: 'POST',
    });
    if (response && response.token) {
      localStorage.setItem('authToken', response.token);
      return response.token;
    } else {
      throw new Error('Invalid response from refresh token endpoint');
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    logout();
    throw new Error('Session expired. Please log in again.');
  }
}

export { fetchCsrfToken };