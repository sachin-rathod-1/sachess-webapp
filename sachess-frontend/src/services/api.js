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
  signup: (username, email, password) => api.post('/auth/signup', { username, email, password }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getUserById: (userId) => api.get(`/users/${userId}`),
  getUserByUsername: (username) => api.get(`/users/username/${username}`),
  getOnlineUsers: () => api.get('/users/online'),
  searchUsers: (query) => api.get('/users/search', { params: { q: query } }),
};

// Game API
export const gameAPI = {
  createGame: (timeControl, increment) => api.post('/games/create', { timeControl, increment }),
  joinGame: (gameId) => api.post(`/games/${gameId}/join`),
  getGame: (gameId) => api.get(`/games/${gameId}`),
  makeMove: (gameId, from, to, promotion) => api.post(`/games/${gameId}/move`, { from, to, promotion }),
  resign: (gameId) => api.post(`/games/${gameId}/resign`),
  offerDraw: (gameId) => api.post(`/games/${gameId}/draw/offer`),
  acceptDraw: (gameId) => api.post(`/games/${gameId}/draw/accept`),
  declineDraw: (gameId) => api.post(`/games/${gameId}/draw/decline`),
  getActiveGames: () => api.get('/games/active'),
  getWaitingGames: () => api.get('/games/waiting'),
  getMyGames: () => api.get('/games/my-games'),
  analyzePosition: (gameId, fen) => api.post(`/games/${gameId}/analyze`, { fen }),
  // Matchmaking
  joinMatchmaking: (timeControl, increment) => api.post('/games/matchmaking/join', { timeControl, increment }),
  leaveMatchmaking: () => api.post('/games/matchmaking/leave'),
  getMatchmakingStatus: () => api.get('/games/matchmaking/status'),
  // Invitations
  createInvitation: (timeControl, increment) => api.post('/games/invite/create', { timeControl, increment }),
  acceptInvitation: (code) => api.post(`/games/invite/${code}/accept`),
  cancelInvitation: (code) => api.post(`/games/invite/${code}/cancel`),
};

// Chat API
export const chatAPI = {
  sendMessage: (gameId, content) => api.post(`/chat/${gameId}`, { content }),
  getMessages: (gameId) => api.get(`/chat/${gameId}`),
  getRecentMessages: (gameId) => api.get(`/chat/${gameId}/recent`),
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
  getLeaderboard: (limit = 100) => api.get('/leaderboard', { params: { limit } }),
};

export default api;