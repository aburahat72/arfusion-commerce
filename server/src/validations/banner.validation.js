import { z } from "zod";

// =====================================================
// COMMON STRING
// =====================================================

const requiredString = (message, max) =>
  z.string().trim().min(1, message).max(max, `Cannot exceed ${max} characters`);

// =====================================================
// BUTTON
// =====================================================

const buttonSchema = z.object({
  text: requiredString("Button text is required", 50),

  link: requiredString("Button link is required", 500),
});

// =====================================================
// STAT
// =====================================================

const statSchema = z.object({
  value: requiredString("Statistic value is required", 50),

  label: requiredString("Statistic label is required", 100),
});

// =====================================================
// COLORS
// =====================================================

const colorsSchema = z.object({
  blue: requiredString("Blue color is required", 30),

  lavender: requiredString("Lavender color is required", 30),

  pink: requiredString("Pink color is required", 30),

  body: requiredString("Body color is required", 30),

  inner: requiredString("Inner color is required", 30),

  innerPink: requiredString("Inner pink color is required", 30),

  platform: requiredString("Platform color is required", 30),
});

// =====================================================
// JSON FIELD PREPROCESSOR
// =====================================================

const parseJson = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

// =====================================================
// IMAGE ALT TEXT
//
// IMPORTANT:
// Actual image files come from multer -> req.files.
// Therefore image objects are NOT validated here.
// =====================================================

const imageAltFields = {
  mainProductAlt: z
    .string()
    .trim()
    .max(200, "Main product alt text cannot exceed 200 characters")
    .optional(),

  topLeftAlt: z
    .string()
    .trim()
    .max(200, "Top-left alt text cannot exceed 200 characters")
    .optional(),

  topRightAlt: z
    .string()
    .trim()
    .max(200, "Top-right alt text cannot exceed 200 characters")
    .optional(),

  bottomLeftAlt: z
    .string()
    .trim()
    .max(200, "Bottom-left alt text cannot exceed 200 characters")
    .optional(),

  bottomRightAlt: z
    .string()
    .trim()
    .max(200, "Bottom-right alt text cannot exceed 200 characters")
    .optional(),
};

// =====================================================
// SLUG
// =====================================================

const slugSchema = z
  .string()
  .trim()
  .min(2, "Banner slug must be at least 2 characters")
  .max(100, "Banner slug cannot exceed 100 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Banner slug must contain only lowercase letters, numbers and hyphens",
  );

// =====================================================
// CREATE
// =====================================================

export const createBannerSchema = z.object({
  // ---------------------------------------------------
  // Content
  // ---------------------------------------------------

  slug: slugSchema,

  badge: requiredString("Banner badge is required", 100),

  titleStart: requiredString("Banner title start is required", 100),

  titleHighlight: requiredString("Banner highlighted title is required", 100),

  titleEnd: requiredString("Banner title end is required", 100),

  description: requiredString("Banner description is required", 2000),

  // ---------------------------------------------------
  // Image ALT TEXT
  // ---------------------------------------------------

  ...imageAltFields,

  // ---------------------------------------------------
  // Buttons
  // ---------------------------------------------------

  primaryButton: z.preprocess(parseJson, buttonSchema),

  secondaryButton: z.preprocess(parseJson, buttonSchema),

  // ---------------------------------------------------
  // Stats
  // ---------------------------------------------------

  stats: z.preprocess(
    parseJson,
    z.array(statSchema).max(3, "Maximum 3 statistics are allowed"),
  ),

  // ---------------------------------------------------
  // Colors
  // ---------------------------------------------------

  colors: z.preprocess(parseJson, colorsSchema),

  // ---------------------------------------------------
  // Admin
  // ---------------------------------------------------

  isActive: z
    .preprocess((value) => {
      if (value === "true") return true;

      if (value === "false") return false;

      return value;
    }, z.boolean())
    .optional(),

  sortOrder: z.coerce
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order cannot be negative")
    .optional(),
});

// =====================================================
// UPDATE
// =====================================================

export const updateBannerSchema = z.object({
  // ---------------------------------------------------
  // Content
  // ---------------------------------------------------

  slug: slugSchema.optional(),

  badge: requiredString("Banner badge is required", 100).optional(),

  titleStart: requiredString("Banner title start is required", 100).optional(),

  titleHighlight: requiredString(
    "Banner highlighted title is required",
    100,
  ).optional(),

  titleEnd: requiredString("Banner title end is required", 100).optional(),

  description: requiredString(
    "Banner description is required",
    2000,
  ).optional(),

  // ---------------------------------------------------
  // Image ALT TEXT
  // ---------------------------------------------------

  ...imageAltFields,

  // ---------------------------------------------------
  // Buttons
  // ---------------------------------------------------

  primaryButton: z.preprocess(parseJson, buttonSchema).optional(),

  secondaryButton: z.preprocess(parseJson, buttonSchema).optional(),

  // ---------------------------------------------------
  // Stats
  // ---------------------------------------------------

  stats: z
    .preprocess(
      parseJson,
      z.array(statSchema).max(3, "Maximum 3 statistics are allowed"),
    )
    .optional(),

  // ---------------------------------------------------
  // Colors
  // ---------------------------------------------------

  colors: z.preprocess(parseJson, colorsSchema).optional(),

  // ---------------------------------------------------
  // Admin
  // ---------------------------------------------------

  isActive: z
    .preprocess((value) => {
      if (value === "true") return true;

      if (value === "false") return false;

      return value;
    }, z.boolean())
    .optional(),

  sortOrder: z.coerce
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order cannot be negative")
    .optional(),
});
