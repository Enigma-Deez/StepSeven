import axios from './axios';

export const transactionAPI = {
  getAll: (params) => axios.get('/transactions', { params }),
  getById: (id) => axios.get(`/transactions/${id}`),
  create: (data) => axios.post('/transactions', data),
  update: (id, data) => axios.put(`/transactions/${id}`, data),
  delete: (id) => axios.delete(`/transactions/${id}`)
};