import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle unauthorized errors (401)
    if (response && response.status === 401) {
      // Clear token and redirect to login if not already there
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Show error toast for other errors
    const errorMessage = response?.data?.message || 'Something went wrong';
    toast.error(errorMessage);
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updatePassword: (passwords) => api.put('/auth/updatepassword', passwords),
  registerAdmin: (adminData) => api.post('/auth/register', adminData),
  getAdmins: () => api.get('/auth/admins')
};

// Event API
export const eventAPI = {
  getEvents: () => api.get('/events'),
  getActiveEvent: () => api.get('/events/active'),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  uploadBanner: async (id, formData) => {
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
    console.log(`Sending banner upload request to ${baseURL}/events/${id}/banner`);
    console.log('FormData keys:', [...formData.keys()]);
    
    // Log the content type being sent
    const bannerFile = formData.get('banner');
    if (bannerFile) {
      console.log('Banner file in FormData:', {
        name: bannerFile.name,
        type: bannerFile.type,
        size: bannerFile.size
      });
    } else {
      console.error('No banner file found in FormData');
    }
    
    return await api.post(`/events/${id}/banner`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  setActiveEvent: (id) => api.put(`/events/${id}/activate`),
  setDeactiveEvent: (id) => api.put(`/events/${id}/deactivate`)
};

// User API
export const userAPI = {
  registerUser: (userData) => api.post('/users/register', userData),
  getUserByPhone: (phone) => api.get(`/users/phone/${phone}`),
  getUsers: (filters = {}) => api.get('/users', { params: filters }),
  registerOnSpot: (userData) => api.post('/users/onspot', userData),
  checkInUser: (phone) => api.post('/users/checkin', { phone })
};

// Stats API
export const statsAPI = {
  getDashboardStats: () => api.get('/stats/dashboard'),
  getGenderStats: () => api.get('/stats/gender'),
  getCityStats: () => api.get('/stats/city'),
  getCheckInStats: () => api.get('/stats/checkin'),
  getRegistrationStats: () => api.get('/stats/registration')
};

export default api;