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

    // Use the fetch API without any logging
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${response.status} ${response.statusText}`);
    }

    return data;
  } catch (error) {
    // Rethrow the error without logging
    throw error;
  }
}

// Authentication functions
export async function login(credentials) {
  try {
    const response = await apiRequest('/auth/token', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      setToken(response.token);
      return { token: response.token, user: response.user };
    } else {
      throw new Error('Login failed: No token received');
    }
  } catch (error) {
    throw error;
  }
}

export async function registerUser(userData) {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.message === 'User registered successfully') {
      const loginResponse = await login({ username: userData.username, password: userData.password });
      return { ...loginResponse, user: { ...loginResponse.user, avatar: userData.avatar } };
    } else {
      throw new Error('Registration failed: Unexpected response');
    }
  } catch (error) {
    throw error;
  }
}

export function logout() {
  removeToken();
  csrfToken = null;
}

export function isAuthenticated() {
  return !!getToken();
}

// User profile function
export async function getUserProfile() {
  try {
    return await apiRequest('/user/profile', { method: 'GET' });
  } catch (error) {
    throw error;
  }
}

// Function to update user profile (including avatar)
export async function updateUserProfile(userData) {
  try {
    return await apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    throw error;
  }
}

export { fetchCsrfToken };