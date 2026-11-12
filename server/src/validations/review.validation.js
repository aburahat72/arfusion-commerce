import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "A valid ID is required");

export const addReviewSchema = z.object({
  orderId: objectIdSchema,
  productId: objectIdSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5).max(1000),
});

export const reviewStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "removed"]),
});
