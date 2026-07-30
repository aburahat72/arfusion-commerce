import { z } from "zod";

// Create Coupon
export const createCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Coupon code must be at least 3 characters")
    .max(20, "Coupon code cannot exceed 20 characters")
    .transform((value) => value.toUpperCase()),

  discountType: z.enum(["PERCENTAGE", "FIXED"], {
    errorMap: () => ({
      message: "Discount type must be PERCENTAGE or FIXED",
    }),
  }),

  discountValue: z
    .number({
      required_error: "Discount value is required",
    })
    .positive("Discount value must be greater than 0"),

  minimumOrderAmount: z
    .number()
    .min(0, "Minimum order amount cannot be negative")
    .optional(),

  maximumDiscount: z
    .number()
    .min(0, "Maximum discount cannot be negative")
    .optional(),

  usageLimit: z
    .number()
    .int("Usage limit must be an integer")
    .min(0, "Usage limit cannot be negative")
    .optional(),

  expiresAt: z.string().datetime("Invalid expiry date"),

  isActive: z.boolean().optional(),
});

// Update Coupon
export const updateCouponSchema = createCouponSchema.partial();
