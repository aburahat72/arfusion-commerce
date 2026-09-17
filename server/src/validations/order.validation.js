import { z } from "zod";

// =====================================================
// CREATE ORDER VALIDATION
// =====================================================

export const createOrderSchema = z.object({
  // ---------------------------------------------------
  // ORDER ITEMS
  // ---------------------------------------------------

  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),

        quantity: z
          .number({
            required_error: "Quantity is required",
            invalid_type_error: "Quantity must be a number",
          })
          .int("Quantity must be a whole number")
          .min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "At least one product is required"),

  // ---------------------------------------------------
  // SHIPPING ADDRESS
  // ---------------------------------------------------

  shippingAddress: z
    .string()
    .trim()
    .min(5, "Shipping address must be at least 5 characters")
    .max(500, "Shipping address cannot exceed 500 characters"),

  // ---------------------------------------------------
  // PAYMENT METHOD
  // ---------------------------------------------------

  paymentMethod: z.enum(["COD", "ONLINE"], {
    errorMap: () => ({
      message: "Payment method must be COD or ONLINE",
    }),
  }),
});

// =====================================================
// UPDATE ORDER STATUS VALIDATION
// =====================================================

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum([
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ]),
});
