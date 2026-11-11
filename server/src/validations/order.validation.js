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
    .min(1, "At least one product is required")
    .max(100, "An order cannot contain more than 100 line items"),

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

  paymentMethod: z.literal("COD", {
    errorMap: () => ({
      message: "Online payment orders must use the Razorpay verification flow",
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
