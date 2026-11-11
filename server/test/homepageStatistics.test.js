import assert from "node:assert/strict";
import test from "node:test";
import { calculateSatisfactionPercent } from "../src/controllers/homepageStatistics.controller.js";
import { updateHomepageStatisticsSchema } from "../src/validations/homepageStatistics.validation.js";

test("calculateSatisfactionPercent converts average ratings to a percentage", () => {
  assert.equal(calculateSatisfactionPercent(4.95), 99);
  assert.equal(calculateSatisfactionPercent(4.25), 85);
  assert.equal(calculateSatisfactionPercent(0), 0);
});

test("calculateSatisfactionPercent handles missing and out-of-range ratings", () => {
  assert.equal(calculateSatisfactionPercent(undefined), 0);
  assert.equal(calculateSatisfactionPercent(-1), 0);
  assert.equal(calculateSatisfactionPercent(6), 100);
});

test("homepage statistics updates validate mode and independent manual values", () => {
  const valid = {
    mode: "manual",
    manualValues: {
      customers: 20_000,
      products: 10_000,
      satisfaction: 99,
    },
  };

  assert.equal(updateHomepageStatisticsSchema.safeParse(valid).success, true);
  assert.equal(
    updateHomepageStatisticsSchema.safeParse({
      ...valid,
      manualValues: { ...valid.manualValues, satisfaction: 101 },
    }).success,
    false,
  );
  assert.equal(
    updateHomepageStatisticsSchema.safeParse({
      ...valid,
      manualValues: { ...valid.manualValues, customers: 20.5 },
    }).success,
    false,
  );
});
