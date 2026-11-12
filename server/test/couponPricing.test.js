import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCouponAvailabilityFilter,
  calculateBaseOrderAmounts,
  calculateCouponDiscount,
  isCouponEligible,
} from "../src/utils/couponPricing.js";
import mongoose from "mongoose";
import Coupon from "../src/models/coupon.model.js";

test("calculateBaseOrderAmounts preserves existing shipping and discount rules", () => {
  assert.deepEqual(calculateBaseOrderAmounts([{ price: 200, quantity: 1 }]), {
    subtotal: 200,
    shipping: 50,
    discount: 0,
  });
  assert.deepEqual(calculateBaseOrderAmounts([{ price: 3100, quantity: 1 }]), {
    subtotal: 3100,
    shipping: 0,
    discount: 250,
  });
});

test("coupon lookup filter works with the server's MongoDB filter sanitization", () => {
  const now = new Date();
  const filter = buildCouponAvailabilityFilter(
    new mongoose.Types.ObjectId(),
    now,
  );
  const query = Coupon.find(filter);
  assert.doesNotThrow(() => query._castConditions());
  assert.equal(query.getFilter().expiresAt.$gt, now);
  assert.equal(query.getFilter().$or[1].isPublic.$exists, false);
  assert.equal(JSON.stringify(filter).includes("$expr"), false);
});

test("isCouponEligible enforces private assignment, expiry, minimums and usage limits", () => {
  const now = new Date("2026-11-12T00:00:00.000Z");
  const coupon = {
    isActive: true,
    isPublic: false,
    assignedCustomers: ["customer-1"],
    expiresAt: "2026-12-01T00:00:00.000Z",
    minimumOrderAmount: 500,
    usageLimit: 2,
    usedCount: 1,
  };

  assert.equal(isCouponEligible(coupon, "customer-1", 500, now), true);
  assert.equal(isCouponEligible(coupon, "customer-2", 500, now), false);
  assert.equal(isCouponEligible(coupon, "customer-1", 499, now), false);
  assert.equal(
    isCouponEligible({ ...coupon, usedCount: 2 }, "customer-1", 500, now),
    false,
  );
  assert.equal(
    isCouponEligible(
      { ...coupon, expiresAt: "2026-11-11T00:00:00.000Z" },
      "customer-1",
      500,
      now,
    ),
    false,
  );
});

test("calculateCouponDiscount caps percentage discounts and never exceeds remaining subtotal", () => {
  assert.equal(
    calculateCouponDiscount(
      { discountType: "PERCENTAGE", discountValue: 20, maximumDiscount: 100 },
      1000,
      0,
    ),
    100,
  );
  assert.equal(
    calculateCouponDiscount(
      { discountType: "FIXED", discountValue: 500, maximumDiscount: 0 },
      300,
      250,
    ),
    50,
  );
});
