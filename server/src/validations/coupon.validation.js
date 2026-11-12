import { z } from "zod";

const couponFields = {
  code: z
    .string()
    .trim()
    .min(3, "Coupon code must be at least 3 characters")
    .max(20, "Coupon code cannot exceed 20 characters")
    .transform((value) => value.toUpperCase()),

  description: z.string().trim().max(200).optional(),

  discountType: z.enum(["PERCENTAGE", "FIXED"], {
    errorMap: () => ({
      message: "Discount type must be PERCENTAGE or FIXED",
    }),
  }),

  discountValue: z.number().positive("Discount value must be greater than 0"),

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

  isPublic: z.boolean().optional(),

  assignedCustomers: z.array(z.string().min(1)).optional(),
};

// Create Coupon
export const createCouponSchema = z.object(couponFields).superRefine((data, ctx) => {
  if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discountValue"],
      message: "Percentage discount cannot exceed 100%",
    });
  }
  if (data.isPublic === false && !data.assignedCustomers?.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["assignedCustomers"],
      message: "Assign at least one customer to a private coupon",
    });
  }
});

// Update Coupon
export const updateCouponSchema = z.object(couponFields).partial().superRefine((data, ctx) => {
  if (
    data.discountType === "PERCENTAGE" &&
    data.discountValue !== undefined &&
    data.discountValue > 100
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discountValue"],
      message: "Percentage discount cannot exceed 100%",
    });
  }
});
