export const supportCategories = [
  { value: "product_question", label: "Product question" },
  { value: "order_status", label: "Order status" },
  { value: "shipping_delivery", label: "Shipping and delivery" },
  { value: "payment", label: "Payment" },
  { value: "returns_refunds", label: "Returns and refunds" },
  { value: "account", label: "Account" },
  { value: "technical", label: "Website or technical issue" },
  { value: "other", label: "Other" },
];

export const supportStatuses = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "awaiting_customer", label: "Awaiting customer" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export const supportPriorities = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const getSupportLabel = (options, value) =>
  options.find((option) => option.value === value)?.label || value || "—";
