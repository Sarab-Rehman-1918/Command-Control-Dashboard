import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
};

// Users endpoints
export const users = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  getByRole: (role) => api.get(`/users/role/${role}`),
};

// Routes endpoints
export const routes = {
  getAll: () => api.get('/routes'),
  getById: (id) => api.get(`/routes/${id}`),
  create: (routeData) => api.post('/routes', routeData),
  update: (id, routeData) => api.put(`/routes/${id}`, routeData),
  delete: (id) => api.delete(`/routes/${id}`),
  getPerformance: (id) => api.get(`/routes/${id}/performance`),
};

// Trips endpoints
export const trips = {
  getAll: () => api.get('/trips'),
  getById: (id) => api.get(`/trips/${id}`),
  create: (tripData) => api.post('/trips', tripData),
  update: (id, tripData) => api.put(`/trips/${id}`, tripData),
  delete: (id) => api.delete(`/trips/${id}`),
  getByStatus: (status) => api.get(`/trips/status/${status}`),
  getActive: () => api.get('/trips/active/list'),
};

// Buses endpoints
export const buses = {
  getLocations: () => api.get('/buses/locations'),
  getLocationHistory: (busId) => api.get(`/buses/locations/${busId}`),
  addLocation: (locationData) => api.post('/buses/locations', locationData),
  getTripLocations: (tripId) => api.get(`/buses/locations/trip/${tripId}`),
  getFleetStats: () => api.get('/buses/fleet/stats'),
  getList: () => api.get('/buses/list'),
};

// Incidents endpoints
export const incidents = {
  getAll: () => api.get('/incidents'),
  getById: (id) => api.get(`/incidents/${id}`),
  create: (incidentData) => api.post('/incidents', incidentData),
  update: (id, incidentData) => api.put(`/incidents/${id}`, incidentData),
  delete: (id) => api.delete(`/incidents/${id}`),
  getByStatus: (status) => api.get(`/incidents/status/${status}`),
  getBySeverity: (severity) => api.get(`/incidents/severity/${severity}`),
  getStats: () => api.get('/incidents/stats/summary'),
};

// Alerts endpoints
export const alerts = {
  getAll: () => api.get('/alerts'),
  getById: (id) => api.get(`/alerts/${id}`),
  create: (alertData) => api.post('/alerts', alertData),
  update: (id, alertData) => api.put(`/alerts/${id}`, alertData),
  delete: (id) => api.delete(`/alerts/${id}`),
  getByType: (type) => api.get(`/alerts/type/${type}`),
  getByRole: (role) => api.get(`/alerts/role/${role}`),
  getRecent: () => api.get('/alerts/recent/list'),
};

// Tickets endpoints
export const tickets = {
  getAll: () => api.get('/tickets'),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (ticketData) => api.post('/tickets', ticketData),
  update: (id, ticketData) => api.put(`/tickets/${id}`, ticketData),
  delete: (id) => api.delete(`/tickets/${id}`),
};

// Analytics endpoints
export const analytics = {
  getDashboardSummary: () => api.get('/analytics/dashboard/summary'),
  getRevenue: (period) => api.get(`/analytics/revenue?period=${period}`),
  getBookings: (period) => api.get(`/analytics/bookings?period=${period}`),
  getRoutePerformance: () => api.get('/analytics/routes/performance'),
  getIncidentTrends: () => api.get('/analytics/incidents/trends'),
  getBusUtilization: () => api.get('/analytics/buses/utilization'),
  getPaymentDistribution: () => api.get('/analytics/payments/distribution'),
};

export default api;