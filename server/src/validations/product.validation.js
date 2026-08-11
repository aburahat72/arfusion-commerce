import { z } from "zod";

// Create Product Validation
export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .min(1, "Product description is required")
    .max(2000, "Product description cannot exceed 2000 characters"),

  price: z.coerce
    .number()
    .min(0, "Price cannot be negative"),

  stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),

  category: z
    .string()
    .trim()
    .min(1, "Category is required"),

  isActive: z.preprocess(
    (value) => {
      if (value === "true") return true;
      if (value === "false") return false;
      return value;
    },
    z.boolean().optional()
  ),
});


// Update Product Validation
export const updateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name cannot exceed 100 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .min(1, "Product description is required")
    .max(2000, "Product description cannot exceed 2000 characters")
    .optional(),

  price: z.coerce
    .number()
    .min(0, "Price cannot be negative")
    .optional(),

  stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .optional(),

  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .optional(),

  isActive: z.preprocess(
    (value) => {
      if (value === "true") return true;
      if (value === "false") return false;
      return value;
    },
    z.boolean().optional()
  ),
});

