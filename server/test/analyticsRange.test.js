import assert from "node:assert/strict";
import test from "node:test";
import { resolveAnalyticsRange } from "../src/controllers/analytics.controller.js";

test("resolveAnalyticsRange parses valid UTC calendar days inclusively", () => {
  const { startDate, endDate } = resolveAnalyticsRange(
    "2024-02-29",
    "2024-02-29",
  );

  assert.equal(startDate.toISOString(), "2024-02-29T00:00:00.000Z");
  assert.equal(endDate.toISOString(), "2024-02-29T23:59:59.999Z");
});

test("resolveAnalyticsRange rejects invalid, reversed, and oversized ranges", () => {
  assert.throws(() => resolveAnalyticsRange("2023-02-29", "2023-03-01"));
  assert.throws(() => resolveAnalyticsRange("2024-03-02", "2024-03-01"));
  assert.throws(() => resolveAnalyticsRange("2023-01-01", "2024-02-01"));
});
