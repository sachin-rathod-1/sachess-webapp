import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('chessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (expired or invalid token)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('chessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (name, email, password) => api.post('/auth/signup', { name, email, password }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getStats: () => api.get('/users/stats'),
  getAchievements: () => api.get('/users/achievements'),
  getActivity: () => api.get('/users/activity'),
};

// Puzzles API
export const puzzlesAPI = {
  getDailyPuzzle: () => api.get('/puzzles/daily'),
  getPuzzleById: (id) => api.get(`/puzzles/${id}`),
  getPuzzles: (params) => api.get('/puzzles', { params }),
  submitPuzzleResult: (puzzleId, result) => api.post(`/puzzles/${puzzleId}/result`, result),
};

// Training API
export const trainingAPI = {
  getThemes: () => api.get('/training/themes'),
  getPuzzlesByTheme: (theme, params) => api.get(`/training/themes/${theme}/puzzles`, { params }),
  getRecommendations: () => api.get('/training/recommendations'),
  createCustomTraining: (params) => api.post('/training/custom', params),
};

// Leaderboard API
export const leaderboardAPI = {
  getLeaderboard: (params) => api.get('/leaderboard', { params }),
};

export default api;