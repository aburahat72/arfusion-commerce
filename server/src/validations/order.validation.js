import { z } from "zod";

export const createOrderSchema = z.object({
  shippingAddress: z
    .string()
    .trim()
    .min(5, "Shipping address must be at least 5 characters")
    .max(500, "Shipping address cannot exceed 500 characters"),

  paymentMethod: z.enum(["COD", "ONLINE"], {
    errorMap: () => ({
      message: "Payment method must be COD or ONLINE",
    }),
  }),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum([
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ]),
});
