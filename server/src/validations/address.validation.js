import { z } from "zod";

// Add Address
export const addAddressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),

  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits"),

  addressLine: z
    .string()
    .trim()
    .min(5, "Address is required")
    .max(255, "Address cannot exceed 255 characters"),

  city: z
    .string()
    .trim()
    .min(2, "City is required")
    .max(100, "City cannot exceed 100 characters"),

  state: z
    .string()
    .trim()
    .min(2, "State is required")
    .max(100, "State cannot exceed 100 characters"),

  postalCode: z
    .string()
    .trim()
    .min(4, "Postal code is required")
    .max(10, "Postal code cannot exceed 10 characters"),

  country: z
    .string()
    .trim()
    .min(2, "Country is required")
    .max(100, "Country cannot exceed 100 characters")
    .optional(),

  isDefault: z.boolean().optional(),
});

// Update Address
export const updateAddressSchema = addAddressSchema.partial();
