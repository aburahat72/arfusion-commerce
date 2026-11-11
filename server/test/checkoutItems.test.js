import assert from "node:assert/strict";
import test from "node:test";
import { CheckoutInputError, normalizeCheckoutItems } from "../src/utils/checkoutItems.js";

test("normalizeCheckoutItems merges duplicate product IDs case-insensitively", () => {
  const items = normalizeCheckoutItems([
    { productId: "507f1f77bcf86cd799439011", quantity: 2 },
    { product: "507F1F77BCF86CD799439011", quantity: 3 },
  ]);

  assert.deepEqual(items, [
    { productId: "507f1f77bcf86cd799439011", quantity: 5 },
  ]);
});

test("normalizeCheckoutItems rejects invalid IDs and quantities", () => {
  assert.throws(
    () => normalizeCheckoutItems([{ productId: "not-an-id", quantity: 1 }]),
    CheckoutInputError,
  );
  assert.throws(
    () => normalizeCheckoutItems([
      { productId: "507f1f77bcf86cd799439011", quantity: 1.5 },
    ]),
    CheckoutInputError,
  );
});
