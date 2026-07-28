import { z } from "zod";

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
    .max(2000, "Description cannot exceed 2000 characters"),

  price: z.number().min(0, "Price cannot be negative"),

  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),

  category: z.string().trim().min(1, "Category is required"),

  images: z.array(z.string()).optional(),
});

// Update Product Validation Schema
// Used when an admin updates an existing product.
//
// All fields are optional because the admin may update only one
// or a few fields instead of sending the entire product again.
//
// Example:
// PATCH /api/products/:id
// Body: { price: 499 }
//
// Only the provided fields are validated.
// Fields that are not provided remain unchanged in the database.
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
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),

  price: z.number().min(0, "Price cannot be negative").optional(),

  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .optional(),

  category: z.string().trim().min(1, "Category is required").optional(),

  images: z.array(z.string()).optional(),

  // Allows admin to activate/deactivate a product
  // without permanently deleting it.
  isActive: z.boolean().optional(),
});
