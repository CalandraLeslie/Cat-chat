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

    console.log('API Request:', { url: fullUrl, method: options.method, headers, body: options.body });

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const data = await response.json();
    console.log('API Response:', data);

    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${response.status} ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`Error in API request to ${url}:`, error);
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
      return { token: response.token };
    } else {
      throw new Error('Login failed: No token received');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function registerUser(userData) {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    console.log('Registration response:', response);

    if (response.message === 'User registered successfully') {
      // If registration is successful, attempt to log in
      console.log('Registration successful, attempting to log in...');
      return await login({ username: userData.username, password: userData.password });
    } else {
      throw new Error('Registration failed: Unexpected response');
    }
  } catch (error) {
    console.error('Registration error:', error);
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

export { fetchCsrfToken };