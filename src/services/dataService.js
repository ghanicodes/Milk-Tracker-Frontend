import api from './api';

export const farmerService = {
  add: (data) => api.post('/api/addFarmer', data),
  getAll: () => api.get('/api/getFarmers'),
  getOne: (id) => api.get(`/api/getFarmer/${id}`),
  update: (id, data) => api.put(`/api/updateFarmer/${id}`, data),
  delete: (id) => api.delete(`/api/deleteFarmer/${id}`),
  getByPhone: (phone) => api.get(`/api/getFarmerByPhone/${phone}`),
  addPayment: (id, data) => api.post(`/api/addFarmerPayment/${id}`, data),
};

export const milkService = {
  addCollection: (farmerId, data) => api.post(`/api/addMilk/${farmerId}`, data),
  getCollections: (params) => api.get('/api/getMilkCollections', { params }),
  getByFarmer: (farmerId) => api.get(`/api/getMilkCollection/${farmerId}`),
  getByDate: (farmerId, date) => api.get(`/api/getMilkCollectionByFarmerAndDate/${farmerId}/${date}`),
  getByDateRange: (farmerId, startDate, endDate) => api.get(`/api/getMilkCollectionByFarmerAndDateRange/${farmerId}/${startDate}/${endDate}`),
  updateCollection: (id, data) => api.put(`/api/updateMilkCollection/${id}`, data),
  deleteCollection: (id) => api.delete(`/api/deleteMilkCollection/${id}`),
};

export const retailerService = {
  add: (data) => api.post('/api/addRetailer', data),
  getAll: (params) => api.get('/api/getRetailer', { params }),
  getOne: (id) => api.get(`/api/getSingleRetailer/${id}`),
  update: (id, data) => api.put(`/api/updateRetailer/${id}`, data),
  delete: (id) => api.delete(`/api/deleteRetailer/${id}`),
};

export const saleMilkService = {
  add: (data) => api.post('/api/addSaleMilkRetailer', data),
  getByRetailer: (retailerId) => api.get(`/api/getSaleMilkRetailer/${retailerId}`),
  getSingle: (retailerId, saleId) => api.get(`/api/getSingleSaleMilkRetailer/${retailerId}/${saleId}`),
  getByDate: (retailerId, date) => api.get(`/api/getSaleMilkByDateRetailer/${retailerId}`, { params: { date } }),
  getByDateRange: (retailerId, startDate, endDate) => api.get(`/api/getSaleMilkByDateRangeRetailer/${retailerId}`, { params: { startDate, endDate } }),
  delete: (retailerId, saleId) => api.delete(`/api/deleteSaleMilkRetailer/${retailerId}/${saleId}`),
};

export const openRateMilkService = {
  add: (data) => api.post('/api/addOpenMilk', data),
  getAll: () => api.get('/api/getOpenMilk'),
  getOne: (id) => api.get(`/api/getOpenMilk/${id}`),
  update: (id, data) => api.put(`/api/updateOpenMilk/${id}`, data),
  delete: (id) => api.delete(`/api/deleteOpenMilk/${id}`),
};

export const homeDeliveryService = {
  add: (data) => api.post('/api/addHomeDelivery', data),
  getAll: () => api.get('/api/getAllHomeDeliveries'),
  getOne: (id) => api.get(`/api/getHomeDelivery/${id}`),
  update: (id, data) => api.put(`/api/updateHomeDelivery/${id}`, data),
  delete: (id) => api.delete(`/api/deleteHomeDelivery/${id}`),
  addDelivery: (customerId, data) => api.post(`/api/addDelivery/${customerId}`, data),
  addPayment: (customerId, data) => api.post(`/api/addPayment/${customerId}`, data),
  getMyDelivery: () => api.get('/api/myDelivery'),
};
