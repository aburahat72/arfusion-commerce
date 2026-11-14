import assert from "node:assert/strict";
import mongoose from "mongoose";
import test from "node:test";
import Order from "../src/models/order.model.js";
import Product from "../src/models/product.model.js";
import User from "../src/models/user.model.js";
import { buildCreatedAtRangeFilter } from "../src/controllers/dashboard.controller.js";

test("dashboard date filters cast with Mongoose filter sanitization enabled", (t) => {
  mongoose.set("sanitizeFilter", true);
  t.after(() => mongoose.set("sanitizeFilter", false));

  const startDate = new Date("2026-10-16T00:00:00.000Z");
  const endDate = new Date("2026-11-14T23:59:59.999Z");
  const filter = buildCreatedAtRangeFilter(startDate, endDate);
  const query = User.countDocuments({
    role: "customer",
    ...filter,
  });
  const recentOrdersQuery = Order.find(filter);
  const lowStockProductsQuery = Product.find({
    stock: mongoose.trusted({ $lte: 10 }),
  });

  assert.deepEqual(filter, {
    createdAt: mongoose.trusted({ $gte: startDate, $lte: endDate }),
  });
  assert.doesNotThrow(() => query.cast());
  assert.doesNotThrow(() => recentOrdersQuery.cast());
  assert.doesNotThrow(() => lowStockProductsQuery.cast());
});
