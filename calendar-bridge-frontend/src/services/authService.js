import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const checkAuthStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/status`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Auth status check failed:', error);
    return { authenticated: false };
  }
};

export const handleAuthCallback = async (code) => {
  const response = await axios.post(
    `${API_URL}/auth/callback`,
    { code },
    { withCredentials: true }
  );
  return response.data;
};

export const getUserInfo = async () => {
  const response = await axios.get(`${API_URL}/user/info`, {
    withCredentials: true
  });
  return response.data;
};

export const disconnectCalendar = async () => {
  const response = await axios.post(
    `${API_URL}/auth/disconnect`,
    {},
    { withCredentials: true }
  );
  return response.data;
};