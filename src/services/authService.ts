import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});



// Function to setup activity listeners

// Login function
export async function login({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  try {
    const res = await api.post("/api/login", {
      username,
      password,
    });

    console.log('Login response:', res.data); // Debug log

    // Store token
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }

    let userData = res.data.user || res.data;

    // Store the complete user data
    localStorage.setItem('userData', JSON.stringify(userData));

    // Handle permissions
    if (userData.access && userData.access.length > 0) {
      try {
        // The access array contains a JSON string that needs to be parsed
        const permissionsArray = JSON.parse(userData.access[0]);
        // Store the parsed permissions array
        localStorage.setItem('userPermissions', JSON.stringify(permissionsArray));
      } catch (error) {
        console.error('Error parsing permissions:', error);
        localStorage.setItem('userPermissions', '[]');
      }
    }

    return userData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Logout function (unchanged)
export async function logout() {
  const token = localStorage.getItem('token');
  


  if (!token) return;

  try {
    await api.post('/api/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userPermissions');
  }
}

// Add this function to validate permissions after token validation
export async function validatePermissions() {
  const token = localStorage.getItem('token');
  const userPermissions = localStorage.getItem('userPermissions');
  
  if (!token || !userPermissions) {
    return false;
  }

  try {
    const permissions = JSON.parse(userPermissions);
    return Array.isArray(permissions) && permissions.length > 0;
  } catch {
    return false;
  }
}

// Modify the existing validateUser function
export async function validateUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await api.get('/api/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data) {
      const userData = response.data;
      localStorage.setItem('userData', JSON.stringify(userData));

      // Enhanced permission handling
      if (userData.access) {
        let userPermissions = [];
        try {
          if (Array.isArray(userData.access)) {
            userPermissions = typeof userData.access[0] === 'string'
              ? JSON.parse(userData.access[0])
              : userData.access[0];
          } else {
            userPermissions = JSON.parse(userData.access);
          }

          if (!Array.isArray(userPermissions)) {
            userPermissions = [userPermissions];
          }

          localStorage.setItem('userPermissions', JSON.stringify(userPermissions));
        } catch (error) {
          console.error('Error parsing permissions:', error);
          localStorage.setItem('userPermissions', '[]');
          return null;
        }
      } else {
        localStorage.setItem('userPermissions', '[]');
        return null;
      }

      return userData;
    }
    return null;
  } catch (error) {
    // Clear all auth data on validation error
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userPermissions');
    console.error("User validation failed:", error);
    return null;
  }
}

// Add request interceptor to add token to all requests (unchanged)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Utility functions (unchanged)
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}