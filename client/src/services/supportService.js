import customerApi from "./customerApi";
import adminApi from "./adminApi";

export const getMySupportTickets = (params = {}) =>
  customerApi.get("/support/mine", { params });

export const getMySupportTicket = (ticketId, params = {}) =>
  customerApi.get(`/support/${ticketId}`, { params });

export const createSupportTicket = (ticket) =>
  customerApi.post("/support", ticket);

export const sendCustomerSupportMessage = (ticketId, body) =>
  customerApi.post(`/support/${ticketId}/messages`, { body });

export const getAdminSupportTickets = (params = {}) =>
  adminApi.get("/support/admin", { params });

export const getAdminSupportAgents = () =>
  adminApi.get("/support/admin/agents");

export const getAdminSupportTicket = (ticketId, params = {}) =>
  adminApi.get(`/support/admin/${ticketId}`, { params });

export const sendAdminSupportMessage = (ticketId, body, isInternal = false) =>
  adminApi.post(`/support/admin/${ticketId}/messages`, { body, isInternal });

export const updateAdminSupportTicket = (ticketId, updates) =>
  adminApi.patch(`/support/admin/${ticketId}`, updates);
