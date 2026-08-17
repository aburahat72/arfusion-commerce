export function calculateOrderSummary(cartItems = []) {
  const subtotal = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );

  const shipping = subtotal === 0 ? 0 : subtotal >= 500 ? 0 : 50;

  const discount = subtotal > 3000 ? 250 : 0;

  const total = subtotal + shipping - discount;

  return {
    subtotal,
    shipping,
    discount,
    total,
  };
}
