import assert from "node:assert/strict";
import mongoose from "mongoose";
import test from "node:test";
import Product from "../src/models/product.model.js";
import User from "../src/models/user.model.js";
import {
  buildCustomerDateFilter,
  buildLowStockFilter,
  resolveAnalyticsRange,
} from "../src/controllers/analytics.controller.js";

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

test("analytics filters cast correctly with Mongoose filter sanitization enabled", (t) => {
  mongoose.set("sanitizeFilter", true);
  t.after(() => mongoose.set("sanitizeFilter", false));

  const { startDate, endDate } = resolveAnalyticsRange(
    "2026-10-16",
    "2026-11-14",
  );
  const customerQuery = User.countDocuments(
    buildCustomerDateFilter(startDate, endDate),
  );
  const lowStockQuery = Product.find(buildLowStockFilter());

  assert.doesNotThrow(() => customerQuery.cast());
  assert.doesNotThrow(() => lowStockQuery.cast());
});
