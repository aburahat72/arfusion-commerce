import { z } from "zod";
import {
  SUPPORT_CATEGORIES,
  SUPPORT_PRIORITIES,
  SUPPORT_STATUSES,
} from "../models/supportTicket.model.js";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "A valid ID is required");

export const createSupportTicketSchema = z.object({
  subject: z.string().trim().min(5).max(120),
  category: z.enum(SUPPORT_CATEGORIES),
  orderId: objectIdSchema.nullable().optional(),
  message: z.string().trim().min(10).max(5000),
});

export const supportMessageSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

export const adminSupportMessageSchema = z.object({
  body: z.string().trim().min(1).max(5000),
  isInternal: z.boolean().default(false),
});

export const updateSupportTicketSchema = z
  .object({
    status: z.enum(SUPPORT_STATUSES).optional(),
    priority: z.enum(SUPPORT_PRIORITIES).optional(),
    assignedTo: objectIdSchema.nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one support ticket field must be provided",
  });
