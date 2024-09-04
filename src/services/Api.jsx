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
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        throw new Error('Authentication failed. Please log in again.');
      }
      const error = await response.json();
      throw new Error(error.error || 'An error occurred');
    }

    return response.json();
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

export { fetchCsrfToken };