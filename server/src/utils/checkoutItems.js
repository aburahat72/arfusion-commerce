import mongoose from "mongoose";

export class CheckoutInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "CheckoutInputError";
    this.statusCode = 400;
  }
}

export const normalizeCheckoutItems = (items) => {
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    throw new CheckoutInputError("Provide between 1 and 100 order items.");
  }

  const quantities = new Map();
  for (const item of items) {
    const rawProductId = item?.productId ?? item?.product;
    const quantity = item?.quantity;
    if (
      typeof rawProductId !== "string" ||
      !mongoose.Types.ObjectId.isValid(rawProductId)
    ) {
      throw new CheckoutInputError("Invalid product ID.");
    }
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      throw new CheckoutInputError("Product quantity must be a positive whole number.");
    }

    const productId = rawProductId.toLowerCase();
    const combinedQuantity = (quantities.get(productId) || 0) + quantity;
    if (!Number.isSafeInteger(combinedQuantity)) {
      throw new CheckoutInputError("Combined product quantity is too large.");
    }
    quantities.set(productId, combinedQuantity);
  }

  return [...quantities].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
};
