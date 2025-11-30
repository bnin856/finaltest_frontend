import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const teacherAPI = {
  getAll: (page = 1, limit = 10) => {
    return api.get(`/teachers?page=${page}&limit=${limit}`);
  },
  create: (data) => {
    return api.post('/teachers', data);
  }
};

export const positionAPI = {
  getAll: () => {
    return api.get('/teacher-positions');
  },
  create: (data) => {
    return api.post('/teacher-positions', data);
  }
};

export default api;

