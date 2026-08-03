import { z } from "zod";

export const requestReturnSchema = z.object({
  returnReason: z
    .string()
    .trim()
    .min(10, "Return reason must be at least 10 characters")
    .max(500, "Return reason cannot exceed 500 characters"),

  requestType: z.enum(["Refund", "Replacement"], {
    errorMap: () => ({
      message: "Request type must be Refund or Replacement",
    }),
  }),
});

export const approveReturnSchema = z.object({
  action: z.enum(["Approved", "Rejected"], {
    errorMap: () => ({
      message: "Action must be Approved or Rejected",
    }),
  }),
});
