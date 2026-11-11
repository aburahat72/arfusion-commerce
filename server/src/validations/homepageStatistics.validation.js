import { z } from "zod";

const statisticValue = z.number().int().min(0).max(1_000_000_000);

export const updateHomepageStatisticsSchema = z.object({
  mode: z.enum(["automatic", "manual"]),
  manualValues: z.object({
    customers: statisticValue,
    products: statisticValue,
    satisfaction: z.number().int().min(0).max(100),
  }),
});
