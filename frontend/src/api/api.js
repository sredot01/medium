import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// GitHub sign-in uses same-origin cookies for its callback and session handoff.
export const getGitHubLoginStatus = () => api.get('/auth/github/status');
export const githubLoginUrl = API_URL + '/auth/github/start';
export const exchangeGitHubSession = () => api.post('/auth/github/exchange');

// Auth API
export const requestSignup = (email) => api.post('/auth/signup', { email });
export const requestPasswordReset = (email) => api.post('/auth/forgot-password', { email });
export const verifySignup = (data) => api.post('/auth/verify-email', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const updatePassword = (data) => api.put('/auth/password', data);

// Posts API
export const getAllPosts = () => api.get('/posts');
export const getPostById = (id) => api.get(`/posts/${id}`);
export const getPostBySlug = (slug) => api.get(`/posts/slug/${slug}`);
export const createPost = (data) => api.post('/posts', data);
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);

// Categories and Tags API
export const getAllCategories = () => api.get('/categories');
export const getAllTags = () => api.get('/tags');
export const getAllAuthors = () => api.get('/posts/authors/all');

// Likes API
export const likePost = (postId) => api.post(`/posts/${postId}/like`);
export const unlikePost = (postId) => api.delete(`/posts/${postId}/like`);
export const getPostLikes = (postId) => api.get(`/posts/${postId}/likes`);

// Comments API
export const createComment = (postId, data) => api.post(`/posts/${postId}/comments`, data);
export const getPostComments = (postId) => api.get(`/posts/${postId}/comments`);
export const updateComment = (id, data) => api.put(`/posts/comments/${id}`, data);
export const deleteComment = (id) => api.delete(`/posts/comments/${id}`);

// User API
export const getUserProfile = (userId) => api.get(`/users/${userId}`);
export const getUserPosts = (userId) => api.get(`/users/${userId}/posts`);
export const followUser = (userId) => api.post(`/users/${userId}/follow`);
export const unfollowUser = (userId) => api.delete(`/users/${userId}/follow`);
export const getFollowers = (userId) => api.get(`/users/${userId}/followers`);
export const getFollowing = (userId) => api.get(`/users/${userId}/following`);
export const checkFollowing = (userId) => api.get(`/users/${userId}/is-following`);

// Bookmark API
export const bookmarkPost = (postId) => api.post(`/posts/${postId}/bookmark`);
export const removeBookmark = (postId) => api.delete(`/posts/${postId}/bookmark`);
export const getUserBookmarks = () => api.get(`/posts/bookmarks`);
export const checkBookmark = (postId) => api.get(`/posts/${postId}/bookmark/check`);

// Feature API
export const featurePost = (postId) => api.post(`/posts/${postId}/featured`);
export const unfeaturePost = (postId) => api.delete(`/posts/${postId}/featured`);
export const getFeaturedPosts = () => api.get(`/posts/featured`);
export const checkFeatured = (postId) => api.get(`/posts/${postId}/featured/check`);

// Stats API
export const recordView = (postId) => api.post(`/posts/${postId}/view`);
export const recordRead = (postId) => api.post(`/posts/${postId}/read`);
export const getPostStats = (postId) => api.get(`/posts/${postId}/stats`);
export const getUserStats = (userId) => api.get(`/users/${userId}/stats`);
export const getUserPostStats = (userId) => api.get(`/users/${userId}/stats/posts`);
export const getUserStatsByDateRange = (userId, startDate, endDate) => 
  api.get(`/users/${userId}/stats/range?startDate=${startDate}&endDate=${endDate}`);

export default api;

export const generatePostDraft = (data) => api.post('/ai/draft', data, { timeout: 95000 });
export const summarizePost = (data) => api.post('/ai/summary', data, { timeout: 95000 });

export const setCommentLike = (id, liked) => liked
  ? api.put(`/posts/comments/${id}/like`)
  : api.delete(`/posts/comments/${id}/like`);

export const getNotifications = options => api.get('/notifications', options);
export const markNotificationsRead = id => api.put('/notifications/read', id === undefined ? {} : { id });
