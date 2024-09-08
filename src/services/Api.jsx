import { jwtDecode } from "jwt-decode";

const API_URL = 'https://chatify-api.up.railway.app';

let csrfToken = null;
let authToken = null;

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

    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
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
        authToken = null;
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
  authToken = response.token;
  localStorage.setItem('authToken', authToken);
  
  return {
    user: {
      id: response.id,
      username: response.user,
      email: response.email,
      avatar: response.avatar
    }
  };
}

export async function registerUser(userData) {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  } catch (error) {
    if (error.message.includes('Username or email already exists')) {
      throw new Error('Username or email already exists');
    }
    throw error;
  }
}

export function logout() {
  authToken = null;
  localStorage.removeItem('authToken');
}

export function isAuthenticated() {
  if (!authToken) {
    authToken = localStorage.getItem('authToken');
  }
  
  if (!authToken) return false;
  
  try {
    const decodedToken = jwtDecode(authToken);
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      authToken = null;
      localStorage.removeItem('authToken');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error decoding token:', error);
    authToken = null;
    localStorage.removeItem('authToken');
    return false;
  }
}

export function getCurrentUser() {
  if (!authToken) {
    authToken = localStorage.getItem('authToken');
  }
  
  if (authToken) {
    try {
      const decodedToken = jwtDecode(authToken);
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

export async function getAllMessages(conversationId = '550e8400-e29b-41d4-a716-146655440000') {
  return apiRequest(`/messages?conversationId=${conversationId}`);
}

export async function createMessage(messageData) {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('No authenticated user');
  
  const payload = {
    userId: currentUser.id,
    text: messageData.content,
    conversationId: messageData.conversationId || '550e8400-e29b-41d4-a716-146655440000'
  };

  try {
    const response = await apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response;
  } catch (error) {
    console.error('Error creating message:', error);
    if (error.message.includes('Authentication failed')) {
      logout();
      throw new Error('Your session has expired. Please log in again.');
    }
    throw error;
  }
}

export async function deleteMessage(messageId) {
  return apiRequest(`/messages/${messageId}`, {
    method: 'DELETE',
  });
}

export function isTokenExpired() {
  if (!authToken) {
    authToken = localStorage.getItem('authToken');
  }
  
  if (!authToken) return true;

  try {
    const decodedToken = jwtDecode(authToken);
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
      authToken = response.token;
      localStorage.setItem('authToken', authToken);
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

export async function getUserById(userId) {
  return apiRequest(`/users/${userId}`, {
    method: 'GET',
  });
}

export { fetchCsrfToken };