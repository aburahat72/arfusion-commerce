import express from "express";
import {
  addAdminSupportMessage,
  addCustomerSupportMessage,
  createSupportTicket,
  getAdminSupportTicket,
  getAdminSupportTickets,
  getCustomerTicket,
  getCustomerTickets,
  getSupportAgents,
  updateAdminSupportTicket,
} from "../controllers/support.controller.js";
import {
  protectedRoute as customerProtectedRoute,
} from "../middleware/customerAuth.middleware.js";
import {
  authorize as adminAuthorize,
  protectedRoute as adminProtectedRoute,
} from "../middleware/adminAuth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  adminSupportMessageSchema,
  createSupportTicketSchema,
  supportMessageSchema,
  updateSupportTicketSchema,
} from "../validations/support.validation.js";

const router = express.Router();

router.get(
  "/admin",
  adminProtectedRoute,
  adminAuthorize("admin"),
  getAdminSupportTickets,
);
router.get(
  "/admin/agents",
  adminProtectedRoute,
  adminAuthorize("admin"),
  getSupportAgents,
);
router.get(
  "/admin/:ticketId",
  adminProtectedRoute,
  adminAuthorize("admin"),
  getAdminSupportTicket,
);
router.patch(
  "/admin/:ticketId",
  adminProtectedRoute,
  adminAuthorize("admin"),
  validate(updateSupportTicketSchema),
  updateAdminSupportTicket,
);
router.post(
  "/admin/:ticketId/messages",
  adminProtectedRoute,
  adminAuthorize("admin"),
  validate(adminSupportMessageSchema),
  addAdminSupportMessage,
);

router.get("/mine", customerProtectedRoute, getCustomerTickets);
router.get("/:ticketId", customerProtectedRoute, getCustomerTicket);
router.post(
  "/",
  customerProtectedRoute,
  validate(createSupportTicketSchema),
  createSupportTicket,
);
router.post(
  "/:ticketId/messages",
  customerProtectedRoute,
  validate(supportMessageSchema),
  addCustomerSupportMessage,
);

export default router;
