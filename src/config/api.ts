import axios from 'axios';

// Create a single base instance, but could be multiple for each microservice if there's no gateway
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the backend sent a validation "errors" array
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      const detailedErrors = error.response.data.errors
        .map((err: any) => err.message || err.msg || err)
        .join(', ');

      // Override the general message with the detailed ones
      if (detailedErrors) {
        error.response.data.message = `${error.response.data.message}: ${detailedErrors}`;
      }
    } else if (typeof error.response?.data === 'string') {
      error.response.data = { message: error.response.data };
    }
    return Promise.reject(error);
  }
);

export const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3001';
export const NOTIFICATION_SERVICE_URL = import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:3002';
export const TRAIN_SERVICE_URL = import.meta.env.VITE_TRAIN_SERVICE_URL || 'http://localhost:3003';
export const BOOKING_SERVICE_URL = import.meta.env.VITE_BOOKING_SERVICE_URL || 'http://localhost:3004';
export const PAYMENT_SERVICE_URL = import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:3005'; // Assuming 3005 as it wasn't specified but we need it

